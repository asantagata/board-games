import Roles, { RoleIDs } from "./Roles.js";
import Actions from "./Actions.js";
import context from "@/context.js";
/** @import { Ripple, Role } from "@/types.js" */

/**
* This file contains definitions for all Ripples.
* To introduce a new ripple, add a new unique entry to RippleIDs and the Ripples object.
* Add new ripples to the end of the list.
*/

let rippleId = 1;
const RippleIDs = {
    NONE: rippleId++,
    TIME_LOOP: rippleId++,
    SEER: rippleId++,
    ROBBER: rippleId++,
    WITCH: rippleId++,
    TROUBLEMAKER: rippleId++,
    DRUNK: rippleId++,
    INSOMNIAC: rippleId++
}

/**
 * Generate a ripple that assigns a random player a certain role's actions.
 * @param {Role} role 
 * @returns {Ripple}
 */
function getRippleFrom(role) {
    return {
        name: role.name, icon: role.icon,
        description: ["A random player performs the ", role, " action."],
        getRippleActions: (_, players) => {
            const player = players[Math.floor(Math.random() * players.length)];
            const playerCard = player.cards[Math.floor(Math.random() * player.cards.length)];
            context.misc.rippleActingPlayer = player;
            context.misc.rippleActingCard = playerCard;
            return role.actionIds.map(aId => ({
                action: Actions[aId], players: {[player.id]: [playerCard.atNow.index]}, overrideRoleId: role.id
            }));
        },
        announcement: () => [context.misc.rippleActingPlayer, " will perform the ", role, " action!"],
    };
}

/** @type {Object.<number, Ripple>} */
const Ripples = {
    [RippleIDs.NONE]: {
        id: RippleIDs.NONE,
        name: "None",
        icon: "🚫",
        description: "Nothing happens.",
        getRippleActions: () => [],
        announcement: "Nothing special happens. Night's over."
    },
    [RippleIDs.TIME_LOOP]: {
        id: RippleIDs.TIME_LOOP,
        name: "Time loop",
        icon: "🕗",
        description: "The entire night, again.",
        getRippleActions: (actionList) => actionList,
        announcement: "The entire night happens again!"
    },
    [RippleIDs.SEER]: {...getRippleFrom(Roles[RoleIDs.SEER]), id: RippleIDs.SEER},
    [RippleIDs.ROBBER]: {...getRippleFrom(Roles[RoleIDs.ROBBER]), id: RippleIDs.ROBBER},
    [RippleIDs.WITCH]: {...getRippleFrom(Roles[RoleIDs.WITCH]), id: RippleIDs.WITCH},
    [RippleIDs.TROUBLEMAKER]: {...getRippleFrom(Roles[RoleIDs.TROUBLEMAKER]), id: RippleIDs.TROUBLEMAKER},
    [RippleIDs.DRUNK]: {...getRippleFrom(Roles[RoleIDs.DRUNK]), id: RippleIDs.DRUNK},
    [RippleIDs.INSOMNIAC]: {...getRippleFrom(Roles[RoleIDs.INSOMNIAC]), id: RippleIDs.INSOMNIAC},
}

export { RippleIDs };
export default Ripples;