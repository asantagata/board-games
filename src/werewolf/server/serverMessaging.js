import connection, { Statuses, MessageTypes } from "@/connection.js";
import context from "@/context.js";
import { endPhase } from "./serverUtils.js";
/** @import { Message, JoinRoomMessage, CompletePhaseMessage, AdmitPlayerToRoomMessage, 
 * StartPhaseMessage, PlayerRejoinedDuringPhaseMessage, EndGameMessage, CloseRoomMessage } 
 * from "@/types.js" */

window.addEventListener('beforeunload', () => {
    if (context.side === "SERVER" && connection.channel) {
        sendMessageAsServer(MessageTypes.CLOSE_ROOM);
    }
});

/**
 * Handle an Ably message on the server side
 * @param {Message} message The message object
 */
export function handleMessageAsServer(message) {
    if (message.from === "SERVER") return;
    switch (message.type) {
        case MessageTypes.JOIN_ROOM: {
            if (context.game?.phase 
                && context.game.players.some(p => p.browserId === message.from)
                && !context.game.phaseParams?.[context.game.players.findIndex(p => p.browserId === message.from)]) {
                sendMessageAsServer(MessageTypes.PLAYER_REJOINED_DURING_PHASE, message.from);
            } else {
                sendMessageAsServer(MessageTypes.ADMIT_PLAYER_TO_ROOM, message.from);
                if (!context.config.members.some(p => p.browserId === message.from)) {
                    context.config.members.push({...message.data, browserId: message.from, cardCount: context.config.members.at(-1)?.cardCount ?? 1});
                    if (!context.game)
                        context.rerender();
                }
            }
            break;
        }
        case MessageTypes.COMPLETE_PHASE: {
            if (!context.game.phaseParams) context.game.phaseParams = {};
            context.game.phaseParams[
                context.game.players.findIndex(p => p.browserId === message.from)
            ] = message.data;
            if (Object.keys(context.game.phaseParams).length === context.game.players.length)
                endPhase();
        }
    }
}

/**
 * Send an Ably message to the room
 * @param {string} messageType The type of message
 * @param {any[]} params Other data for the message
 * @returns {Promise}
 */
export async function sendMessageAsServer(messageType, ...params) {
    const message = {from: "SERVER", type: messageType};
    switch (messageType) {
        case MessageTypes.ADMIT_PLAYER_TO_ROOM: {
            message.data = {browserId: params[0]};
            break;
        }
        case MessageTypes.KICK_PLAYER: {
            message.data = {browserId: params[0]};
            break;
        }
        case MessageTypes.START_PHASE: {
            message.data = messageGame();
            break;
        }
        case MessageTypes.PLAYER_REJOINED_DURING_PHASE: {
            message.data = {phase: messageGame(), browserId: params[0]};
            break;
        }
        default: break;
    }
    return await connection.sendMessageInternal(message);
}

function messageGame(game = context.game) {
    return {
        players: game.players.map(p => ({
            name: p.name,
            color: p.color,
            browserId: p.browserId,
            cardIds: p.cards.map(c => c.id),
            artifact: p.artifact ? {artifactId: p.artifact.id, faceUp: p.artifact.faceUp} : null,
        })),
        center: {
            cardIds: game.center.cards.map(c => c.id),
            artifactIds: game.center.artifacts?.map(a => (a ? {artifactId: a.id, faceUp: a.faceUp} : a))
        },
        cards: game.cards.map(c => ({
            roleId: c.role.id,
            atInit: {ownerId: c.atInit.owner.id, index: c.atInit.index},
            atNow: {ownerId: c.atNow.owner.id, index: c.atNow.index},
            details: c.details,
            teamId: c.team.id,
            shielded: c.shielded,
            faceUp: c.faceUp
        })),
        phase: Object.fromEntries(game.players.map(p => [p.id, 
            game.phase.filter(ph => ph.players[p.id]).map(ph => ({
                actionId: ph.action.id, indices: ph.players[p.id], ...(ph.overrideRoleId ? {overrideRoleId: ph.overrideRoleId} : {})
            }))
        ])),
        rippleIds: game.rippleIds
    }
}