import context from "@/context.js";
/** @import {Player, Team} from "@/types.js" */

/**
* This file contains definitions for all teams.
* To introduce a new action, add a new unique entry to TeamIDs and the Teams object.
* Teams with larger IDs (later on the TeamIDs list) have more priority in multi-role play.
*/

let teamId = 1;
const TeamIDs = {
    VILLAGE: teamId++,
    MINION: teamId++,
    WOLFSDEN: teamId++,
    APPRENTICE: teamId++,
    TANNER: teamId++
}

/** 
 * @param {Player} player
 */
export function getPlayerTeamId(player) {
    return Math.max(...player.cards.map(c => c.team.id));
}

/** @type {Object.<number, Team>} */
const Teams = {
    [TeamIDs.VILLAGE]: {
        id: TeamIDs.VILLAGE,
        name: "Village",
        description: () => ["The ", Teams[TeamIDs.VILLAGE], " team wins if at least one ", Teams[TeamIDs.WOLFSDEN], " player dies and no ", Teams[TeamIDs.TANNER], " players die. If no players are ", Teams[TeamIDs.WOLFSDEN], ", the ", Teams[TeamIDs.VILLAGE], " team wins only if no players die."],
        didPlayerWin: () => {
            const wolves = Teams[TeamIDs.WOLFSDEN].getMembers();
            if (!wolves.length) return context.game.players.every(p => p.alive);
            const tanners = Teams[TeamIDs.TANNER].getMembers();
            return wolves.some(p => !p.alive) && tanners.every(p => p.alive);
        },
        getMembers: () => context.game.players.filter(p => (getPlayerTeamId(p) === TeamIDs.VILLAGE && !p.artifact?.teamId) || p.artifact?.teamId === TeamIDs.VILLAGE)
    },
    [TeamIDs.MINION]: {
        id: TeamIDs.MINION,
        name: "Minion",
        description: () => ["The ", Teams[TeamIDs.MINION], " team wins if no ", Teams[TeamIDs.WOLFSDEN], " or ", Teams[TeamIDs.TANNER], " players die. If no players are on the ", Teams[TeamIDs.WOLFSDEN], " team, the ", Teams[TeamIDs.MINION], " team becomes the ", Teams[TeamIDs.WOLFSDEN], " team."],
        didPlayerWin: (player) => Teams[TeamIDs.WOLFSDEN].didPlayerWin(player)
    },
    [TeamIDs.WOLFSDEN]: {
        id: TeamIDs.WOLFSDEN,
        name: "Wolfsden",
        description: () => ["The ", Teams[TeamIDs.WOLFSDEN], " team wins if no ", Teams[TeamIDs.WOLFSDEN], " or ", Teams[TeamIDs.TANNER], " players die."],
        didPlayerWin: () => [...Teams[TeamIDs.WOLFSDEN].getMembers(), ...Teams[TeamIDs.TANNER].getMembers()].every(p => p.alive),
        getMembers: () => {
            const wolves = context.game.players.filter(p => (getPlayerTeamId(p) === TeamIDs.WOLFSDEN && !p.artifact?.teamId) || p.artifact?.teamId === TeamIDs.WOLFSDEN);
            if (wolves.length) return wolves;
            return context.game.players.filter(p => getPlayerTeamId(p) === TeamIDs.MINION && !p.artifact?.teamId);
        }
    },
    [TeamIDs.APPRENTICE]: {
        id: TeamIDs.APPRENTICE,
        name: "Apprentice",
        description: () => ["The ", Teams[TeamIDs.APPRENTICE], " team wins if any ", Teams[TeamIDs.TANNER], " players die. If no players are on the ", Teams[TeamIDs.TANNER], " team, the ", Teams[TeamIDs.APPRENTICE], " team becomes the ", Teams[TeamIDs.TANNER], " team."],
        didPlayerWin: () => Teams[TeamIDs.TANNER].getMembers().some(p => !p.alive)
    },
    [TeamIDs.TANNER]: {
        id: TeamIDs.TANNER,
        name: "Tanner",
        description: () => ["Members of the ", Teams[TeamIDs.TANNER], " team win if they themselves die."],
        didPlayerWin: (player) => !player.alive,
        getMembers: () => {
            const tanners = context.game.players.filter(p => (getPlayerTeamId(p) === TeamIDs.TANNER && !p.artifact?.teamId) || p.artifact?.teamId === TeamIDs.TANNER);
            if (tanners.length) return tanners;
            return context.game.players.filter(p => getPlayerTeamId(p) === TeamIDs.APPRENTICE && !p.artifact?.teamId);
        }
    },
}

export default Teams;
export { TeamIDs };