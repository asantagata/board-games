import context from "@/context.js";
import connection, { MessageTypes } from "@/connection.js";
import Actions, { ContinuityTypes } from "@/data/Actions.js";
import ActionIDs from "@/data/ActionIDs.js";
import Roles, { RoleIDs } from "@/data/Roles.js";
import Ripples, { RippleIDs } from "@/data/Ripples.js";
import Artifacts from "@/data/Artifacts.js";
import { broadcast } from "@client/controls.js";
import Teams, { getPlayerTeamId } from "@/data/Teams.js";
import { evaluatePlayerWin } from "@/utils/win.js";
import { recomputeGamePositions } from "@/components/Game.js";
/** @import { Server, Config, Player, Pip } from "@/types.js" */

function shuffle(array) {
    for (let i = array.length - 1; i >= 1; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/** 
 * @constructor
 * @param {Config?} config 
 * @returns {Server} */
function ServerGameObject(config = context.config) {
    this.request = {};
    this.center = {
        id: -1,
        cards: [],
        artifacts: []
    };
    if (config.roleCounts[RoleIDs.CURATOR])
        this.center.artifacts = shuffle(Object.entries(config.artifacts).filter(([_,a]) => a).map(([a]) => ({...Artifacts[+a]}))).map((a, i) => ({...a, centerIndex: i}));
    this.players = config.members.map((m, id) => ({
        ...(() => { let {cardCount, ...mem} = m; return mem; })(),
        cards: [],
        id,
        artifact: null,
        alive: true,
    }));
    this.owners = {[-1]: this.center, ...Object.fromEntries(this.players.map(p => [p.id, p]))};

    let shuffledRoleIDs = [], detract1Werewolf = false;
    if (config.roleCounts[RoleIDs.ALPHA_WOLF]) {
        shuffledRoleIDs.push(RoleIDs.WEREWOLF);
        detract1Werewolf = true;
    }
    const roleIDs = Object.keys(config.roleCounts).flatMap(r => Array.from(
        {length: config.roleCounts[r] - +(detract1Werewolf && +r === RoleIDs.WEREWOLF)}, () => +r));
    shuffledRoleIDs.push(...shuffle(roleIDs));

    if (config.testingRoleIds)
        shuffledRoleIDs = [...shuffledRoleIDs, ...config.testingRoleIds].slice(-1 * shuffledRoleIDs.length);

    this.cards = shuffledRoleIDs.map((rId, idx) => ({
        id: idx,
        role: Roles[rId],
        atInit: {},
        atNow: {},
        details: {},
        team: Roles[rId].team,
        shielded: false,
        faceUp: false
    }));

    this.rippleIds = Object.entries(config.ripples).filter(([_, i]) => i).map(([r]) => +r);
    this.ripple = Ripples[this.rippleIds[Math.floor(Math.random() * this.rippleIds.length)]] ?? null;
    this.phase = null;

    let cardIndex = 0;
    for (const owner of [this.center, ...this.players]) {
        let capacity = config.members[owner.id]?.cardCount ?? (config.centerCount + +config.roleCounts[RoleIDs.ALPHA_WOLF]);
        for (let index = 0; index < capacity; index++) {
            this.cards[cardIndex].atInit = {owner, index};
            this.cards[cardIndex].atNow = {owner, index};
            owner.cards.push(this.cards[cardIndex]);
            cardIndex++;
        }
    }

    const actionMapping = {};
    for (const card of this.cards.filter(c => c.atInit.owner !== this.center)) {
        for (const actionId of card.role.actionIds) {
            actionMapping[actionId] = {action: Actions[actionId], players: {
                ...(actionMapping[actionId]?.players ?? {}),
                [card.atInit.owner.id]: [...(actionMapping[actionId]?.players[card.atInit.owner.id] ?? []), card.atInit.index]
            }};
        }
    }

    const actionsInOrder = this.cards.flatMap(c => c.role.actionIds.map(a => Actions[a])).sort((a,b) => a.id - b.id);
    context.misc.firstWritingActionID = actionsInOrder.find(a => a.continuityType === ContinuityTypes.WRITE_ONLY || a.continuityType === ContinuityTypes.READ_WRITE)?.id;
    context.misc.phaseCanStartWithNonFirstReadingAction = false; // SET THIS TO "FALSE" ON START OF TIMELOOP

    this.actionQueue = Object.values(actionMapping).sort((a, b) => a.action.id - b.action.id);
    if (this.ripple) {
        const rippleActions = this.ripple?.getRippleActions([...this.actionQueue], this.players) ?? [];
        this.actionQueue.push({
            action: Actions[ActionIDs.GENERAL$NOTIFY_RIPPLE],
            players: Object.fromEntries(Array.from({length: this.players.length}, (_, i) => [i, []]))
        });
        this.actionQueue.push(...rippleActions);
    }

    const allPlayersObj = Object.fromEntries(Array.from({length: this.players.length}, (_, i) => [i, []]));
    this.actionQueue.push(
        {action: Actions[ActionIDs.GENERAL$PREPARE_TO_VOTE], players: allPlayersObj}, 
        {action: Actions[ActionIDs.GENERAL$VOTE], players: allPlayersObj}
    );

    this.actingCardLocation = null;
    this.actingPlayer = null;
    this.actingAction = null;
    this.phaseParams = {};
}

export function startGame() {
    context.game = new ServerGameObject();
    startNextPhase();
}

export function startNextPhase() {
    context.game.phaseParams = {};
    context.game.phase = [];
    let allowedContinuities = {
        [ContinuityTypes.IS_OWN_PHASE]: true,
        [ContinuityTypes.READ_WRITE]: true,
        [ContinuityTypes.READ_ONLY]: true,
        [ContinuityTypes.WRITE_ONLY]: true,
    };
    if (context.game.actionQueue.length === 0) {
        console.log('GAME OVER!');
        return;
    }
    while (context.game.actionQueue.length > 0) {
        const action = context.game.actionQueue[0];
        if (!allowedContinuities[action.action.continuityType]) break;

        if (!context.misc.phaseCanStartWithNonFirstReadingAction && (
                action.action.continuityType === ContinuityTypes.READ_ONLY 
                || action.action.continuityType === ContinuityTypes.READ_WRITE
            ) && action.action.id > context.misc.firstWritingActionID) {
            context.misc.phaseCanStartWithNonFirstReadingAction = true;
            break;
        }

        context.game.phase.push(context.game.actionQueue.shift());
        if (action.alwaysEndsPhase)
            allowedContinuities = {};
        else switch (action.action.continuityType) {
            case ContinuityTypes.IS_OWN_PHASE: allowedContinuities = {}; break;
            case ContinuityTypes.READ_WRITE:
            case ContinuityTypes.WRITE_ONLY:
                allowedContinuities = {[ContinuityTypes.WRITE_ONLY]: true}; break;
            case ContinuityTypes.READ_ONLY:
                allowedContinuities = {
                    [ContinuityTypes.READ_WRITE]: true,
                    [ContinuityTypes.READ_ONLY]: true,
                    [ContinuityTypes.WRITE_ONLY]: true
                };
        }
    }
    if (context.game.phase?.[0]?.action?.continuityType === ContinuityTypes.IS_OWN_PHASE) {
        serverHandleSpecialPhaseStart();
    }
    connection.sendMessage(MessageTypes.START_PHASE);
    context.rerender();
}

function serverHandleSpecialPhaseStart() {
    switch (context.game.phase[0].action.id) {
        // reveal ripple
        case ActionIDs.GENERAL$NOTIFY_RIPPLE: {
            if (context.game.ripple?.id === RippleIDs.TIME_LOOP)
                context.misc.phaseCanStartWithNonFirstReadingAction = false;
            context.misc.displayRipple = true;
            context.rerender();
            break;
        }

        // server-side game display + host can now use pips
        case ActionIDs.GENERAL$PREPARE_TO_VOTE: {
            context.misc.pips = [
                ...shuffle([...context.game.center.artifacts.filter(a => a), ...context.game.players.filter(p => p.artifact).map(p => p.artifact)]).map(a => ({type: "ARTIFACT", itemId: a.id})),
                ...shuffle(context.game.cards).map(c => ({type: "ROLE", itemId: c.role.id})),
            ].map((p, i) => ({...p, id: i + 1, greyscale: false}));
            context.misc.showingGame = true;
            context.rerender();
        }
    }
}

async function serverHandleSpecialPhaseEnd() {
    switch (context.game.phase[0].action.id) {
        // evaluate votes, reveal deaths
        case ActionIDs.GENERAL$VOTE: {
            const playerVotes = Object.entries(context.game.phaseParams).map(([voterId, {[ActionIDs.GENERAL$VOTE]: [forId]}]) => ({voter: context.game.players[voterId], for: context.game.players[forId]}));
            await doVotingCeremony(playerVotes);
        }
    }
}

export async function endPhase() {
    if (context.game.phase?.[0]?.action?.continuityType === ContinuityTypes.IS_OWN_PHASE) 
        await serverHandleSpecialPhaseEnd();
    else for (const {action, players: playerIndexObj} of context.game.phase) {
        if (action.continuityType === ContinuityTypes.READ_ONLY || action.dontRecreateOnServer) continue;
        context.game.actingAction = action;
        const actingPlayerId = +Object.keys(playerIndexObj)[0];
        context.game.actingPlayer = context.game.players[actingPlayerId] ?? null;
        if (context.game.actingPlayer)
            context.game.actingCardLocation = {
                owner: context.game.players[actingPlayerId],
                index: playerIndexObj?.[actingPlayerId]?.[0]
            }
        await action.do(context.game);
    }
    startNextPhase();
}

/**
 * Do server-side voting ceremony
 * @param {{voter: Player, for: Player}[]} votes 
 */
async function doVotingCeremony(votes) {
    // what's the rush?
    await wait(200);

    // display & accumulate votes, async
    context.misc.showTerminal = true;
    context.misc.voters = {};
    for (const vote of votes) {
        if (context.misc.voters[vote.for.id]) context.misc.voters[vote.for.id].push(vote.voter); 
        else context.misc.voters[vote.for.id] = [vote.voter];

        context.misc.selectedPlayer = vote.for;
        broadcast({body: [vote.voter, " votes for ", vote.for, "!"]});
        recomputeGamePositions();
        
        await wait(500);
    }
    context.misc.selectedPlayer = null;
    recomputeGamePositions();

    // compute deaths
    const maxVotes = Math.max(...Object.values(context.misc.voters).map(v => v.length));
    const deadPlayers = Object.keys(context.misc.voters).length === context.game.players.length ? []
        : Object.keys(context.misc.voters)
            .filter(p => context.misc.voters[p].length === maxVotes)
            .map(p => context.game.players[p]);

    // display deaths, async
    if (deadPlayers.length) {
        for (const player of deadPlayers) {
            player.alive = false;
            context.misc.selectedPlayer = player;
            broadcast({body: [player, " dies!"]});
            recomputeGamePositions();
            await wait(1000);
        }
    } else {
        broadcast({body: "All players received one vote, so no one dies!"});
        await wait(1000);
    }
    context.misc.selectedPlayer = null;
    recomputeGamePositions();

    // reveal all & display win/lose msg
    context.misc.showAll = true;
    context.misc.playerTeams = Object.fromEntries(context.game.players.map(p => [p.id, Teams[p.artifact?.teamId ?? getPlayerTeamId(p)]]))
    context.misc.playerWins = Object.fromEntries(context.game.players.map(p => [p.id, evaluatePlayerWin(p)]));
    const winners = context.game.players.filter(p => context.misc.playerWins[p.id]);
    recomputeGamePositions();
    if (winners.length === context.game.players.length) broadcast({body: "Everyone has won!"});
    else if (winners.length) broadcast({body: [winners, ` ${winners.length === 1 ? 'has' : 'have'} won!`]});
    else broadcast({body: "Everyone has lost!"});
    recomputeGamePositions();
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));