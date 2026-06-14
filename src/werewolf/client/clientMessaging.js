import connection, { Statuses, MessageTypes } from "@/connection.js";
import context from "@/context.js";
import { leaveRoom, processPhase } from "./clientUtils.js";
import Roles from "@/data/Roles.js";
import Teams from "@/data/Teams.js";
import Actions from "@/data/Actions.js";
import Artifacts from "@/data/Artifacts.js";

/** @import { Message, PhaseMessageData } from "@/types.js" */

/**
 * Handle an Ably message on the client side
 * @param {Message} message The message object
 */
export function handleMessageAsClient(message) {
    if (message.from !== "SERVER") return;
    switch (message.type) {
        case MessageTypes.ADMIT_PLAYER_TO_ROOM: {
            if (message.data.browserId === connection.browserId) {
                connection.status = Statuses.ADMITTED;
                context.rerender();
            }
            break;
        }
        case MessageTypes.KICK_PLAYER: {
            if (message.data.browserId === connection.browserId) {
                leaveRoom();
            }
            break;
        }
        case MessageTypes.CLOSE_ROOM: {
            leaveRoom();
            break;
        }
        case MessageTypes.START_PHASE: {
            context.misc.renderingNewPhase = true;
            context.game = unmessageGame(message.data);
            
            document.body.offsetHeight;
            context.rerender();

            document.body.offsetHeight;
            context.misc.renderingNewPhase = false;
            processPhase();
            break;
        }
        case MessageTypes.END_GAME: {
            context.game = null;
            context.misc = {};
            context.rerender();
            break;
        }
        case MessageTypes.PLAYER_REJOINED_DURING_PHASE: {
            if (message.data.browserId === connection.browserId) {
                connection.status = Statuses.ADMITTED;
                context.game = unmessageGame(message.data.phase);
                processPhase();
            }
        }
    }
}

/**
 * Send an Ably message to the room
 * @param {string} messageType The type of message
 * @param {any[]} params Other data for the message
 * @returns {Promise}
 */
export async function sendMessageAsClient(messageType, ...params) {
    const message = {from: connection.browserId, type: messageType};
    switch (messageType) {
        case MessageTypes.JOIN_ROOM: {
            message.data = {name: params[0], color: params[1]};
            break;
        }
        case MessageTypes.COMPLETE_PHASE: {
            message.data = params[0];
        }
        default: break;
    }
    return await connection.sendMessageInternal(message);
}

/**
 * 
 * @param {PhaseMessageData} mGame 
 * @returns {Client}
 */
function unmessageGame(mGame) {
    const myId = mGame.players.findIndex(p => p.browserId === connection.browserId);
    const game = {
        myId: myId,
        myPhase: [],
        myPhaseParams: {},
        request: {},
        cards: [],
        players: mGame.players.map((p, pId) => ({
            browserId: p.browserId,
            name: p.name,
            color: p.color,
            cards: [],
            id: pId,
            artifact: p.artifact ? {...Artifacts[p.artifact.artifactId], faceUp: p.artifact.faceUp} : null
        })),
        center: {
            id: -1,
            cards: [],
            artifacts: mGame.center.artifactIds?.map((a, i) => a ? ({...Artifacts[a.artifactId], faceUp: a.faceUp, centerIndex: i}) : a)
        },
        rippleIds: mGame.rippleIds
    }
    game.actingPlayer = game.players[myId];
    game.owners = {[-1]: game.center, ...Object.fromEntries(game.players.map(p => [p.id, p]))}
    game.cards = mGame.cards.map((c, cId) => ({
        id: cId,
        role: Roles[c.roleId],
        atInit: {owner: game.owners[c.atInit.ownerId], index: c.atInit.index},
        atNow: {owner: game.owners[c.atNow.ownerId], index: c.atNow.index},
        details: c.details,
        team: Teams[c.teamId],
        shielded: c.shielded,
        faceUp: c.faceUp
    }));
    game.center.cards = mGame.center.cardIds.map(cId => game.cards[cId]);
    for (const p of game.players)
        p.cards = mGame.players[p.id].cardIds.map(cId => game.cards[cId]);
    game.myPhase = mGame.phase[myId]
        .map(ph => ({action: Actions[ph.actionId], cardLocations: ph.indices.map(index => ({owner: game.players[myId], index})), overrideRoleId: ph.overrideRoleId}));
    game.actingCardLocation = null;
    game.actingAction = null;
    return game;
}