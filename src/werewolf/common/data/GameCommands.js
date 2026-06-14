import context from "@/context.js";
import { broadcast, broadcastAndAwaitOK, broadcastAndAwaitDecision } from "@client/controls.js";
import { awaitRequest, prepareRequest } from "@client/request.js";
import { cardinals } from "@/utils/markdown.js";
import { TeamIDs } from "@/data/Teams.js";
/** @import { CardLocation, Card, param, Player, Action, Markdown, Artifact } from "@/types.js" */

/** 
 * Options for GameCommands.playerChooseCard.
 * Note these implicitly prohibit the selection of shielded cards.
 */
export const CardPredicates = {
    ANY: (card) => !card.shielded,
    CENTER: (card) => !card.shielded && card.atNow.owner.id === -1,
    ANY_PLAYER: (card) => !card.shielded && card.atNow.owner.id !== -1,
    ANY_OTHER_PLAYER: (card) => 
        CardPredicates.ANY_PLAYER(card) && card.atNow.owner.id !== context.game.actingPlayer?.id,
    ANY_OTHER_PLAYER_FACE_DOWN: (card) =>
        CardPredicates.ANY_OTHER_PLAYER(card) && !card.faceUp,
    CENTER_OR_ANY_OTHER_PLAYER: 
        (card) => !card.shielded && card.atNow.owner.id !== context.game.actingPlayer?.id,
    NOT_SAME_AS: (givenCard) => ((card) => !card.shielded && card !== givenCard),
    NOT_SAME_OWNER_AS: (givenCard) => ((card) => !card.shielded && card.atNow.owner.id !== givenCard.atNow.owner.id),
    SAME_OWNER_AS: (givenCard) => ((card) => !card.shielded && card.atNow.owner.id === givenCard.atNow.owner.id),
    CENTER_AND_NOT_SAME_AS: (givenCard) => ((card) => 
        CardPredicates.CENTER(card) 
        && CardPredicates.NOT_SAME_AS(givenCard)(card)),
    ANY_OTHER_PLAYER_AND_NOT_SAME_AS: (givenCard) => ((card) => 
        CardPredicates.ANY_OTHER_PLAYER(card) 
        && CardPredicates.NOT_SAME_AS(givenCard)(card)),
    ANY_OTHER_PLAYER_AND_NOT_SAME_PLAYER_AS: (givenCard) => ((card) => 
        CardPredicates.ANY_OTHER_PLAYER(card) 
        && CardPredicates.NOT_SAME_OWNER_AS(givenCard)(card)),
    SAME_PLAYER_AS_BUT_NOT_SAME_AS: (givenCard) => ((card) => 
        CardPredicates.NOT_SAME_AS(givenCard)(card)
        && CardPredicates.SAME_OWNER_AS(givenCard)(card)),
    ANY_OTHER_PLAYER_WITH_MULTIPLE_UNSHIELDED_CARDS: (card) =>
        CardPredicates.ANY_OTHER_PLAYER(card)
        && card.atNow.owner.cards.filter(c => !c.shielded).length >= 2
}

/**
 * Options for GameCommands.playerChooseArtifact.
 */
export const ArtifactPredicates = {
    ANY: artifact => true,
    CENTER: artifact => context.game.center.artifacts[artifact?.centerIndex]?.id === artifact.id,
    CENTER_AND_FACE_DOWN: artifact => ArtifactPredicates.CENTER(artifact) && !artifact.faceUp
}

/**
 * Options for GameCommands.playerChoosePlayer.
 */
export const PlayerPredicates = {
    ANY: () => true,
    NO_ARTIFACT: player => !player.artifact
}

/**
 * Save a param during an action
 * @param {param} param 
 */
function pushParam(param) {
    if (context.side === "SERVER") return;
    if (!context.game.myPhaseParams) context.game.myPhaseParams = {};
    if (!context.game.myPhaseParams[context.game.actingAction.id])
        context.game.myPhaseParams[context.game.actingAction.id] = [];
    context.game.myPhaseParams[context.game.actingAction.id].push(param);
}

/**
 * Pop a param
 * @returns {param}
 */
function shiftParam() {
    if (context.side === "CLIENT") return;
    return context.game.phaseParams[context.game.actingPlayer.id][context.game.actingAction.id].shift();
}

const SkipButton = {icon: 'x', name: 'Skip', response: null, teamId: TeamIDs.WOLFSDEN};

const GameCommands = {
    /**
     * Find the card now at a location.
     * @param {CardLocation} cardLocation 
     * @return {Card}
     */
    getCardNowAt(cardLocation) {
        return cardLocation.owner.cards[cardLocation.index];
    },

    /**
     * Find the card that started at a location.
     * @param {CardLocation} cardLocation 
     * @returns {Card}
     */
    getCardInitiallyAt(cardLocation) {
        return context.game.cards.find(c => c.atInit.owner === cardLocation.owner && c.atInit.index === cardLocation.index);
    },

    /**
     * Get a card meeting a predicate.
     * @param {(card: Card) => boolean} predicate
     * @return {Card}
     */
    getCardSuchThat(predicate) {
        return context.game.cards.find(c => predicate(c));
    },
    
    /**
     * Get all cards meeting a predicate.
     * @param {(card: Card) => boolean} predicate
     * @return {Card[]}
     */
    getCardsSuchThat(predicate) {
        return context.game.cards.filter(c => predicate(c));
    },

    /**
     * Allow the user to choose a card.
     * @param {Object} options
     * @param {Markdown} options.prompt The transmission prompt 
     * @param {(card: Card) => boolean} options.predicate The predicate deciding if the card can be chosen
     * @param {boolean} options.skippable Whether the choice can be skipped (returning null)
     * @param {boolean} options.promptIsTemporary
     * @returns {Promise<Card>}
     */
    playerChooseCard: async function({
        prompt = "Choose any card.",
        predicate = CardPredicates.ANY,
        skippable = false,
        promptIsTemporary = true
    }) {
        if (context.side === "CLIENT") {
            prepareRequest({controlType: "CARD", predicate});
            broadcast({body: prompt, responses: skippable ? [SkipButton] : undefined, isTemporary: promptIsTemporary});
            const cardOrNull = await awaitRequest();
            if (cardOrNull) {
                pushParam(cardOrNull.atNow.owner.id);
                pushParam(cardOrNull.atNow.index);
            } else {
                pushParam(null);
            }
            return cardOrNull;
        } else {
            const ownerIdOrNull = shiftParam();
            if (ownerIdOrNull === null) return null;
            const index = shiftParam();
            return context.game.owners[ownerIdOrNull].cards[index];
        }
    },
    
    /**
     * Allow the user to choose a card.
     * @param {Object} options
     * @param {Markdown} options.prompt The transmission prompt 
     * @param {(artifact: Artifact) => boolean} options.predicate The predicate deciding if the artifact can be chosen
     * @param {boolean} options.skippable Whether the choice can be skipped (returning null)
     * @param {boolean} options.promptIsTemporary
     * @returns {Promise<Artifact>}
     */
    playerChooseArtifact: async function({
        prompt = "Choose any artifact.",
        predicate = ArtifactPredicates.ANY,
        skippable = false,
        promptIsTemporary = true
    }) {
        if (context.side === "CLIENT") {
            prepareRequest({controlType: "ARTIFACT", predicate});
            broadcast({body: prompt, responses: skippable ? [SkipButton] : undefined, isTemporary: promptIsTemporary});
            const artifactOrNull = await awaitRequest();
            if (artifactOrNull) {
                pushParam(artifactOrNull.centerIndex);
            } else {
                pushParam(null);
            }
            return artifactOrNull;
        } else {
            const artifactIndexOrNull = shiftParam();
            if (artifactIndexOrNull === null) return null;
            return context.game.center.artifacts[artifactIndexOrNull];
        }
    },
    
    /**
     * Allow the user to choose a player.
     * @param {Object} options
     * @param {Markdown} options.prompt The transmission prompt 
     * @param {(artifact: Artifact) => boolean} options.predicate The predicate deciding if the player can be chosen
     * @param {boolean} options.skippable Whether the choice can be skipped (returning null)
     * @param {boolean} options.promptIsTemporary
     * @returns {Promise<Artifact>}
     */
    playerChoosePlayer: async function({
        prompt = "Choose any player.",
        predicate = PlayerPredicates.ANY,
        skippable = false,
        promptIsTemporary = true
    }) {
        if (context.side === "CLIENT") {
            prepareRequest({controlType: "PLAYER", predicate});
            broadcast({body: prompt, responses: skippable ? [SkipButton] : undefined, isTemporary: promptIsTemporary});
            const playerOrNull = await awaitRequest();
            if (playerOrNull) {
                pushParam(playerOrNull.id);
            } else {
                pushParam(null);
            }
            return playerOrNull;
        } else {
            const playerIdOrNull = shiftParam();
            if (playerIdOrNull === null) return null;
            return context.game.players[playerIdOrNull];
        }
    },

    /**
     * Broadcast a message.
     * @param {Markdown} body The message
     * @param {boolean} isTemporary Whether the message is temporary
     */
    broadcastAndAwaitOK: async function(body, isTemporary = false) {
        if (context.side === "CLIENT") {
            return await broadcastAndAwaitOK(body, isTemporary);
        }
    },

    /**
     * Broadcast a message without awaiting. Use this rarely.
     * @param {Markdown} body The message
     * @param {boolean} isTemporary Whether the message is temporary
     */
    broadcast: async function(body, isTemporary = false) {
        if (context.side === "CLIENT") {
            return broadcast({body, isTemporary});
        }
    },

    /**
     * Broadcast a message and await a user decision.
     * @param {Object} options
     * @param {Markdown} options.body 
     * @param {{icon: string, name: string, response: param, teamId?: number}[]} options.responses 
     * @param {boolean} options.isSkippable
     * @param {boolean} options.isTemporary 
     * @returns {Promise<param>}
     */
    broadcastAndAwaitDecision: async function({body, responses, isSkippable, isTemporary}) {
        if (context.side === "CLIENT") {
            const response = await broadcastAndAwaitDecision(body, [
                ...responses, ...(isSkippable ? [SkipButton] : [])
            ], isTemporary);
            pushParam(response);
            return response;
        } else return shiftParam();
    },
    
    /**
     * Get all cards meeting a predicate.
     * @param {(player: Player) => boolean} predicate
     * @return {Player[]}
     */
    getPlayersSuchThat(predicate) {
        return context.game.players.filter(p => predicate(p));
    },

    /**
     * Reveal a card (temporarily)
     * @param {Card} card
     */
    viewCard: async function(card) {
        if (context.side === "SERVER") return;
        card.faceUp = true;
        await broadcastAndAwaitOK([`You view `, card, `: `, card.role, `.`]);
        card.faceUp = false;
        context.rerender();
    },

    /**
     * Reveal a card
     * @param {Card} card
     */
    faceUpCard: async function(card) {
        card.faceUp = true;
        if (context.side === "SERVER") return;
        await broadcastAndAwaitOK([`You reveal `, card, `: `, card.role, `.`]);
    },

    /**
     * Hide a card
     * @param {Card} card
     */
    faceDownCard: async function(card) {
        card.faceUp = false;
        if (context.side === "SERVER") return;
        await broadcastAndAwaitOK([`You hide `, card, `.`]);
    },

    /**
     * Swap two cards
     * @param {Card} card1
     * @param {Card} card2
     */
    swap2Cards: async function(card1, card2) {
        [
            card1.atNow.owner.cards[card1.atNow.index],
            card2.atNow.owner.cards[card2.atNow.index],
            card1.atNow, card2.atNow
        ] = [
            card2.atNow.owner.cards[card2.atNow.index],
            card1.atNow.owner.cards[card1.atNow.index],
            card2.atNow, card1.atNow
        ];
        if (context.side === "SERVER") return;
        await broadcastAndAwaitOK([`You swap `, card1, ` with `, card2, `.`]);
    },

    /**
     * Swap several cards; each one takes on the position of the next, wrapping.
     * Does NOT broadcast a message.
     * @param  {...Card} cards 
     */
    swapNCards: async function(...cards) {
        for (let i = 0; i < cards.length - 1; i++) {
            const card1 = cards[i], card2 = cards[(i + 1) % cards.length];
            [
                card1.atNow.owner.cards[card1.atNow.index],
                card2.atNow.owner.cards[card2.atNow.index],
                card1.atNow, card2.atNow
            ] = [
                card2.atNow.owner.cards[card2.atNow.index],
                card1.atNow.owner.cards[card1.atNow.index],
                card2.atNow, card1.atNow
            ];
        }
    },

    /**
     * Shield a card
     * @param {Card} card 
     */
    shieldCard: async function(card) {
        card.shielded = true;
        await broadcastAndAwaitOK([`You shield `, card, `.`]);
    },

    /**
     * Give a player an artifact from the center.
     * @param {Player} player
     * @param {Artifact} artifact
     */
    givePlayerArtifact: async function(player, artifact) {
        const centerIndex = artifact.centerIndex;
        player.artifact = artifact;
        context.game.center.artifacts[centerIndex] = null;
        artifact.centerIndex = null;
        artifact.faceUp = false;
        await broadcastAndAwaitOK([`You give `, player, ` the `, cardinals[centerIndex ?? 0], ` artifact.`]);
    },

    /**
     * Reveal an artifact in the center.
     * @param {Artifact} artifact
     */
    revealArtifact: async function(artifact) {
        artifact.faceUp = true;
        await broadcastAndAwaitOK([`You reveal the `, cardinals[artifact.centerIndex ?? 0], ` artifact: `, artifact, "."]);
    },

    
    /**
     * Hide an artifact in the center.
     * If it is evil, it is hidden.
     * @param {Artifact} artifact
     */
    hideArtifact: async function(artifact) {
        artifact.faceUp = false;
        await broadcastAndAwaitOK([`You hide the `, cardinals[artifact.centerIndex ?? 0], ` artifact.`]);
    },

    /**
     * View your artifact.
     * @param {Artifact} artifact
     */
    viewOwnArtifact: async function(artifact) {
        const wasFaceUpToStart = artifact.faceUp;
        artifact.faceUp = true;
        await broadcastAndAwaitOK([`You view your artifact: `, artifact, '.']);
        if (!wasFaceUpToStart) {
            artifact.faceUp = false;
            context.rerender();
        }
    },

    /**
     * Enqueue an action
     * @param {Action} action
     * @param {Player} player
     * @param {number} index The index of the acting card in the player's hand (card.atInit.index)
     */
    enqueueAction(action, player, index) {
        if (context.side === "CLIENT") return;
        if (action.id <= context.game.phase.at(-1).action.id) return;
        for (let newPos = 0; newPos < context.game.actionQueue.length; newPos++) {
            if (context.game.actionQueue[newPos].action.id === action.id) {
                context.game.actionQueue[newPos].players[player.id] = [...(context.game.actionQueue[newPos].players?.[player.id] ?? []), index];
                break;
            } else if (context.game.actionQueue[newPos].action.id > action.id) {
                context.game.actionQueue.splice(newPos, 0, {action, players: {[player.id]: [index]}});
                break;
            }
        }
    },

    /**
     * Perform an action right now
     * @param {Action} action 
     */
    doAction: async function(action) {
        await action.do(context.game);
    },

    /**
     * Vote
     * @param {Player} candidate
     */
    voteFor(player) {
        if (context.side === "CLIENT") return GameCommands.broadcast(["You vote for ", player, "!"]);
    }

};

export default GameCommands;