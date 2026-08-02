import $ from "@/$.js";
import Buildings from "@/data/Buildings.js";
import Quests, { PlotQuestBonuses } from "@/data/Quests.js";
import Intrigues from "@/data/Intrigues.js";
import { proceedWithScript } from "./game.js";
/** @import {HistoricGame, Game} from "@/types.js" */

/** @returns {HistoricGame} */
export function gameToHistoric() {
    return {
        players: $.game.players.map(player => ({
            activeQuestIds: player.activeQuests?.map(q => q.id) ?? [],
            completedQuestIds: player.completedQuests?.map(q => q.id) ?? [],
            intrigueIds: player.intrigues?.map(i => i.id) ?? [],
            resources: {...player.resources},
            agents: [...player.agents],
            intrigueDeckIndex: player.intrigueDeckIndex
        })),
        round: $.game.round,
        actingPlayerId: $.game.actingPlayer?.id,
        questIdDeck: $.game.questDeck.map(q => q.id),
        faceUpQuestIds: $.game.faceUpQuests.map(q => q.id),
        buildingIdDeck: $.game.buildingDeck.map(b => b.id),
        buildingShop: $.game.buildingShop.map(b => ({
            id: b.id,
            ownerId: b.owner?.id ?? null,
            actionSpaces: b.actionSpaces.map(a => ({
                occupants: [...(a.occupants ?? [])],
                resources: {...(a.resources ?? {})}
            }))
        })),
        buildings: $.game.buildings.map(b => ({
            id: b.id,
            ownerId: b.owner?.id ?? null,
            actionSpaces: b.actionSpaces.map(a => ({
                occupants: [...(a.occupants ?? [])],
                resources: {...(a.resources ?? {})}
            }))
        })),
        corruptionOnTrack: $.game.corruptionOnTrack,
        nextRoundAmbassadorOwnerId: $.game.nextRoundAmbassadorOwner?.id ?? null,
        nextRoundFirstPlayerId: $.game.nextRoundFirstPlayer?.id ?? null,
        thisRoundAmbassadorOwnerId: $.game.thisRoundAmbassadorOwner?.id ?? null,
        thisRoundFirstPlayerId: $.game.thisRoundFirstPlayer?.id ?? null,
        bonuses: Object.fromEntries(Object.entries($.game.bonuses).map(([trigger, bonuses]) => [trigger, bonuses.map(bonus => ({
            id: bonus.id, hasBeenUsedThisInterval: bonus.hasBeenUsedThisInterval, ownerId: bonus.owner.id
        }))])),
        harboriteToReassign: $.game.harboriteToReassign ?? null,
        queue: [...$.game.queue],
        endTurnLoop: $.game.endTurnLoop
    };
}

/** 
 * @param {{
 * id: number, 
 * ownerId?: number, 
 * actionSpaces: {
 *  occupants: Agent[],
 *  resources: Resources
 * }[]}} historic 
 **/
function historicToBuilding(historic, players) {
    return {
        ...Buildings[historic.id],
        owner: historic.ownerId === null ? null : players[historic.ownerId],
        actionSpaces: Buildings[historic.id].actionSpaces.map((actionSpace, i) => {
            const historicSpace = historic.actionSpaces[i];
            return {...actionSpace, occupants: [...historicSpace.occupants], resources: {...historicSpace.resources}}
        })
    };
}

/** 
 * @param {HistoricGame} historic
 * @returns {Game}
 * */
export function historicToGame(historic) {
    const players = $.game.players.map((player, id) => {
        const historicPlayer = historic.players[id];
        return {
            ...player,
            activeQuests: historicPlayer.activeQuestIds.map(id => Quests[id]),
            completedQuests: historicPlayer.completedQuestIds.map(id => Quests[id]),
            resources: {...historicPlayer.resources},
            intrigues: historicPlayer.intrigueIds.map(id => Intrigues[id]),
            agents: [...historicPlayer.agents],
            intrigueDeckIndex: historicPlayer.intrigueDeckIndex
        };
    });
    const playerNullFallback = (id) => (id === null || id === undefined) ? null : players[id];
    return {
        players: players,
        round: historic.round,
        actingPlayer: playerNullFallback(historic.actingPlayerId),
        questDeck: historic.questIdDeck.map(id => Quests[id]),
        faceUpQuests: historic.faceUpQuestIds.map(id => Quests[id]),
        buildingDeck: historic.buildingIdDeck.map(id => Buildings[id]),
        buildingShop: historic.buildingShop.map(hbs => historicToBuilding(hbs, players)),
        buildings: historic.buildings.map(hbs => historicToBuilding(hbs, players)),
        staticIntrigueDeck: $.game.staticIntrigueDeck,
        corruptionOnTrack: historic.corruptionOnTrack,
        nextRoundAmbassadorOwner: playerNullFallback(historic.nextRoundAmbassadorOwnerId),
        nextRoundFirstPlayer: playerNullFallback(historic.nextRoundFirstPlayerId),
        thisRoundFirstPlayer: playerNullFallback(historic.thisRoundFirstPlayerId),
        thisRoundAmbassadorOwner: playerNullFallback(historic.thisRoundAmbassadorOwnerId),
        bonuses: Object.fromEntries(Object.entries(historic.bonuses).map(([trigger, bonuses]) => [
            trigger, bonuses.map(bonus => ({...PlotQuestBonuses[bonus.id], hasBeenUsedThisInterval: bonus.hasBeenUsedThisInterval, owner: players[bonus.ownerId]}))
        ])),
        harboriteToReassign: historic.harboriteToReassign,
        queue: [...(historic.queue ?? [])],
        endTurnLoop: historic.endTurnLoop
    };
}

/**
 * @param {{
 *  eventType: "ROUND_START" | "TURN",
 *  description: Markdown,
 *  historicGame: HistoricGame
 * }} history
 * @param {number} index
 */
export function reinstateHistory(history, index = $.history.length - 1) {
    $.history = $.history.slice(0, index);
    $.game = historicToGame(history.historicGame);
    $.game.queue.unshift(history.eventType);
    $.ui = {
        callStack: history.eventType === "ROUND_START" ? [] : [`Round ${history.historicGame.round}`],
        question: '',
        example: null,
        options: null,
        restoreParity: !$.ui.restoreParity,
        showIntrigueSearch: false,
        intrigueQuery: "",
        lastIntrigueInput: null,
        showLords: false
    }
    $.misc = {
        lastCostChanges: null,
        lastSpaceResources: null,
        choosingBuildingForTurn: false
    }
    proceedWithScript();
}