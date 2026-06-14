import connection, { Statuses, MessageTypes } from "@/connection.js";
import context from "@/context.js";
import { broadcastAndAwaitOK, broadcastEllipsis } from "./controls.js";
import GameCommands from "@/data/GameCommands.js";
import Roles from "@/data/Roles.js";

export function leaveRoom() {
    const channelName = connection.channelName;
    connection.channelName = null;
    connection.channel = null;
    connection.status = Statuses.CONNECTED;
    history.replaceState(null, null, location.href.replace(/#.*/, ""));
    window.alert(`The room ${channelName} has closed.`)
    context.rerender();
}

export async function processPhase() {
    if (!context.misc.rolesAcknowledged) {
        context.game.actingPlayer.cards.forEach(c => c.faceUp = true);
        await broadcastAndAwaitOK([
            `You view your card${context.game.actingPlayer.cards.length > 1 ? 's' : ''}: `,
            context.game.actingPlayer.cards.map(c => c.role), '.'
        ], false, true);
        context.game.actingPlayer.cards.forEach(c => c.faceUp = false);
        context.misc.rolesAcknowledged = true;
    }
    for (const {action, cardLocations, overrideRoleId = null} of context.game.myPhase) {
        if (cardLocations?.length) context.game.actingCardLocation = {...cardLocations[0]};
        context.game.actingAction = action;
        context.game.actingRoles = cardLocations.map(loc => GameCommands.getCardInitiallyAt(loc).role);
        if (context.game.actingRoles.length === 0) context.game.actingRoles = null;
        await broadcastAndAwaitOK(
            context.game.actingRoles
            ? [`You wake up as `, overrideRoleId ? Roles[overrideRoleId] : context.game.actingRoles, `...`]
            : [`You wake up...`], false, true
        );
        await action.do(context.game);
    }
    context.game.actingCardLocation = null;
    context.game.actingAction = null;
    context.game.actingRoles = null;
    broadcastEllipsis();
    window.setTimeout(() => connection.sendMessage(MessageTypes.COMPLETE_PHASE, context.game.myPhaseParams), 250);
}