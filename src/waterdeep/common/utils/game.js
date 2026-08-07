import $ from "@/$.js";
import Buildings, { BuildingNameIdMap } from "@/data/Buildings.js";
import Lords from "@/data/Lords.js";
import Quests, { QuestNameIdMap } from "@/data/Quests.js";
import Intrigues from "@/data/Intrigues.js";
import GameCommands from "@/data/GameCommands.js";
import { seededShuffle, unseededShuffle } from "@/utils/random.js";
import { gameToHistoric } from "./history.js";
import Icon from "@/components/Icon.js";

function draw1From(array) { return array.splice(0, 1)[0]; }
function drawNFrom(array, n) { return array.splice(0, n); }

export function startGame() {
    const buildingDeck = unseededShuffle(Buildings.filter(b => (!b.isSkullport || $.config.skullport) && !b.default));
    const questDeck = unseededShuffle(Quests.filter(q => !q.isMandatoryQuest && (!q.isSkullport || $.config.skullport)).map(q => ({...q, ...(q.plotQuestBonus ? {plotQuestBonus: {...q.plotQuestBonus}} : {})})));
    const lordDeck = seededShuffle(Lords.filter(l => !l.isSkullport || $.config.skullport));
    const intrigueDeck = seededShuffle(Intrigues.filter(i => !i.isSkullport || $.config.skullport));
    const agentsPerPlayer = (!$.config.long ? [-1, -1, 4, 3, 2, 2, 2] : [-1, -1, 5, 4, 3, 3, 2])[$.config.players.length];
    const players = $.config.players.map((configPlayer, id) => {
        const intrigueDeckIndex = Math.floor(intrigueDeck.length * id / $.config.players.length);
        const gamePlayer = {color: configPlayer.color, name: configPlayer.name?.trim() || 'no-name nelly', id, 
            lord: draw1From(lordDeck),
            activeQuests: drawNFrom(questDeck, 2),
            completedQuests: [],
            resources: {"P": 0, "W": 0, "O": 0, "B": 0, "VP": 0, "CORRU": 0, "GOLD": id + 4},
            intrigues: [intrigueDeck[intrigueDeckIndex], intrigueDeck[(intrigueDeckIndex + 1) % intrigueDeck.length]],
            intrigueDeckIndex: (intrigueDeckIndex + 2) % intrigueDeck.length
        };
        gamePlayer.agents = Array.from({length: agentsPerPlayer}, () => gamePlayer.id);
        return gamePlayer;
    });
    $.game = {
        players: players,
        round: 0,
        actingPlayer: players[0],
        faceUpQuests: drawNFrom(questDeck, 4),
        questDeck: questDeck,
        staticIntrigueDeck: intrigueDeck,
        buildings: Buildings.filter(b => (!b.isSkullport || $.config.skullport) && (b.default || b.test)).map(b => ({...b, owner: b.test ? players[0] : undefined, actionSpaces: b.actionSpaces.map(a => ({...a, occupants: [], resources: {}}))})),
        buildingShop: drawNFrom(buildingDeck, 3).map(b => ({...b, actionSpaces: b.actionSpaces.map(a => ({...a, occupants: [], resources: {}}))})),
        buildingDeck: buildingDeck,
        nextRoundFirstPlayer: players[0],
        thisRoundFirstPlayer: null,
        nextRoundAmbassadorOwner: null,
        thisRoundAmbassadorOwner: null,
        bonuses: {},
        corruptionOnTrack: 25,
        harboriteToReassign: null,
        queue: ["ROUND_START"],
        endTurnLoop: false
    };
    proceedWithScript();
}

export async function proceedWithScript() {
    const action = $.game.queue.shift();
    switch (action) {
        case "ROUND_START":
            $.history.push({eventType: "ROUND_START", description: ["Start of round ", $.game.round + 1], historicGame: gameToHistoric()});
            $.game.round++;
            $.ui.callStack = [`Round ${$.game.round}`];

            $.game.harboriteToReassign = null;
            (Object.values($.game.bonuses)?.flat() ?? []).forEach(bonus => {
                if (bonus.interval === "ROUND") bonus.hasBeenUsedThisInterval = false;
            });

            [...$.game.buildings, ...$.game.buildingShop].forEach(building => {
                building.actionSpaces.forEach(actionSpace => {
                    actionSpace.occupants?.forEach(occupant => {
                        if (occupant === "AMBASSADOR") return;
                        $.game.players[occupant].agents.unshift(occupant);
                    });
                    actionSpace.occupants = [];
                });
            });

            if ($.game.round === 5) $.game.players.forEach(player => player.agents.push(player.id));
            $.game.thisRoundAmbassadorOwner = $.game.nextRoundAmbassadorOwner;
            $.game.nextRoundAmbassadorOwner = null;
            if ($.game.thisRoundAmbassadorOwner) {
                $.game.thisRoundAmbassadorOwner.agents.unshift("AMBASSADOR");
                $.game.queue.push("TURN");
            }

            $.game.buildings.forEach(building => {
                building.actionSpaces.forEach(actionSpace => {
                    if (typeof actionSpace.onPurchasedOrRoundStart === "function")
                        actionSpace.onPurchasedOrRoundStart();
                    else if (typeof actionSpace.onPurchasedOrRoundStart === "object")
                        GameCommands.GiveActionSpaceResources(actionSpace, actionSpace.onPurchasedOrRoundStart);
                });
            });

            
            await GameCommands.HandleBonuses("START_OF_ROUND");

            $.game.thisRoundFirstPlayer = $.game.nextRoundFirstPlayer;
            $.game.queue.push("TURN_LOOP");
            $.game.queue.push("REASSIGN_HARBORITES");

            return proceedWithScript();
        case "TURN_LOOP":
            $.game.endTurnLoop = false;
        case "TURN_LOOP_INNER":
            if (!$.game.endTurnLoop) {
                $.game.endTurnLoop = true;
                $.game.actingPlayer = null;
                (Object.values($.game.bonuses)?.flat() ?? []).forEach(bonus => {
                    if (bonus.interval === "TURN") bonus.hasBeenUsedThisInterval = false;
                });
                $.game.queue.unshift(...Array.from({length: $.game.players.length}, () => "TURN"), "TURN_LOOP_INNER");
            }
            return proceedWithScript();
        case "TURN":
            let player;
            if ($.game.harboriteToReassign !== null) player = $.game.actingPlayer;
            else if ($.game.actingPlayer) player = $.game.players[($.game.actingPlayer.id + 1) % $.game.players.length];
            else if ($.game.thisRoundAmbassadorOwner) {
                player = $.game.thisRoundAmbassadorOwner;
                $.game.thisRoundAmbassadorOwner = null;
            } else player = $.game.thisRoundFirstPlayer;

            // quit if no agents or feasible action-spaces
            if (!player.agents.length || !$.game.buildings.some(b => b.actionSpaces.some(a => 
                GameCommands.IsActionSpaceFeasible(a, player)
            ))) {
                $.game.actingPlayer = player;
                return proceedWithScript();
            }
            
            $.history.push({eventType: "TURN", description: null, historicGame: gameToHistoric()});
            $.game.actingPlayer = player;
            $.game.endTurnLoop = false;
            $.ui.callStack.push([player, "'s turn"]);

            $.misc.choosingBuildingForTurn = true;
            const actionSpace = await GameCommands.PlayerChoose({
                prompt: [player, " must choose an action space to assign ", "AGENT", " to."],
                predicate: GameCommands.IsActionSpaceFeasible,
                type: "GAME ACTION SPACE"
            });
            await GameCommands.AssignAgentToActionSpace(actionSpace);
            $.misc.choosingBuildingForTurn = false;

            let quest = null;
            if (player.activeQuests.some(q => GameCommands.IsQuestFeasible(q, player))) {
                quest = await GameCommands.PlayerChoose({
                    prompt: [player, " may choose ", "QUEST", " to complete."],
                    predicate: q => player.activeQuests.includes(q) && GameCommands.IsQuestFeasible(q, player),
                    skippable: true,
                    type: "PLAYER QUEST"
                });
                if (quest) await GameCommands.CompletePlayerQuest(quest, player);
            }

            $.ui.callStack.pop();
            $.history.at(-1).description = [$.game.actingPlayer, " assigns ", "AGENT", " to ", {tag: 'b', children: Buildings[actionSpace.buildingId].name}, ...(quest ? [" and completes ", {tag: 'b', children: quest.name}] : []) ];
            return proceedWithScript();
        case "REASSIGN_HARBORITES":
            if ($.game.buildings.find(b => b.id === BuildingNameIdMap["Waterdeep Harbor"]).actionSpaces.flatMap(as => as?.occupants ?? []).filter(o => o !== "AMBASSADOR").length) {
                $.history.push({eventType: "REASSIGN_HARBORITES", description: ["Reassigning ", "AGENT", " from ", {tag: 'b', children: "Waterdeep Harbor"}]});
            }
            $.game.queue.push("REASSIGN_HARBORITE");
            $.game.queue.push("REASSIGN_HARBORITE");
            $.game.queue.push("REASSIGN_HARBORITE");
            if ($.game.round < 8) $.game.queue.push("ROUND_START");
            else $.game.queue.push("GAME_END");
            return proceedWithScript();
        case "REASSIGN_HARBORITE": {
            if ($.game.harboriteToReassign === null) $.game.harboriteToReassign = 0;
            else $.game.harboriteToReassign++;
            const actionSpace = $.game.buildings.find(b => b.id === BuildingNameIdMap["Waterdeep Harbor"]).actionSpaces[$.game.harboriteToReassign];
            if (!actionSpace.occupants?.length || actionSpace.occupants[0] === "AMBASSADOR") return proceedWithScript();
            $.game.actingPlayer = $.game.players[actionSpace.occupants[0]];
            $.game.actingPlayer.agents.unshift(actionSpace.occupants.shift());
            $.game.endTurnLoop = false;
        } case "REASSIGN_HARBORITE_INNER":
            if (!$.game.endTurnLoop) {
                $.game.endTurnLoop = true;
                (Object.values($.game.bonuses)?.flat() ?? []).forEach(bonus => {
                    if (bonus.interval === "TURN") bonus.hasBeenUsedThisInterval = false;
                });
                $.game.queue.unshift("TURN", "REASSIGN_HARBORITE_INNER");
            }
            return proceedWithScript();
        case "GAME_END":
            $.game.players.forEach(p => p.resources = GameCommands.GetMergedResources(p.resources, {"VP": 
                p.lord.getBonusVP(p) 
                + p.resources["P"] + p.resources["W"] + p.resources["O"] + p.resources["B"] 
                + Math.floor(p.resources["GOLD"] / 2)
                - (p.resources["CORRU"] 
                    * Math.ceil((($.game.corruptionOnTrack ?? 0) - 25) / -3))
            }));
            $.ui.showLords = true;
            $.ui.callStack = ["Game end"];
            const maxVP = Math.max(...$.game.players.map(p => p.resources["VP"]));
            const VPWinners = $.game.players.filter(p => p.resources["VP"] === maxVP);
            const maxGoldAmongVPWinners = Math.max(...VPWinners.map(p => p.resources["GOLD"]));
            const winners = VPWinners.filter(p => p.resources["GOLD"] === maxGoldAmongVPWinners);
            await GameCommands.PlayerChoose({
                prompt: [winners, ` ${winners.length === 1 ? 'has' : 'have'} won!`],
                options: [
                    {label: [Icon('caret-left'), ' Return to menu'], id: null}
                ]
            });

            $.game = null;
            $.rerender();
    }
}

window.proceedWithScript = proceedWithScript;