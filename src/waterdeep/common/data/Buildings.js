import $ from "@/$.js";
import Icon from "@/components/Icon.js";
import GameCommands from "./GameCommands.js";
/** @import { Building, ActionSpace } from "@/types.js" */

let buildingId = 0;

/** @type {Building[]} */
const Buildings = [
    {id: buildingId++, name: "Cryptkey Facilitations", isSkullport: true, goldCost: 7, ownerBenefits: {"GOLD": 3}, actionSpaces: [{
        benefit: {"B": 3, "GOLD": 5, "CORRU": 1}
    }]},
    {id: buildingId++, name: "Shradin's Zombies", isSkullport: true, goldCost: 6, ownerBenefits: {"GOLD": 3}, actionSpaces: [{
        benefit: {"O": 3, "W": 1, "CORRU": 1}
    }]},
    {id: buildingId++, name: "The Deepfires", isSkullport: true, goldCost: 6, ownerBenefits: {VP: 3}, actionSpaces: [{
        benefit: {"FACE-UP QUEST": 1, "PWOB": 1, "GOLD": 5}
    }]},
    {id: buildingId++, name: "The Hell Hound's Muzzle", isSkullport: true, goldCost: 8, ownerBenefits: {"PWOB": 1}, actionSpaces: [{
        benefit: {"W": 1, "O": 1, "B": 1, "P": 1, "CORRU": 1}
    }]},
    {id: buildingId++, name: "The Thrown Gauntlet", isSkullport: true, goldCost: 8, ownerBenefits: {"O": 1, "B": 1}, actionSpaces: [{
        benefit: {"O": 3, "B": 3, "CORRU": 1}
    }]},
    {id: buildingId++, name: "Hall of the Voice", isSkullport: true, default: true, actionSpaces: [{
        benefit: {"FACE-UP QUEST": 1, "INTRIGUE": 1, "GOLD": 5, "CORRU": 1}
    }]},
    {id: buildingId++, name: "Slavers' Market", isSkullport: true, default: true, actionSpaces: [{
        benefit: {"O": 2, "B": 2, "CORRU": 1}
    }]},
    {id: buildingId++, name: "Skull Island", isSkullport: true, default: true,actionSpaces: [{
        benefit: {"PWOB": 2, "CORRU": 1}
    }]},
    {id: buildingId++, name: "Aurora's Realms", isSkullport: false, default: true,actionSpaces: [{
        benefit: {"GOLD": 4}
    }]},
    {id: buildingId++, name: "Blackstaff Tower", isSkullport: false, default: true,actionSpaces: [{
        benefit: {"P": 1}
    }]},
    {id: buildingId++, name: "Field of Triumph", isSkullport: false, default: true,actionSpaces: [{
        benefit: {"O": 2}
    }]},
    {id: buildingId++, name: "The Grinning Lion Tavern", isSkullport: false, default: true,actionSpaces: [{
        benefit: {"B": 2}
    }]},
    {id: buildingId++, name: "The Plinth", isSkullport: false, default: true,actionSpaces: [{
        benefit: {"W": 1}
    }]},
    {id: buildingId++, name: "Dragon Tower", isSkullport: false, goldCost: 3, ownerBenefits: {"INTRIGUE": 1}, actionSpaces: [{
        benefit: {"P": 1, "INTRIGUE": 1}
    }]},
    {id: buildingId++, name: "Fetlock Court", isSkullport: false, goldCost: 8, ownerBenefits: {"PO": 1}, actionSpaces: [{
        benefit: {"O": 1, "P": 1}
    }]},
    {id: buildingId++, name: "Helmstar Warehouse", isSkullport: false, goldCost: 3, ownerBenefits: {"B": 1}, actionSpaces: [{
        benefit: {"B": 2, "GOLD": 2}
    }]},
    {id: buildingId++, name: "House of Good Spirits", isSkullport: false, goldCost: 3, ownerBenefits: {"O": 1}, actionSpaces: [{
        benefit: {"O": 1, "PWOB": 1}
    }]},
    {id: buildingId++, name: "House of Heroes", isSkullport: false, goldCost: 8, ownerBenefits: {"WO": 1}, actionSpaces: [{
        benefit: {"W": 1, "O": 2}
    }]},
    {id: buildingId++, name: "House of the Moon", isSkullport: false, goldCost: 3, ownerBenefits: {"GOLD": 2}, actionSpaces: [{
        benefit: {"FACE-UP QUEST": 1, "W": 1}
    }]},
    {id: buildingId++, name: "New Olamn", isSkullport: false, goldCost: 8, ownerBenefits: {"PB": 1}, actionSpaces: [{
        benefit: {"B": 2, "P": 1}
    }]},
    {id: buildingId++, name: "Northgate", isSkullport: false, goldCost: 3, ownerBenefits: {"VP": 2}, actionSpaces: [{
        benefit: {"PWOB": 1, "GOLD": 2}
    }]},
    {id: buildingId++, name: "The Skulkway", isSkullport: false, goldCost: 4, ownerBenefits: {"OB": 1}, actionSpaces: [{
        benefit: {"O": 1, "B": 1, "GOLD": 2}
    }]},
    {id: buildingId++, name: "The Stone House", isSkullport: false, goldCost: 4, ownerBenefits: {"GOLD": 2}, actionSpaces: [{
        benefit: () => ({"GOLD": $.game.buildings.filter(b => !b.default).length}),
        description: ["GOLD", " for each player-owned ", "BUILDING"]
    }]},
    {id: buildingId++, name: "The Tower of Luck", isSkullport: false, goldCost: 4, ownerBenefits: {"WB": 1}, actionSpaces: [{
        benefit: {"W": 1, "B": 2}
    }]},
    {id: buildingId++, name: "The Yawning Portal", isSkullport: false, goldCost: 4, ownerBenefits: {"PWOB": 1}, actionSpaces: [{
        benefit: {"PWOB": 2}
    }]},
    {id: buildingId++, name: "Secret Shrine", isSkullport: true, goldCost: 8, ownerBenefits: {"W": 1}, actionSpaces: [{
        cost: {"CORRU": 1},
        benefit: {"W": 1}
    }]},
    {id: buildingId++, name: "The Frontal Lobe", isSkullport: true, goldCost: 4, ownerBenefitsDescription: ["That ", "PWOB"], ownerBenefits: () => $.misc.lastCostChanges, actionSpaces: [{cost: {"PWOB": 1}, benefit: {"P": 3, "CORRU": 1}}]},
    {id: buildingId++, name: "The Poisoned Quill", isSkullport: true, goldCost: 5, ownerBenefits: {"INTRIGUE": 1}, actionSpaces: [{
        cost: {"CORRU": 1},
        benefit: {"INTRIGUE": 1}
    }]},
    {id: buildingId++, name: "Thimblewine's Pawnshop", isSkullport: true, goldCost: 4, ownerBenefits: {"GOLD": 2}, actionSpaces: [{
        cost: {"CORRU": 1},
        benefit: {"GOLD": 1}
    }]},
    {id: buildingId++, name: "House of Wonder", isSkullport: false, goldCost: 4, ownerBenefits: {"GOLD": 2}, actionSpaces: [{
        cost: {"GOLD": 2},
        benefit: {"PW": 2}
    }]},
    {id: buildingId++, name: "Smugglers' Dock", isSkullport: false, goldCost: 4, ownerBenefits: {"GOLD": 2}, actionSpaces: [{
        cost: {"GOLD": 2},
        benefit: {"OB": 4}
    }]},
    {id: buildingId++, name: "The Three Pearls", isSkullport: false, goldCost: 4, ownerBenefits: {"GOLD": 2}, actionSpaces: [{cost: {"PWOB": 2}, benefit: {"PWOB": 3}}]},
    {id: buildingId++, name: "Caravan Court", isSkullport: false, goldCost: 4, ownerBenefits: {"O": 1}, actionSpaces: [{
        onPurchasedOrRoundStart: {"O": 2}
    }]},
    {id: buildingId++, name: "The Golden Horn", isSkullport: false, goldCost: 4, ownerBenefits: {"GOLD": 2}, actionSpaces: [{
        onPurchasedOrRoundStart: {"GOLD": 4}
    }]},
    {id: buildingId++, name: "Jesters' Court", isSkullport: false, goldCost: 4, ownerBenefits: {"B": 1}, actionSpaces: [{
        onPurchasedOrRoundStart: {"B": 2}
    }]},
    {id: buildingId++, name: "Spires of the Morning", isSkullport: false, goldCost: 4, ownerBenefits: {"VP": 2}, actionSpaces: [{
        onPurchasedOrRoundStart: {"W": 1}
    }]},
    {id: buildingId++, name: "Tower of the Order", isSkullport: false, goldCost: 4, ownerBenefits: {"INTRIGUE": 1}, actionSpaces: [{
        onPurchasedOrRoundStart: {"P": 1}
    }]},
    {id: buildingId++, name: "Delver's Folly", isSkullport: true, goldCost: 6, ownerBenefits: {"VP": 2}, actionSpaces: [{
        description: ["CORRU", " from your tavern to any action space"],
        feasible: () => $.game.actingPlayer?.resources.CORRU,
        action: async () => {
            const actionSpace = await GameCommands.PlayerChoose({
                type: "GAME ACTION SPACE",
                prompt: [$.game.actingPlayer, " must choose an action space to put ", "CORRU", " on."]
            });
            GameCommands.GiveActionSpaceResources(actionSpace, {"CORRU": 1});
            await GameCommands.CostPlayerCost($.game.actingPlayer, {"CORRU": 1});
        }
    }]},
    {id: buildingId++, name: "Monsters Made To Order", isSkullport: true, goldCost: 3, ownerBenefits: {"VP": 2}, actionSpaces: [{
        onPurchasedOrRoundStart: {"CORRU": 1},
        feasible: (player, actionSpace) => [...$.game.buildingShop, ...$.game.buildings].flatMap(b => b.actionSpaces.flatMap(a => (a.occupants?.filter(o => o === player.id) ?? []))).length >= actionSpace.resources["CORRU"],
        description: ["Return ", "AGENT", " to your tavern for each ", "CORRU", " taken from here"],
        action: async () => {
            const corruCount = $.misc.lastSpaceResources["CORRU"] ?? 0;
            if (!corruCount) return;
            const agentCount = [...$.game.buildingShop, ...$.game.buildings].flatMap(b => b.actionSpaces.flatMap(a => (a.occupants?.filter(o => o === $.game.actingPlayer.id) ?? []))).length;
            if (corruCount === agentCount) {
                [...$.game.buildingShop, ...$.game.buildings].flatMap(b => b.actionSpaces).forEach(a => {
                    a.occupants = a.occupants.filter(o => o === $.game.actingPlayer.id);
                });
                $.game.actingPlayer.agents.push(...Array.from({length: corruCount}, () => $.game.actingPlayer.id));
            } else if (corruCount < agentCount) {
                for (let i = 0; i < corruCount; i++) {
                    const actionSpace = await GameCommands.PlayerChoose({
                        type: ["GAME ACTION SPACE", "SHOP ACTION SPACE"],
                        prompt: [$.game.actingPlayer, " must choose an action space to return ", "AGENT", ` from. (${i + 1} / ${corruCount})`],
                        predicate: as => as.occupants.includes($.game.actingPlayer.id)
                    });
                    const agentIndex = actionSpace.occupants.findIndex(o => o === $.game.actingPlayer.id);
                    actionSpace.occupants.splice(agentIndex, 1);
                    $.game.actingPlayer.agents.push($.game.actingPlayer.id);
                }
            }

        }
    }]},
    {id: buildingId++, name: "The Dark Maiden", isSkullport: true, goldCost: 9, ownerBenefits: {"VP": 3}, actionSpaces: [{
        action: async () => {
            if (!$.game.actingPlayer.resources["CORRU"]) return;
            const max = Math.min(2, $.game.actingPlayer.resources["CORRU"]);
            const n = await GameCommands.PlayerChoose({
                prompt: ["How many ", "CORRU", " will ", $.game.actingPlayer, " destroy?"],
                options: Array.from({length: max + 1}, (_, i) => ({ id: i, label: i ? Array.from({length: i}, () => "CORRU") : "None" }))
            });
            $.game.actingPlayer.resources["CORRU"] -= n;
        },
        description: ["Destroy ≤", {"CORRU": 2}, " from your tavern"]
    }]},
    {id: buildingId++, name: "Builder's Hall", isSkullport: false, default: true, actionSpaces: [{
        onPurchasedOrRoundStart: () => $.game.buildingShop.forEach(b => GameCommands.GiveActionSpaceResources(b.actionSpaces[0], {"VP": 1})),
        onPurchasedOrRoundStartDescription: ["VP", " to each ", "BUILDING", " in shop"],
        feasible: (player) => ((player.resources["GOLD"] ?? 0) >= Math.min(...$.game.buildingShop.map(b => b.goldCost)) && $.game.buildings.find(b => b.id === BuildingNameIdMap["Builder's Hall"])?.actionSpaces[0].occupants?.length),
        action: async () => {
            const building = await GameCommands.PlayerChoose({
                prompt: [$.game.actingPlayer, " must choose a ", "BUILDING", " to purchase."],
                type: "SHOP BUILDING",
                predicate: b => b.goldCost <= $.game.actingPlayer.resources["GOLD"]
            });
            await GameCommands.PurchaseBuilding(building);
        },
        description: ["Purchase ", "BUILDING"],
    }]},
    {id: buildingId++, name: "Castle Waterdeep", isSkullport: false, default: true, actionSpaces: [{
        action: async () => {
            $.game.nextRoundFirstPlayer = $.game.actingPlayer;
            await GameCommands.GivePlayerBenefits($.game.actingPlayer, {"INTRIGUE": 1});
            await GameCommands.HandleBonuses(`SOMEONE_TAKES_FIRST_PLAYER`);
        },
        description: ["FIRST", "INTRIGUE"]
    }]},
    {id: buildingId++, name: "Cliffwatch Inn", isSkullport: false, default: true, actionSpaces: [
        {benefit: {"FACE-UP QUEST": 1, "GOLD": 2}},
        {benefit: {"FACE-UP QUEST": 1, "INTRIGUE": 1}},
        {
            action: async () => {
                $.game.questDeck.push(...$.game.faceUpQuests);
                $.game.faceUpQuests = [
                    $.game.questDeck.shift(), $.game.questDeck.shift(),
                    $.game.questDeck.shift(), $.game.questDeck.shift()
                ];
                await GameCommands.GivePlayerBenefits($.game.actingPlayer, {"FACE-UP QUEST": 1});
            },
            description: ["Reset all ", "QUEST", "; ", "FACE-UP QUEST"]
        }
    ]},
    {id: buildingId++, name: "Waterdeep Harbor", isSkullport: false, default: true, actionSpaces: [
        {
            description: [], 
            feasible: (player) => player.intrigues.some(i => GameCommands.IsIntrigueFeasible(i, player)), 
            action: async () => { await GameCommands.ChooseAndPlayIntrigue() }
        },
        {
            description: ["Play ", "INTRIGUE", "; reassign ", "AGENT", " after this round"],
            feasible: (player) => player.intrigues.some(i => GameCommands.IsIntrigueFeasible(i, player)) && $.game.buildings.find(b => b.id === BuildingNameIdMap["Waterdeep Harbor"])?.actionSpaces[0].occupants?.length, 
            action: async () => { await GameCommands.ChooseAndPlayIntrigue() }
        },
        {
            description: [],
            feasible: (player) => player.intrigues.some(i => GameCommands.IsIntrigueFeasible(i, player)) && (() => {
                const building = $.game.buildings.find(b => b.id === BuildingNameIdMap["Waterdeep Harbor"]);
                return building?.actionSpaces[0].occupants?.length && building?.actionSpaces[1].occupants?.length;
            })(),
            action: async () => { await GameCommands.ChooseAndPlayIntrigue(); },
        },
    ]},
    {id: buildingId++, name: "Heroes' Garden", isSkullport: false, goldCost: 4, ownerBenefits: {"VP": 2}, actionSpaces: [{
        action: async () => {
            await GameCommands.GivePlayerBenefits($.game.actingPlayer, {"FACE-UP QUEST": 1});
            const quest = $.game.actingPlayer.activeQuests.at(-1);
            if (GameCommands.IsQuestFeasible(quest) && await GameCommands.AwaitYesNo(["Will ", $.game.actingPlayer, " complete ", "QUEST", " ", {tag: 'b', children: quest.name}, " immediately for +", {"VP": 4}, "?"])) {
                await GameCommands.CompletePlayerQuest(quest);
                await GameCommands.GivePlayerBenefits($.game.actingPlayer, {"VP": 4});
            }
        },
        description: ["Get ", "FACE-UP QUEST", "; may complete immediately for +", {"VP": 4}]
    }]}, 
    {id: buildingId++, name: "The Palace of Waterdeep", isSkullport: false, goldCost: 4, ownerBenefits: {"VP": 2}, actionSpaces: [{
        action: () => {
            if (!$.game.nextRoundAmbassadorOwner) $.game.nextRoundAmbassadorOwner = $.game.actingPlayer;
        },
        description: ["Assign the Ambassador (", "AMBASSADOR", ") next round"]
    }]},
    {id: buildingId++, name: "The Waymoot", isSkullport: false, goldCost: 4, ownerBenefits: {"VP": 2}, actionSpaces: [{
        onPurchasedOrRoundStart: {"VP": 3},
        benefit: {"FACE-UP QUEST": 1}
    }]},
    {id: buildingId++, name: "The Zoarstar", isSkullport: false, goldCost: 8, ownerBenefits: {"VP": 2}, actionSpaces: [{
        feasible: (player) => [...$.game.buildingShop, ...$.game.buildings].some(b => b.actionSpaces.some(a => a.occupants?.some(o => o !== player.id))),
        action: async () => {
            const actionSpace = await GameCommands.PlayerChoose({
                prompt: ["Choose any opponent-occupied action space."],
                type: ["GAME ACTION SPACE", "SHOP ACTION SPACE"],
                predicate: (as) => as.occupants?.some(o => o !== $.game.actingPlayer.id),
                skippable: true
            });
            if (actionSpace) await GameCommands.UseActionSpace(actionSpace);
        },
        description: ["Use any opponent-occupied action space"]
    }]} 
];

export const BuildingNameIdMap = Object.fromEntries(Buildings.map(b => [b.name, b.id]));
export default Buildings.map(b => ({...b, actionSpaces: b.actionSpaces.map((a, i) => ({...a, buildingId: b.id, index: i}))}));