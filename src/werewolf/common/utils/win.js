import Teams, { getPlayerTeamId } from "@/data/Teams.js";
/** @import { Player } from "@/types.js" */

/** @param {Player} player */
export function evaluatePlayerWin(player) {
    return player.artifact?.didPlayerWin?.(player) ?? evaluatePlayerCardsWin(player);
}

/** @param {Player} player  */
export function evaluatePlayerCardsWin(player) {
    return Teams[getPlayerTeamId(player)].didPlayerWin(player);
}