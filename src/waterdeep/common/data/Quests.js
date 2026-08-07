import $ from "@/$.js";
import Icon, { ResourceIcon } from "@/components/Icon.js";
import GameCommands from "./GameCommands.js";
import { BuildingNameIdMap } from "./Buildings.js";
/** @import { Quest, PlotQuestBonus } from "@/types.js" */

let bonusId = 0;

/** @type {PlotQuestBonus[]} */
export const PlotQuestBonuses = [
    {id: bonusId++, feasible: (bonus) => bonus.owner.resources["CORRU"], trigger: (player) => `${player.id}_PURCHASES_BUILDING`, action: async (bonus) => {
        const actionSpace = await GameCommands.PlayerChoose({
            prompt: [bonus.owner, " may choose an action space to give ", "CORRU", " to."],
            type: "GAME ACTION SPACE",
            skippable: true
        });
        if (!actionSpace) return;
        await GameCommands.CostPlayerCost(bonus.owner, {"CORRU": 1});
        GameCommands.GiveActionSpaceResources(actionSpace, {"CORRU": 1});
    }, description: ["On purchasing ", "BUILDING", ", can move ", "CORRU", " from your tavern to any action space"]},
    {id: bonusId++, trigger: (player) => `${player.id}_ASSIGNS_AGENT_TO_BUILDING_${BuildingNameIdMap["Grinning Lion Tavern"]}`, action: async (bonus) => {
        if (await GameCommands.AwaitYesNo(["Will ", bonus.owner, " take ", {"B": 2, "CORRU": 1}, "?"]))
            await GameCommands.GivePlayerBenefits(bonus.owner, {"B": 2, "CORRU": 1});
    }, description: ["On assigning ", "AGENT", " to Grinning Lion Tavern, can get +", {"B": 2, "CORRU": 1}]},
    {id: bonusId++, trigger: (player) => `${player.id}_ASSIGNS_AGENT_TO_BUILDING_${BuildingNameIdMap["Aurora's Realms"]}`, action: async (bonus) => {
        if (await GameCommands.AwaitYesNo(["Will ", bonus.owner, " take ", {"GOLD": 4, "CORRU": 1}, "?"]))
            await GameCommands.GivePlayerBenefits(bonus.owner, {"GOLD": 4, "CORRU": 1});
    }, description: ["On assigning ", "AGENT", " to Aurora's Realms, can get +", {"GOLD": 4, "CORRU": 1}]},
    {id: bonusId++, trigger: (player) => `${player.id}_ASSIGNS_AGENT_TO_BUILDING_${BuildingNameIdMap["Field of Triumph"]}`, action: async (bonus) => {
        if (await GameCommands.AwaitYesNo(["Will ", bonus.owner, " take ", {"O": 2, "CORRU": 1}, "?"]))
            await GameCommands.GivePlayerBenefits(bonus.owner, {"O": 2, "CORRU": 1});
    }, description: ["On assigning ", "AGENT", " to Field of Triumph, can get +", {"O": 2, "CORRU": 1}]},
    {id: bonusId++, trigger: (player) => `${player.id}_ASSIGNS_AGENT_TO_BUILDING_${BuildingNameIdMap["The Plinth"]}`, action: async (bonus) => {
        if (await GameCommands.AwaitYesNo(["Will ", bonus.owner, " take ", {"W": 1, "CORRU": 1}, "?"]))
            await GameCommands.GivePlayerBenefits(bonus.owner, {"W": 1, "CORRU": 1});
    }, description: ["On assigning ", "AGENT", "to the Plinth, can get +", {"W": 1, "CORRU": 1}]},
    {id: bonusId++, feasible: (bonus) => bonus.owner.resources["CORRU"], trigger: (player) => `${player.id}_RETURNS_CORRU`, interval: "TURN", action: async (bonus) => {
        if (await GameCommands.AwaitYesNo(["Will ", bonus.owner, " return ", "CORRU", "?"]))
            await GameCommands.CostPlayerCost(bonus.owner, {"CORRU": 1});
    }, description: ["Once per turn, on returning ", "CORRU", ", can return +", "CORRU"]},
    {id: bonusId++, trigger: (player) => `${player.id}_ASSIGNS_AGENT_TO_BUILDING_${BuildingNameIdMap["Blackstaff Tower"]}`, action: async (bonus) => {
        if (await GameCommands.AwaitYesNo(["Will ", bonus.owner, " take ", {"P": 1, "CORRU": 1}, "?"]))
            await GameCommands.GivePlayerBenefits(bonus.owner, {"P": 1, "CORRU": 1});
    }, description: ["On assigning ", "AGENT", " to Blackstaff Tower, can get +", {"P": 1, "CORRU": 1}]},
    {id: bonusId++, trigger: (player) => `${player.id}_GETS_CORRU`, interval: "TURN", action: async (bonus) => {
        await GameCommands.GivePlayerBenefits(bonus.owner, {"INTRIGUE": 1});
    }, description: ["Once per turn, on getting ", "CORRU", ", get ", "INTRIGUE"]},
    {id: bonusId++, trigger: "SOMEONE_TAKES_FIRST_PLAYER", action: async (bonus) => {
        await GameCommands.GivePlayerBenefits(bonus.owner, {"O": 1});
        await GameCommands.GivePlayerBenefits($.game.nextRoundFirstPlayer, {"O": 1});
    }, description: ["On ", "FIRST", " claim, you and ", "FIRST", " get ", "O"]},
    {id: bonusId++, trigger: (player) => `${player.id}_ASSIGNS_AGENT_TO_BUILDING_${BuildingNameIdMap["Waterdeep Harbor"]}`, action: async (bonus) => {
        if (bonus.owner.intrigues?.filter(i => GameCommands.IsIntrigueFeasible(i)).length && await GameCommands.AwaitYesNo(["Will ", bonus.owner, " take ", "CORRU", " to play an additional ", "INTRIGUE", "? (1/2)"])) {
            await GameCommands.GivePlayerBenefits(bonus.owner, {"CORRU": 1});
            await GameCommands.ChooseAndPlayIntrigue(bonus.owner);
            if (bonus.owner.intrigues?.filter(i => GameCommands.IsIntrigueFeasible(i)).length && await GameCommands.AwaitYesNo(["Will ", bonus.owner, " play an additional ", "INTRIGUE", "? (2/2)"])) {
                await GameCommands.ChooseAndPlayIntrigue(bonus.owner);
            }
        }
    }, description: ["On assigning ", "AGENT", " to Waterdeep Harbor, can get ", "CORRU", " & play +≤", "INTRIGUE", "INTRIGUE"]},
    {id: bonusId++, trigger: (player) => `${player.id}_DOES_ACTION_GIVING_O`, action: async (bonus) => {
        await GameCommands.GivePlayerBenefits(bonus.owner, {"O": 1});
    }, description: ["On ", "BUILDING", "/", "INTRIGUE", " providing ", "O", ", get +", "O"]},
    {id: bonusId++, trigger: (player) => `${player.id}_DOES_ACTION_GIVING_GOLD`, action: async (bonus) => {
        await GameCommands.GivePlayerBenefits(bonus.owner, {"B": 1});
    }, description: ["On ", "BUILDING", "/", "INTRIGUE", " providing ", "GOLD", ", get ", "B"]},
    {id: bonusId++, trigger: "START_OF_ROUND", action: async (bonus) => {
        await GameCommands.GivePlayerBenefits(bonus.owner, {"PWOB": 1});
    }, description: ["On start of round, get ", "PWOB"]},
    {id: bonusId++, trigger: (player) => `${player.id}_COMPLETE_QUEST_COMMERCE`, action: async (bonus) => {
        await GameCommands.GivePlayerBenefits(bonus.owner, {"VP": 2});
    }, description: ["On completing ", "COMMERCE", " ", "QUEST", ", get +", {"VP": 2}]},
    {id: bonusId++, trigger: (player) => `${player.id}_DOES_ACTION_GIVING_P`, action: async (bonus) => {
        await GameCommands.GivePlayerBenefits(bonus.owner, {"INTRIGUE": 1});
    }, description: ["On ", "BUILDING", "/", "INTRIGUE", " providing ", "P", ", get ", "INTRIGUE"]},
    {id: bonusId++, trigger: (player) => `${player.id}_DOES_ACTION_GIVING_B`, action: async (bonus) => {
        await GameCommands.GivePlayerBenefits(bonus.owner, {"GOLD": 2});
    }, description: ["On ", "BUILDING", "/", "INTRIGUE", " providing ", "B", ", get ", {"GOLD": 2}]},
    {id: bonusId++, trigger: (player) => `${player.id}_PURCHASES_BUILDING`, action: async (bonus) => {
        await GameCommands.GivePlayerBenefits(bonus.owner, {"VP": 4});
    }, description: ["On purchasing ", "BUILDING", ", get +", {"VP": 4}]},
    {id: bonusId++, trigger: (player) => `${player.id}_COMPLETE_QUEST_SKULLDUGGERY`, action: async (bonus) => {
        await GameCommands.GivePlayerBenefits(bonus.owner, {"VP": 2});
    }, description: ["On completing ", "SKULLDUGGERY", " ", "QUEST", ", get ", {"VP": 2}]},
    {id: bonusId++, trigger: (player) => `${player.id}_PLAYS_INTRIGUE`, action: async (bonus) => {
        await GameCommands.GivePlayerBenefits(bonus.owner, {"VP": 2});
    }, description: ["On playing ", "INTRIGUE", ", get ", {"VP": 2}]},
    {id: bonusId++, trigger: (player) => `${player.id}_DOES_ACTION_GIVING_W`, interval: "ROUND", action: async (bonus) => {
        if (await GameCommands.AwaitYesNo(["Will ", bonus.owner, " exchange ", "POB", Icon('caret-right'), "W"])) {
            await GameCommands.CostPlayerCost(bonus.owner, {"POB": 1});
            await GameCommands.GivePlayerBenefits(bonus.owner, {"W": 1});
        }
    }, description: ["Once per round, on ", "BUILDING", "/", "INTRIGUE", " providing ", "W", ", can exchange ", {"POB": 1}, Icon('caret-right'), "W"]},
    {id: bonusId++, trigger: (player) => `${player.id}_COMPLETE_QUEST_PIETY`, action: async (bonus) => {
        await GameCommands.GivePlayerBenefits(bonus.owner, {"VP": 2});
    }, description: ["On completing ", "PIETY", " ", "QUEST", ", get ", {"VP": 2}]},
    {id: bonusId++, trigger: (player) => `${player.id}_COMPLETE_QUEST_WARFARE`, action: async (bonus) => {
        await GameCommands.GivePlayerBenefits(bonus.owner, {"VP": 2});
    }, description: ["On completing ", "WARFARE", " ", "QUEST", ", get ", {"VP": 2}]},
    {id: bonusId++, trigger: "SPECIAL_CAN_ASSIGN_AGENT_TO_OCCUPIED", action: async (bonus) => "Once per round, you can assign an Agent to a space containing an opponent's Agent", description: ["Once per round, can assign ", "AGENT", " to occupied action space"], trigger: "SPECIAL_CAN_ASSIGN_AGENT_TO_OCCUPIED"}, // doesn't do anything
    {id: bonusId++, trigger: "IMMEDIATELY", action: async (bonus) => {
        bonus.owner.agents.push(bonus.owner.id);
    }, description: ["Get permanent additional ", "AGENT"]},
    {id: bonusId++, trigger: (player) => `${player.id}_COMPLETE_QUEST_ARCANA`, action: async (bonus) => {
        await GameCommands.GivePlayerBenefits(bonus.owner, {"VP": 2});
    }, description: ["On completing ", "ARCANA", " ", "QUEST", ", get ", {"VP": 2}]},
];

let questId = 0;
let questBonusId = 0;

/** @type Quest[] */
const Quests = [
    {id: questId++, name: "Banish Evil Spirits", questType: "PIETY", isSkullport: true, cost: {"W": 2, "O": 2, "P": 1, "CORRU": {upTo: 2}}, benefit: {"VP": 5, "PWOB": 1 }},
    {id: questId++, name: "Bury The Bodies", questType: "SKULLDUGGERY", isSkullport: true, cost: {"O": 2, "B": 3, "GOLD": 2}, benefit: {"VP": 20, "CORRU": 2}},
    {id: questId++, name: "Donate To The City", questType: "COMMERCE", isSkullport: true, cost: {"W": 2, "P": 1, "GOLD": 10, "CORRU": {upTo: 3} }, benefit: {"VP": 13 }},
    {id: questId++, name: "Enter The Tower Of Seven Woes", questType: "PIETY", isSkullport: true, cost: {"PWOB": 7}, benefit: {"VP": 19, "W": 3, "CORRU": 4}},
    {id: questId++, name: "Establish Cult Cell", questType: "ARCANA", isSkullport: true, cost: {"B": 2, "P": 2, "GOLD": 3}, benefit: {"VP": 18, "O": 2, "P": 1, "INTRIGUE": 1, "CORRU": 3}},
    {id: questId++, name: "Fund Alchemical Research", questType: "COMMERCE", isSkullport: true, cost: {"W": 1, "B": 1, "P": 2, "GOLD": 4}, benefit: {"VP": 20, "GOLD": 12, "CORRU": 3}},
    {id: questId++, name: "Fund Pilgrimmage Of Waukeen", questType: "COMMERCE", isSkullport: true, cost: {"W": 1, "O": 1, "B": 2, "GOLD": 5}, benefit: {"VP": 16}},
    {id: questId++, name: "Institute Reforms", questType: "PIETY", isSkullport: true, cost: {"W": 4, "O": 1, "B": 1, "GOLD": 2, "CORRU": {upTo: 3} }, benefit: {"VP": 13 }},
    {id: questId++, name: "Investigate Thayan Vessel", questType: "ARCANA", isSkullport: true, cost: {"W": 1, "O": 2, "B": 2, "P": 2, "GOLD": 2}, benefit: {"VP": 13, "PWOB": 2, "INTRIGUE": 2}},
    {id: questId++, name: "Patrol Dock Ward", questType: "WARFARE", isSkullport: true, cost: {"W": 1, "O": 3, "B": 2, "GOLD": 2}, benefit: {"VP": 9, "B": 4}},
    {id: questId++, name: "Pay Fines", questType: "COMMERCE", isSkullport: true, cost: {"W": 1, "B": 3, "GOLD": 4, "CORRU": {upTo: 2} }, benefit: {"VP": 4 }},
    {id: questId++, name: "Renew Guards And Wards", questType: "ARCANA", isSkullport: true, cost: {"W": 1, "O": 1, "P": 2, "GOLD": 2, "CORRU": {upTo: 2} }, benefit: {"VP": 9 }},
    {id: questId++, name: "Rescue A Victim From The Skulls", questType: "SKULLDUGGERY", isSkullport: true, cost: {"O": 2, "B": 4, "P": 1, "CORRU": {upTo: 1} }, benefit: {"VP": 9, "PWOB": 1 }},
    {id: questId++, name: "Sanctify Temple To Oghma", questType: "PIETY", isSkullport: true, cost: {"W": 2, "P": 1, "GOLD": 5}, benefit: {"VP": 18}},
    {id: questId++, name: "Save Kidnapped nobles", questType: "SKULLDUGGERY", isSkullport: true, cost: {"B": 6, "P": 2, "GOLD": 5, "CORRU": {upTo: 3} }, benefit: {"VP": 9, "O": 4 }},
    {id: questId++, name: "Seal An Enctrance To Skullport", questType: "ARCANA", isSkullport: true, cost: {"W": 1, "O": 2, "B": 2, "P": 2, "CORRU": {upTo: 3} }, benefit: {"VP": 10 }},
    {id: questId++, name: "Uncover Drow Plot", questType: "WARFARE", isSkullport: true, cost: {"W": 1, "O": 5, "B": 2, "GOLD": 5, "CORRU": {upTo: 2} }, benefit: {"VP": 18 }},
    {id: questId++, name: "Ally With House Thann", questType: "COMMERCE", isSkullport: false, cost: {"W": 1, "B": 3, "P": 1, "GOLD": 8}, benefit: {"VP": 25}},
    {id: questId++, name: "Ambush Artor Morlin", questType: "WARFARE", isSkullport: false, cost: {"W": 1, "O": 3, "B": 1}, benefit: {"VP": 8, "GOLD": 4}},
    {id: questId++, name: "Bolster City Guard", questType: "WARFARE", isSkullport: false, cost: {"O": 9, "B": 2}, benefit: {"VP": 25}},
    {id: questId++, name: "Build A Reputation In Skullport", questType: "SKULLDUGGERY", isSkullport: false, cost: {"O": 1, "B": 3, "GOLD": 4}, benefit: {"VP": 10, "INTRIGUE": 1}},
    {id: questId++, name: "Confront The Xanathar", questType: "WARFARE", isSkullport: false, cost: {"W": 1, "O": 4, "B": 2, "P": 1}, benefit: {"VP": 20, "GOLD": 2}},
    {id: questId++, name: "Convert A Noble To Lathander", questType: "PIETY", isSkullport: false, cost: {"W": 2, "O": 1}, benefit: {"VP": 8, "FACE-UP QUEST": 1}},
    {id: questId++, name: "Create A Shrine To Oghma", questType: "PIETY", isSkullport: false, cost: {"W": 5, "GOLD": 2}, benefit: {"VP": 25}},
    {id: questId++, name: "Defeat Uprising From Undermountain", questType: "WARFARE", isSkullport: false, cost: {"W": 1, "O": 3, "B": 1, "GOLD": 2}, benefit: {"VP": 11, "O": 2}},
    {id: questId++, name: "Deliver An Ultimatum", questType: "WARFARE", isSkullport: false, cost: {"O": 4, "B": 1, "P": 1}, benefit: {"VP": 11, "GOLD": 4}},
    {id: questId++, name: "Deliver Weapons To Selune's Temple", questType: "WARFARE", isSkullport: false, cost: {"O": 4, "B": 1, "P": 1, "GOLD": 2}, benefit: {"VP": 9, "W": 2}},
    {id: questId++, name: "Discover Hidden Temple Of Lolth", questType: "PIETY", isSkullport: false, cost: {"W": 2, "O": 1, "B": 1}, benefit: {"VP": 10, "FACE-UP QUEST": 1}},
    {id: questId++, name: "Domesticate Owlbears", questType: "ARCANA", isSkullport: false, cost: {"W": 1, "P": 2}, benefit: {"VP": 8, "O": 1, "GOLD": 2}},
    {id: questId++, name: "Eliminate Vampire Coven", questType: "PIETY", isSkullport: false, cost: {"W": 2, "O": 2, "B": 1}, benefit: {"VP": 11, "GOLD": 4}},
    {id: questId++, name: "Establish Shadow Thieves' Guild", questType: "SKULLDUGGERY", isSkullport: false, cost: {"O": 1, "B": 8, "P": 1}, benefit: {"VP": 25}},
    {id: questId++, name: "Expose Cult Corruption", questType: "SKULLDUGGERY", isSkullport: false, cost: {"W": 1, "B": 4}, benefit: {"VP": 4, "W": 2}},
    {id: questId++, name: "Expose Red Wizards' Spies", questType: "ARCANA", isSkullport: false, cost: {"W": 1, "O": 1, "B": 2, "P": 2, "GOLD": 2}, benefit: {"VP": 20, "INTRIGUE": 1}},
    {id: questId++, name: "Form An Alliance With The Rashemi", questType: "PIETY", isSkullport: false, cost: {"W": 2, "P": 1}, benefit: {"VP": 10, "FACE-UP QUEST": 1}},
    {id: questId++, name: "Heal Fallen Gray Hand Soldiers", questType: "PIETY", isSkullport: false, cost: {"W": 2, "P": 1, "GOLD": 4}, benefit: {"VP": 6, "O": 6}},
    {id: questId++, name: "Loot The Crypt Of Chauntea", questType: "COMMERCE", isSkullport: false, otherBenefit: () => "get 1 deck quest", cost: {"W": 1, "B": 3, "GOLD": 2}, benefit: {"VP": 7, "INTRIGUE": 1, "FACE-DOWN QUEST": 1}},
    {id: questId++, name: "Host Festival For Sune", questType: "ARCANA", isSkullport: false, cost: {"O": 2, "P": 2, "GOLD": 4}, benefit: {"VP": 9, "W": 2}},
    {id: questId++, name: "Impersonate Adarbrent Noble", questType: "COMMERCE", isSkullport: false, cost: {"W": 1, "O": 2, "B": 2, "P": 1, "GOLD": 4}, benefit: {"VP": 18, "INTRIGUE": 2}},
    {id: questId++, name: "Infiltrate Halaster's Circle", questType: "ARCANA", isSkullport: false, cost: {"P": 5, "GOLD": 2}, benefit: {"VP": 25}},
    {id: questId++, name: "Investigate Aberrant Infestation", questType: "ARCANA", isSkullport: false, cost: {"W": 1, "O": 1, "P": 2}, benefit: {"VP": 13, "INTRIGUE": 1}},
    {id: questId++, name: "Perform The Penance Of Duty", questType: "PIETY", isSkullport: false, cost: {"W": 2, "O": 2, "GOLD": 4}, benefit: {"VP": 12, "W": 1, "O": 1}},
    {id: questId++, name: "Procure Stolen Goods", questType: "SKULLDUGGERY", isSkullport: false, cost: {"B": 3, "GOLD": 6}, benefit: {"VP": 8, "INTRIGUE": 2}},
    {id: questId++, name: "Raid On Undermountain", questType: "SKULLDUGGERY", isSkullport: false, cost: {"W": 1, "O": 2, "B": 4, "P": 1}, benefit: {"VP": 20, "GOLD": 2}},
    {id: questId++, name: "Raid Orc Stronghold", questType: "WARFARE", isSkullport: false, cost: {"O": 4, "B": 2}, benefit: {"VP": 8, "GOLD": 4}},
    {id: questId++, name: "Recruit For Blackstaff Academy", questType: "ARCANA", isSkullport: false, cost: {"O": 1, "B": 1, "P": 2, "GOLD": 4}, benefit: {"VP": 6, "P": 3}},
    {id: questId++, name: "Recruit Paladins For Tyr", questType: "PIETY", isSkullport: false, cost: {"W": 2, "O": 4, "GOLD": 4}, benefit: {"VP": 10, "W": 3}},
    {id: questId++, name: "Repel Seawraiths", questType: "WARFARE", isSkullport: false, cost: {"W": 1, "O": 4, "P": 1}, benefit: {"VP": 15, "GOLD": 2}},
    {id: questId++, name: "Retrieve Ancient Artifacts", questType: "ARCANA", isSkullport: false, cost: {"O": 2, "B": 1, "P": 2}, benefit: {"VP": 11, "GOLD": 4}},
    {id: questId++, name: "Safeguard Eltorchul Mage", questType: "COMMERCE", isSkullport: false, cost: {"O": 1, "B": 1, "P": 1, "GOLD": 4}, benefit: {"VP": 4, "P": 2}},
    {id: questId++, name: "Seal Gate To Cyric's Realm", questType: "PIETY", isSkullport: false, cost: {"W": 2, "B": 3, "GOLD": 4}, benefit: {"VP": 20}},
    {id: questId++, name: "Spy On The Lighthouse", questType: "COMMERCE", isSkullport: false, cost: {"O": 3, "B": 2, "GOLD": 2}, benefit: {"VP": 6, "GOLD": 6}},
    {id: questId++, name: "Steal From House Adarbrent", questType: "SKULLDUGGERY", isSkullport: false, cost: {"O": 1, "B": 4, "P": 1}, benefit: {"VP": 10, "GOLD": 6}},
    {id: questId++, name: "Steal Spellbook From Silverhand", questType: "ARCANA", isSkullport: false, cost: {"O": 1, "B": 2, "P": 2}, benefit: {"VP": 7, "GOLD": 4, "INTRIGUE": 2}},
    {id: questId++, name: "get Over Rival Organization", questType: "SKULLDUGGERY", isSkullport: false, cost: {"O": 1, "B": 2, "P": 1, "GOLD": 6}, benefit: {"VP": 10, "B": 4}},
    {id: questId++, name: "Thin The City Watch", questType: "COMMERCE", isSkullport: false, cost: {"W": 1, "O": 1, "B": 1, "GOLD": 4}, benefit: {"VP": 9, "B": 4}},
    {id: questId++, name: "Train Bladesingers", questType: "WARFARE", isSkullport: false, cost: {"O": 3, "P": 1}, benefit: {"VP": 4, "O": 1, "P": 1}},

    {id: questId++, name: "Assassinate Rivals", questType: "WARFARE", isSkullport: true, otherBenefit: async () => {
        await GameCommands.EachOpponentDoes(async (player) => {
            const count = (player.resources["P"] ?? 0) + (player.resources["W"] ?? 0) + (player.resources["O"] ?? 0) + (player.resources["B"] ?? 0);
            if (count) await GameCommands.CostPlayerCost(player, {"PWOB": 1});
        })
    }, cost: {"O": 4, "B": 1}, benefit: {"VP": 16, "CORRU": 2}, benefitDescription: ["Opponents return ", "PWOB"]},
	{id: questId++, name: "Improve Prison Security", questType: "WARFARE", isSkullport: true, otherBenefit: async () => {
        if (!$.game.actingPlayer.resources["CORRU"]) return;
        const max = Math.min(3, $.game.actingPlayer.resources["CORRU"]);
        const n = await GameCommands.PlayerChoose({
            prompt: ["How many ", "CORRU", " will ", $.game.actingPlayer, " destroy?"],
            options: Array.from({length: max + 1}, (_, i) => ({ id: i, label: i ? Array.from({length: i}, () => "CORRU") : "None" }))
        });
        $.game.actingPlayer.resources["CORRU"] -= n;
    }, cost: {"W": 1, "O": 4, "B": 2, "GOLD": 4}, benefit: {"VP": 8}, benefitDescription: ["Destroy ≤", {"CORRU": 3}, " from your tavern"]},
	{id: questId++, name: "Swindle The Builders' Guilds", questType: "SKULLDUGGERY", isSkullport: true, otherBenefit: async () => {
        for (let i = 0; i < 2; i++) {
            const building = await GameCommands.PlayerChoose({
                prompt: [$.game.actingPlayer, " must choose a ", "BUILDING", ` to own for free. (${i + 1} / 2)`],
                type: "SHOP BUILDING"
            });
            await GameCommands.PutShopBuildingUnderPlayerControl(building);
        }
    }, cost: {"W": 1, "O": 2, "B": 3, "GOLD": 5}, benefit: {"VP": 18, "CORRU": 3}, benefitDescription: ["Own ", "BUILDING", "BUILDING", " for free"]},
	{id: questId++, name: "Establish Harper's Safe House", questType: "SKULLDUGGERY", isSkullport: false, otherBenefit: () => {
        GameCommands.GivePlayerBenefits($.game.actingPlayer, {"VP": $.game.buildings.filter(b => b.owner === $.game.actingPlayer).length * 2});
    }, cost: {"O": 2, "B": 3, "GOLD": 2}, benefit: {"VP": 8}, benefitDescription: ["+", {"VP": 2}, " per ", "BUILDING", " you own"]},
	{id: questId++, name: "Lure Artisans Of Mirabar", questType: "COMMERCE", isSkullport: false, otherBenefit: async () => {
        const building = await GameCommands.PlayerChoose({
            prompt: [$.game.actingPlayer, " must choose a ", "BUILDING", " to own for free."],
            type: "SHOP BUILDING"
        });
        await GameCommands.PutShopBuildingUnderPlayerControl(building);
    }, cost: {"W": 1, "O": 1, "B": 1, "GOLD": 2}, benefit: {"VP": 4}, benefitDescription: ["Own ", "BUILDING", " for free"]},
	{id: questId++, name: "Placate The Walking Statue", questType: "COMMERCE", isSkullport: false, otherBenefit: async () => {
        await GameCommands.PutShopBuildingUnderPlayerControl($.game.buildingDeck.shift());
    }, cost: {"W": 2, "B": 2, "GOLD": 4}, benefit: {"VP": 10}, benefitDescription: ["Own random ", "BUILDING", " for free"]},
	{id: questId++, name: "Prison Break", questType: "SKULLDUGGERY", isSkullport: false, otherBenefit: async () => {
        if ($.game.actingPlayer.intrigues?.some(i => GameCommands.IsIntrigueFeasible(i))) return;
        if (await GameCommands.AwaitYesNo(["Will ", $.game.actingPlayer, " play ", "INTRIGUE", "?"]))
            await GameCommands.ChooseAndPlayIntrigue();
    }, cost: {"B": 4, "P": 2, "GOLD": 2}, benefit: {"VP": 14, "O": 2}, benefitDescription: ["Play ≤", "INTRIGUE"]},
	{id: questId++, name: "Research Chronomancy", questType: "ARCANA", isSkullport: false, otherBenefit: async () => {
        if (![...$.game.buildings, ...$.game.buildingShop].some(b => b.actionSpaces).some(a => a.occupants.some(o => o === $.game.actingPlayer.id))) return;
        const actionSpace = await GameCommands.PlayerChoose({
            type: ["GAME ACTION SPACE", "SHOP ACTION SPACE"],
            prompt: [$.game.actingPlayer, " must choose an action space to return ", "AGENT", ` from.`],
            predicate: as => as.occupants.includes($.game.actingPlayer.id),
            skippable: true
        });
        if (!actionSpace) return;
        const agentIndex = actionSpace.occupants.findIndex(o => o === $.game.actingPlayer.id);
        actionSpace.occupants.splice(agentIndex, 1);
        $.game.actingPlayer.agents.push($.game.actingPlayer.id);
    }, cost: {"P": 2, "GOLD": 4}, benefit: {"VP": 4, "P": 1},benefitDescription: ["Return ≤", "AGENT", " to your tavern"]},
	{id: questId++, name: "Send Aid To The Harpers", questType: "COMMERCE", isSkullport: false, otherBenefit: async () => {
        const opponent = await GameCommands.PlayerChoose({
            prompt: [],
            type: "PLAYER",
            predicate: (a) => a !== $.game.actingPlayer
        });
        await GameCommands.GivePlayerBenefits(opponent, {"GOLD": 4});
    }, cost: {"W": 1, "O": 1, "B": 1, "GOLD": 4}, benefit: {"VP": 15}, benefitDescription: ["Choose opponent to get ", {"GOLD": 4}]},
	
	{id: questId++, name: "Defame Rival Business", questType: "COMMERCE", isSkullport: true, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"W": 1, "O": 2, "B": 2, "GOLD": 4}, benefit: {"VP": 9}},
	{id: questId++, name: "Expand Guild Activities", questType: "SKULLDUGGERY", isSkullport: true, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"O": 1, "B": 2, "GOLD": 2}, benefit: {"VP": 8}},
	{id: questId++, name: "Extort Aurora", questType: "COMMERCE", isSkullport: true, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"B": 2, "GOLD": 4}, benefit: {"VP": 8}},
	{id: questId++, name: "Fix Champions' Games", questType: "WARFARE", isSkullport: true, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"O": 3, "GOLD": 2}, benefit: {"VP": 8}},
	{id: questId++, name: "Give Honor To Mask", questType: "PIETY", isSkullport: true, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"W": 1, "B": 1, "GOLD": 2}, benefit: {"VP": 8}},
	{id: questId++, name: "Protect Converts To Eilistraee", questType: "PIETY", isSkullport: true, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"W": 3, "O": 2, "P": 1}, benefit: {"VP": 10}},
	{id: questId++, name: "Recruit Academy Castoffs", questType: "ARCANA", isSkullport: true, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"O": 1, "P": 1, "GOLD": 2}, benefit: {"VP": 8}},
	{id: questId++, name: "Shelter Zhentarim Agents", questType: "SKULLDUGGERY", isSkullport: true, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"W": 1, "O": 3, "P": 2}, benefit: {"VP": 16, "CORRU": 1}},
	{id: questId++, name: "Train Castle Guards", questType: "WARFARE", isSkullport: true, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"O": 2, "P": 1, "GOLD": 5}, benefit: {"VP": 10}},
	{id: questId++, name: "Uncover Forbidden Lore", questType: "ARCANA", isSkullport: true, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"B": 2, "P": 3}, benefit: {"VP": 17}},
	{id: questId++, name: "Bolster Griffon Cavalry", questType: "WARFARE", isSkullport: false, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"O": 4, "GOLD": 4}, benefit: {"VP": 6}},
	{id: questId++, name: "Bribe The Shipwrights", questType: "COMMERCE", isSkullport: false, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"B": 4, "P": 1, "GOLD": 4}, benefit: {"VP": 10}},
	{id: questId++, name: "Defend The Tower Of Luck", questType: "PIETY", isSkullport: false, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"W": 2, "O": 1, "B": 1, "P": 1}, benefit: {"PWOB": 1}},
	{id: questId++, name: "Establish New Merchant Guild", questType: "COMMERCE", isSkullport: false, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"W": 1, "O": 2, "GOLD": 4}, benefit: {"VP": 8}},
	{id: questId++, name: "Explore Ahghairon's Tower", questType: "ARCANA", isSkullport: false, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"O": 1, "P": 2, "GOLD": 2}, benefit: {"VP": 6}},
	{id: questId++, name: "Fence Goods For Duke Of Darkness", questType: "SKULLDUGGERY", isSkullport: false, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"W": 1, "B": 3, "GOLD": 4}, benefit: {"VP": 6}},
	{id: questId++, name: "Infiltrate Builder's Hall", questType: "COMMERCE", isSkullport: false, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"O": 2, "B": 2, "GOLD": 4}, benefit: {"VP": 6}},
	{id: questId++, name: "Install A Spy In Castle Waterdeep", questType: "SKULLDUGGERY", isSkullport: false, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"B": 4, "GOLD": 4}, benefit: {"VP": 8}},
	{id: questId++, name: "Place A Sleeper Agent In Skullport", questType: "SKULLDUGGERY", isSkullport: false, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"O": 1, "B": 4, "P": 1}},
	{id: questId++, name: "Produce Miracle For The Masses", questType: "PIETY", isSkullport: false, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"W": 2, "GOLD": 4}, benefit: {"VP": 5}},
	{id: questId++, name: "Protect The House Of Wonder", questType: "PIETY", isSkullport: false, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"W": 2, "O": 1, "GOLD": 2}, benefit: {"VP": 8}},
	{id: questId++, name: "Quell Mercenary uprising", questType: "WARFARE", isSkullport: false, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"W": 1, "O": 4}, benefit: {"VP": 8}},
	{id: questId++, name: "Recover The Magister's Orb", questType: "ARCANA", isSkullport: false, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"B": 3, "P": 2}, benefit: {"VP": 6}},
	{id: questId++, name: "Recruit Lieutenant", questType: "WARFARE", isSkullport: false, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"W": 1, "O": 5, "B": 1, "P": 1}},
	{id: questId++, name: "Study The Illusk Arch", questType: "ARCANA", isSkullport: false, isPlotQuest: true, plotQuestBonus: PlotQuestBonuses[questBonusId++], cost: {"W": 1, "P": 2}, benefit: {"VP": 8}},

    // MANDATORIES
    {id: questId++, name: "Clear Rust Monster Nest", questType: "MANDATORY", isMandatoryQuest: true, cost: {"O": 1, "P": 1, "GOLD": 2}, benefit: {"VP": 2}},
    {id: questId++, name: "Hunt Hidden Ghoul", questType: "MANDATORY", isMandatoryQuest: true, cost: {"O": 1, "P": 1, "GOLD": 2}, benefit: {"VP": 2}},
    {id: questId++, name: "Repel Drow Invaders", questType: "MANDATORY", isMandatoryQuest: true, cost: {"W": 1, "B": 2}, benefit: {"VP": 2}},
    {id: questId++, name: "Stamp Out Cultists", questType: "MANDATORY", isMandatoryQuest: true, cost: {"W": 1, "O": 1, "B": 1}, benefit: {"VP": 2}},
    {id: questId++, name: "Fend Off Bandits", questType: "MANDATORY", isMandatoryQuest: true, cost: {"P": 1, "O": 2}, benefit: {"VP": 2}},
    {id: questId++, name: "Foil The Zhentarim", questType: "MANDATORY", isMandatoryQuest: true, cost: {"O": 1, "B": 1, "P": 1}, benefit: {"VP": 2}},
    {id: questId++, name: "Placate Angry Merchants", questType: "MANDATORY", isMandatoryQuest: true, cost: {"W": 1, "O": 1, "P": 1}, benefit: {"VP": 2}},
    {id: questId++, name: "Quell Riots", questType: "MANDATORY", isMandatoryQuest: true, cost: {"W": 2, "O": 1}, benefit: {"VP": 4}},
    {id: questId++, name: "Cover Up Scandal", questType: "MANDATORY", isMandatoryQuest: true, cost: {"P": 1, "W": 1, "O": 1, "B": 1, "CORRU": {upTo: 1}}, benefit: {"VP": 4}},
];

Quests.forEach(q => {
    if (q.plotQuestBonus) q.plotQuestBonus.quest = q;
})

export const QuestNameIdMap = Object.fromEntries(Quests.map(q => [q.name, q.id]));
export default Quests;