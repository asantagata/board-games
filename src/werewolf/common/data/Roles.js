import Teams, { TeamIDs } from "./Teams.js";
import ActionIDs from "./ActionIDs.js";
/** @import {Role, RolePack} from "@/types.js" */

/**
* This file contains definitions for all Roles as well as RolePacks.
* To introduce a new role, add a new unique entry to RoleIDs and the Roles object.
* Add new roles to the end of the list.
*/

/** @type {Object.<string, RolePack>} */
const RolePacks = {
    STANDARD: {name: "🐺 Standard Pack"},
    DAYBREAK: {name: "🌅 Daybreak Pack"},
    BONUS_ROLES: {name: "🦏 Bonus Pack"},
    VAMPIRE: {name: "🧛 Vampire Pack"},
    CUSTOM: {name: "✨ Custom Pack"}
}

let roleId = 1;
const RoleIDs = {
    /** Standard roles */
    DOPPELGANGER: roleId++,
    WEREWOLF: roleId++,
    MINION: roleId++,
    MASON: roleId++,
    SEER: roleId++,
    ROBBER: roleId++,
    TROUBLEMAKER: roleId++,
    DRUNK: roleId++,
    INSOMNIAC: roleId++,
    VILLAGER: roleId++,
    TANNER: roleId++,

    /** Daybreak roles */
    SENTINEL: roleId++,
    MYSTIC_WOLF: roleId++,
    ALPHA_WOLF: roleId++,
    APPRENTICE_SEER: roleId++,
    PARANORMAL_INVESTIGATOR: roleId++,
    WITCH: roleId++,
    VILLAGE_IDIOT: roleId++,
    REVEALER: roleId++,
    CURATOR: roleId++,
    DREAM_WOLF: roleId++,

    /** Bonus roles roles */
    APPRENTICE_TANNER: roleId++,

    /** Vampire roles */
    COPYCAT: roleId++,

    /** Custom roles */
    YOUNSOMNIAC: roleId++,
    BOOMERANGER: roleId++,
    PERVERT: roleId++,
    TROUBLEMAKER_JR: roleId++,
}

/** @type {Object.<number, Role>} */
const Roles = {
    [RoleIDs.DOPPELGANGER]: {
        id: RoleIDs.DOPPELGANGER,
        name: "Doppelganger",
        displayName: "Doppel&shy;ganger",
        icon: "👯‍♀️",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.STANDARD,
        actionIds: [ActionIDs.DOPPY$VIEW_PLAYER_CARD_AND_SOMETIMES_ACT],
        displayActionIds: [ActionIDs.DOPPY$VIEW_PLAYER_CARD_AND_SOMETIMES_ACT, ActionIDs.DOPPY$DO_LATER_ACTION]
    },
    [RoleIDs.WEREWOLF]: {
        id: RoleIDs.WEREWOLF,
        name: "Werewolf",
        icon: "🐺",
        team: Teams[TeamIDs.WOLFSDEN],
        rolePack: RolePacks.STANDARD,
        actionIds: [ActionIDs.WOLFSDEN$VIEW_WOLVES_OR_CENTER],
        maxCount: Number.MAX_SAFE_INTEGER
    },
    [RoleIDs.MINION]: {
        id: RoleIDs.MINION,
        name: "Minion",
        icon: "🐶",
        team: Teams[TeamIDs.MINION],
        rolePack: RolePacks.STANDARD,
        actionIds: [ActionIDs.MINION$VIEW_WOLVES]
    },
    [RoleIDs.MASON]: {
        id: RoleIDs.MASON,
        name: "Mason",
        icon: "🤼",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.STANDARD,
        actionIds: [ActionIDs.MASON$VIEW_MASONS],
        maxCount: Number.MAX_SAFE_INTEGER
    },
    [RoleIDs.SEER]: {
        id: RoleIDs.SEER,
        name: "Seer",
        icon: "👀",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.STANDARD,
        actionIds: [ActionIDs.SEER$VIEW_1_PLAYER_OR_2_CENTER_CARDS]
    },
    [RoleIDs.ROBBER]: {
        id: RoleIDs.ROBBER,
        name: "Robber",
        icon: "🤑",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.STANDARD,
        actionIds: [ActionIDs.ROBBER$SWAP_AND_VIEW_OTHER_PLAYER_CARD]
    },
    [RoleIDs.TROUBLEMAKER]: {
        id: RoleIDs.TROUBLEMAKER,
        name: "Troublemaker",
        displayName: "Trouble&shy;maker",
        icon: "💃",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.STANDARD,
        actionIds: [ActionIDs.TROUBLEMAKER$SWAP_TWO_OTHER_PLAYER_CARDS]
    },
    [RoleIDs.DRUNK]: {
        id: RoleIDs.DRUNK,
        name: "Drunk",
        icon: "🤷",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.STANDARD,
        actionIds: [ActionIDs.DRUNK$SWAP_WITH_CENTER]
    },
    [RoleIDs.INSOMNIAC]: {
        id: RoleIDs.INSOMNIAC,
        name: "Insomniac",
        icon: "😴",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.STANDARD,
        actionIds: [ActionIDs.INSOMNIAC$VIEW_NEW_CARD]
    },
    [RoleIDs.VILLAGER]: {
        id: RoleIDs.VILLAGER,
        name: "Villager",
        icon: "🧍",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.STANDARD,
        actionIds: [],
        maxCount: Number.MAX_SAFE_INTEGER
    },
    [RoleIDs.TANNER]: {
        id: RoleIDs.TANNER,
        name: "Tanner",
        icon: "🦫",
        team: Teams[TeamIDs.TANNER],
        rolePack: RolePacks.STANDARD,
        actionIds: []
    },
    [RoleIDs.SENTINEL]: {
        id: RoleIDs.SENTINEL,
        name: "Sentinel",
        icon: "🤺",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.DAYBREAK,
        actionIds: [ActionIDs.SENTINEL$PROTECT]
    },
    [RoleIDs.MYSTIC_WOLF]: {
        id: RoleIDs.MYSTIC_WOLF,
        name: "Mystic Wolf",
        icon: "🦄",
        team: Teams[TeamIDs.WOLFSDEN],
        rolePack: RolePacks.DAYBREAK,
        actionIds: [ActionIDs.WOLFSDEN$VIEW_WOLVES_OR_CENTER, ActionIDs.MYSTIC_WOLF$VIEW_OTHER_PLAYER_CARD]
    },
    [RoleIDs.ALPHA_WOLF]: {
        id: RoleIDs.ALPHA_WOLF,
        name: "Alpha Wolf",
        icon: "🐃",
        team: Teams[TeamIDs.WOLFSDEN],
        rolePack: RolePacks.DAYBREAK,
        actionIds: [ActionIDs.WOLFSDEN$VIEW_WOLVES_OR_CENTER, ActionIDs.ALPHA_WOLF$GIVE_ALPHA_WOLF]
    },
    [RoleIDs.APPRENTICE_SEER]: {
        id: RoleIDs.APPRENTICE_SEER,
        name: "Apprentice Seer",
        icon: "🫣",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.DAYBREAK,
        actionIds: [ActionIDs.APP_SEER$VIEW_OTHER_PLAYER_CARD]
    },
    [RoleIDs.PARANORMAL_INVESTIGATOR]: {
        id: RoleIDs.PARANORMAL_INVESTIGATOR,
        name: "Paranormal Investigator",
        icon: "🕵️",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.DAYBREAK,
        actionIds: [ActionIDs.PI$VIEW_2_AND_ABSORB_EVIL_TEAM]
    },
    [RoleIDs.WITCH]: {
        id: RoleIDs.WITCH,
        name: "Witch",
        icon: "🧙",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.DAYBREAK,
        actionIds: [ActionIDs.WITCH$VIEW_AND_SWAP_FROM_CENTER]
    },
    [RoleIDs.VILLAGE_IDIOT]: {
        id: RoleIDs.VILLAGE_IDIOT,
        name: "Village Idiot",
        icon: "👹",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.DAYBREAK,
        actionIds: [ActionIDs.VI$SWAP_LEFT_OR_RIGHT]
    },
    [RoleIDs.REVEALER]: {
        id: RoleIDs.REVEALER,
        name: "Revealer",
        icon: "🕴️",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.DAYBREAK,
        actionIds: [ActionIDs.REVEALER$REVEAL_OTHER_PLAYER_CARD]
    },
    [RoleIDs.CURATOR]: {
        id: RoleIDs.CURATOR,
        name: "Curator",
        icon: "🎅",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.DAYBREAK,
        actionIds: [ActionIDs.CURATOR$CURATE]
    },
    [RoleIDs.DREAM_WOLF]: {
        id: RoleIDs.DREAM_WOLF,
        name: "Dream Wolf",
        icon: "🦥",
        team: Teams[TeamIDs.WOLFSDEN],
        rolePack: RolePacks.DAYBREAK,
        actionIds: []
    },
    [RoleIDs.APPRENTICE_TANNER]: {
        id: RoleIDs.APPRENTICE_TANNER,
        name: "Apprentice Tanner",
        icon: "🐿️",
        team: Teams[TeamIDs.APPRENTICE],
        rolePack: RolePacks.BONUS_ROLES,
        actionIds: [ActionIDs.APP_TANNER$VIEW_TANNERS]
    },
    [RoleIDs.COPYCAT]: {
        id: RoleIDs.COPYCAT,
        name: "Copycat",
        icon: "😼",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.VAMPIRE,
        actionIds: [ActionIDs.COPYCAT$VIEW_CENTER_CARD_AND_ENQUEUE_ACTION]
    },
    [RoleIDs.PERVERT]: {
        id: RoleIDs.PERVERT,
        name: "Pervert",
        icon: "🧝",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.CUSTOM,
        actionIds: [ActionIDs.PERVERT$REVEAL_SELF]
    },
    [RoleIDs.BOOMERANGER]: {
        id: RoleIDs.BOOMERANGER,
        name: "Boomeranger",
        displayName: "Boomer&shy;anger",
        icon: "🪃",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.CUSTOM,
        actionIds: [ActionIDs.BOOMERANGER$COME_BACK]
    },
    [RoleIDs.YOUNSOMNIAC]: {
        id: RoleIDs.YOUNSOMNIAC,
        name: "Younsomniac",
        displayName: "Youn&shy;somniac",
        icon: "😵",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.CUSTOM,
        actionIds: [ActionIDs.YOUNSOMNIAC$VIEW_CARD]
    },
    [RoleIDs.TROUBLEMAKER_JR]: {
        id: RoleIDs.TROUBLEMAKER_JR,
        name: "Troublemaker, Jr.",
        displayName: "Trouble&shy;maker, Jr.",
        icon: "⛹️",
        team: Teams[TeamIDs.VILLAGE],
        rolePack: RolePacks.CUSTOM,
        actionIds: [ActionIDs.TROUBLEMAKER_JR$SWAP_TWO_SAME_PLAYER_CARDS]
    }
};

export default Roles;
export { RolePacks, RoleIDs };