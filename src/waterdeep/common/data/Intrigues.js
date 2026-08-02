import $ from "@/$.js";
import Icon, { ResourceIcon } from "@/components/Icon.js";
import GameCommands from "./GameCommands.js";
import { BuildingNameIdMap } from "./Buildings.js";
import Quests, { QuestNameIdMap } from "./Quests.js";
/** @import { Intrigue, Costs, Benefits, Quest, Player } from "@/types.js" */

/**
 * @param {string} questName
 * @param {(player: Player) => boolean | null} playerIsFeasible
 * @returns {Partial<Intrigue>}
 */
function mandatoryQuestPartial(questName, playerIsFeasible = null) {
    const quest = Quests[QuestNameIdMap[questName]];
    const target = playerIsFeasible ? ["an opponent with ≥", "CORRU"] : ["an opponent"]
    return {
        name: questName,
        description: ["Give ", ...target, " a ", "MANDATORY", " ", "MANDATORY_QUEST", ": ", quest.cost, Icon('caret-right'), quest.benefit],
        feasible: playerIsFeasible ? () => $.game.players.some(p => p !== $.game.actingPlayer && playerIsFeasible(p)) : null,
        action: async () => {
            const opp = await GameCommands.PlayerChoose({
                type: "PLAYER",
                predicate: (p) => p !== $.game.actingPlayer && (playerIsFeasible ? playerIsFeasible(p) : true),
                prompt: [$.game.actingPlayer, " must choose ", ...target, " to give the ", "MANDATORY", " ", "MANDATORY_QUEST", " ", quest.cost, Icon('caret-right'), quest.benefit, "."]
            });
            opp.activeQuests.push(quest);
        }
    };
}

/**
 * @param {Benefits} youGet 
 * @param {Benefits} opponentsGet 
 * @param {boolean} mandatory
 * @returns 
 */
function getXEachPlayerCanGetYPartial(youGet, opponentsGet, mandatory = false) {
    return {
        description: ["Get ", youGet, (mandatory ? "; opponents get " : "; opponents can get "), opponentsGet],
        action: async () => {
            await GameCommands.GivePlayerBenefits($.game.actingPlayer, youGet);
            await GameCommands.EachOpponentDoes(async (pl) => {
                if (mandatory || await GameCommands.AwaitYesNo(["Will ", pl, " get ", opponentsGet, "?"]))
                    await GameCommands.GivePlayerBenefits(pl, opponentsGet);
            });
        }
    };
}

/**
 * @param {Costs} returned 
 * @param {Benefits} reward 
 */
function opponentsReturnXOrYouGetYPartial(returned, reward) {
    return {
        description: ["Opponents return ", returned, "; get ", reward, " per opponent who couldn't"],
        action: async () => {
            await GameCommands.EachOpponentDoes(async (pl) => {
                if (GameCommands.ResourcesSatisfiesCost(pl.resources, returned))
                    await GameCommands.CostPlayerCost(pl, returned);
                else await GameCommands.GivePlayerBenefits($.game.actingPlayer, reward);
            });
        }
    }
}

/**
 * 
 * @param {Benefits} forYou 
 * @param {Benefits} forBestFriend 
 */
function giftForYouAndBestFriendPartial(forYou, forBestFriend) {
    return {
        description: ["Get ", forYou, "; a chosen opponent gets ", forBestFriend],
        action: async () => {
            await GameCommands.GivePlayerBenefits($.game.actingPlayer, forYou);
            await GameCommands.GivePlayerBenefits((await GameCommands.PlayerChoose({
                prompt: [$.game.actingPlayer, " must choose an opponent to receive ", forBestFriend, "."],
                type: "PLAYER",
                predicate: p => p !== $.game.actingPlayer
            })), forBestFriend);
        }
    }
}

/**
 * @param {Benefits} get 
 * @param {Costs} canGive 
 * @param {Benefits} toGet 
 * @returns 
 */
function getXEveryoneCanGiveYForZPartial(get, canGive, toGet) {
    return {
        description: ["Get ", get, "; opponents can give you ", canGive, " to get ", toGet],
        action: async () => {
            await GameCommands.GivePlayerBenefits($.game.actingPlayer, get);
            await GameCommands.EachOpponentDoes(async pl => {
                if (GameCommands.ResourcesSatisfiesCost(pl.resources, canGive) && await GameCommands.AwaitYesNo(["Will ", pl, " give ", canGive, " to ", $.game.actingPlayer, " to get ", toGet, "?"])) {
                    await GameCommands.CostPlayerCost(pl, canGive);
                    await GameCommands.GivePlayerBenefits($.game.actingPlayer, canGive);
                    await GameCommands.GivePlayerBenefits(pl, toGet);
                }
            })
        }
    }
}

/** @type {Intrigue[]} */
export const IntrigueTypes = [
    // MANDATORIES (done)
    {count: 1, ...mandatoryQuestPartial("Clear Rust Monster Nest")},
    {count: 1, ...mandatoryQuestPartial("Hunt Hidden Ghoul")},
    {count: 1, ...mandatoryQuestPartial("Repel Drow Invaders")},
    {count: 1, ...mandatoryQuestPartial("Stamp Out Cultists")},
    {count: 1, ...mandatoryQuestPartial("Fend Off Bandits")},
    {count: 1, ...mandatoryQuestPartial("Foil The Zhentarim")},
    {count: 1, ...mandatoryQuestPartial("Placate Angry Merchants")},
    {count: 1, ...mandatoryQuestPartial("Quell Riots")},
    {count: 1, ...mandatoryQuestPartial("Cover Up Scandal", (p) => p.resources["CORRU"])},
    

    // GET X, EACH PLAYER GETS Y
    {name: "Call For Adventurers", count: 2, ...getXEachPlayerCanGetYPartial({"PWOB": 2}, {"PWOB": 1}, true)},

    // GET X, EACH PLAYER CAN GET Y
    {name: "Blackmarket Money", count: 1, isSkullport: true, ...getXEachPlayerCanGetYPartial({"GOLD": 8, "CORRU": 1}, {"GOLD": 4, "CORRU": 1})},
    {name: "Dark Dagger Assassination", count: 1, isSkullport: true, ...getXEachPlayerCanGetYPartial({"B": 4, "CORRU": 1}, {"B": 2, "CORRU": 1})},
    {name: "Donations For Cyric", count: 1, isSkullport: true, ...getXEachPlayerCanGetYPartial({"W": 2, "CORRU": 1}, {"W": 1, "CORRU": 1})},
    {name: "Iron Ring Slaves", count: 1, isSkullport: true, ...getXEachPlayerCanGetYPartial({"O": 4, "CORRU": 1}, {"O": 2, "CORRU": 1})},
    {name: "Mind Flayer Mercenaries", count: 1, isSkullport: true, ...getXEachPlayerCanGetYPartial({"P": 1, "CORRU": 1}, {"P": 1, "CORRU": 1})},

    // GET X, EACH PLAYER CAN GIVE YOU Y FOR Z
    {name: "Summon The Faithful", count: 1, description: ["Get ", "W", "; opponents can give you ", "W", " to get ", {"VP": 5}], action: async () => {
        await GameCommands.GivePlayerBenefits($.game.actingPlayer, {"W": 1});
        await GameCommands.EachOpponentDoes(async (pl) => {
            if (pl.resources["W"] && await GameCommands.AwaitYesNo(["Will ", pl, " give ", "W", " to ", $.game.actingPlayer, " to get ", {"VP": 5}, "?"])) {
                await GameCommands.CostPlayerCost(pl, {"W": 1});
                await GameCommands.GivePlayerBenefits($.game.actingPlayer, {"W": 1});
                await GameCommands.GivePlayerBenefits(pl, {"VP": 5});
            }
        });
    }},
    {name: "Tax Collection", count: 2, description: ["Get ", {"GOLD": 4}, "; opponents can give you ", {"GOLD": 4}, " to get ", {"VP": 4}], action: async () => {
        await GameCommands.GivePlayerBenefits($.game.actingPlayer, {"GOLD": 4});
        await GameCommands.EachOpponentDoes(async (pl) => {
            if (pl.resources["GOLD"] >= 4 && await GameCommands.AwaitYesNo(["Will ", pl, " give ", {"GOLD": 4}, " to ", $.game.actingPlayer, " to get ", {"VP": 4}, "?"])) {
                await GameCommands.CostPlayerCost(pl, {"GOLD": 4});
                await GameCommands.GivePlayerBenefits($.game.actingPlayer, {"GOLD": 4});
                await GameCommands.GivePlayerBenefits(pl, {"VP": 4});
            }
        });
    }},

    // different b/c payment
    {name: "Scapegoat", count: 2, isSkullport: true, feasible: () => GameCommands.ResourcesSatisfiesCost($.game.actingPlayer.resources, {"PWOB": 1}), description: ["Return ", {"PWOB": 1, "CORRU": {upTo: 2}}, "; opponents can return ", {"PWOB": 2, "CORRU": {upTo: 1}}], action: async () => {
        await GameCommands.CostPlayerCost($.game.actingPlayer, {"PWOB": 1, "CORRU": {upTo: 2}});
        await GameCommands.EachOpponentDoes(async (pl) => {
            if (GameCommands.ResourcesSatisfiesCost(pl.resources, {"PWOB": 2}) && await GameCommands.AwaitYesNo(["Will ", pl, " return ", {"PWOB": 2, "CORRU": {upTo: 1}}, "?"]))
                await GameCommands.CostPlayerCost(pl, {"PWOB": 2, "CORRU": {upTo: 1}});
        });
    }},
    {name: "Bribe The Watch", count: 1, isSkullport: true, feasible: () => $.game.actingPlayer.resources["GOLD"] >= 2, description: ["Return ", {"GOLD": 2, "CORRU": {upTo: 2}}, "; opponents can return ", {"GOLD": 4, "CORRU": {upTo: 1}}],
    action: async () => {
        await GameCommands.CostPlayerCost($.game.actingPlayer, {"GOLD": 2, "CORRU": {upTo: 2}});
        await GameCommands.EachOpponentDoes(async (pl) => {
            if (pl.resources["GOLD"] >= 4 && await GameCommands.AwaitYesNo(["Will ", pl, " return ", {"GOLD": 4, "CORRU": {upTo: 1}}, "?"]))
                await GameCommands.CostPlayerCost(pl, {"GOLD": 4, "CORRU": {upTo: 1}});
        });
    }},

    // FOR EACH WHO COULDN'T PAY X, TAKE Y
    {name: "Ambush", count: 2, ...opponentsReturnXOrYouGetYPartial({"O": 1}, {"O": 1})},
    {name: "Arcane Mishap", count: 2, ...opponentsReturnXOrYouGetYPartial({"P": 1}, {"INTRIGUE": 1})},
    {name: "Assassination", count: 2, ...opponentsReturnXOrYouGetYPartial({"B": 1}, {"GOLD": 2})},
    {name: "Lack Of Faith", count: 2, ...opponentsReturnXOrYouGetYPartial({"W": 1}, {"VP": 2})},

    // DRAW SPECIAL QUESTS
    {name: "Bidding War", count: 3, description: ["Reveal ", "QUEST", " per player; starting with you, everyone chooses ", "QUEST"], action: async () => {
        let quests = $.game.questDeck.splice(0, $.game.players.length);
        const myQ = await GameCommands.PlayerChoose({
            prompt: [$.game.actingPlayer, " must choose ", "QUEST", "."],
            options: quests
        });
        quests = quests.filter(q => q !== myQ);
        $.game.actingPlayer.activeQuests.push(myQ);
        await GameCommands.EachOpponentDoes(async pl => {
            const theirQ = await GameCommands.PlayerChoose({
                prompt: [pl, " must choose ", "QUEST", "."],
                options: quests
            });
            quests = quests.filter(q => q !== theirQ);
            pl.activeQuests.push(theirQ);
        });
    }},
    {name: "Special Assignment", count: 2, description: ["Draw a random ", "QUEST", " of a selected type"], action: async () => {
        const type = await GameCommands.PlayerChoose({
            prompt: [$.game.actingPlayer, " must choose a quest type."],
            options: ["ARCANA", "COMMERCE", "PIETY", "SKULLDUGGERY", "WARFARE"].map(t => ({id: t, label: t}))
        });
        const questIndex = $.game.questDeck.findIndex(q => q.questType === type);
        $.game.actingPlayer.activeQuests.push($.game.questDeck.splice(questIndex, 1)[0]);
    }},

    // GIFT FOR YOU AND YOUR BEST FRIEND
    {name: "Conscription", count: 2, ...giftForYouAndBestFriendPartial({"O": 2}, {"O": 1})},
    {name: "Crime Wave", count: 2, ...giftForYouAndBestFriendPartial({"B": 2}, {"B": 1})},
    {name: "Good Faith", count: 2, ...giftForYouAndBestFriendPartial({"W": 2}, {"W": 1})},
    {name: "Graduation Day", count: 2, ...giftForYouAndBestFriendPartial({"P": 2}, {"P": 1})},
    {name: "Spread The Wealth", count: 2, ...giftForYouAndBestFriendPartial({"GOLD": 4}, {"GOLD": 2})},

    // TAKE X, EACH OPPONENT CAN GIVE YOU Y IN EXCHANGE FOR Z
    {name: "Recruit Spies", count: 1, ...getXEveryoneCanGiveYForZPartial({"B": 2}, {"B": 1}, {"VP": 3})},
    {name: "Request Assistance", count: 1, ...getXEveryoneCanGiveYForZPartial({"O": 2}, {"O": 1}, {"VP": 3})},
    {name: "Research Agreement", count: 1, ...getXEveryoneCanGiveYForZPartial({"P": 1}, {"P": 1}, {"VP": 5})},

    // MISC
    {name: "Release The Hounds", description: ["Destroy ", {"CORRU": 2}, " from the track"], count: 2, isSkullport: true, feasible: () => $.game.corruptionOnTrack >= 2, action: () => {
        $.game.corruptionOnTrack -= 2;
    }},

    {name: "Call In A Favor", description: ["Get ", {"GOLD": 4}, '/', {"O": 2}, '/', {"B": 2}, '/', "P", '/', "W"], count: 2, action: async () => {
        const options = [{"GOLD": 4}, {"O": 2}, {"B": 2}, {"P": 1}, {"W": 1}];
        const optionId = await GameCommands.PlayerChoose({
            prompt: [$.game.actingPlayer, " must choose a reward."],
            options: options.map((o, i) => ({label: o, id: i}))
        });
        await GameCommands.GivePlayerBenefits($.game.actingPlayer, options[optionId]);
    }},

    {name: "Repent", description: ["Return ", "CORRU"], count: 3, isSkullport: true, feasible: () => $.game.actingPlayer.resources["CORRU"], action: async () => await GameCommands.CostPlayerCost($.game.actingPlayer, {"CORRU": 1})},

    {name: "Bribe Agent", description: ["Return ", {"GOLD": 2}, "; use an opponent-occupied action space"], count: 2, feasible: () => $.game.actingPlayer.resources["GOLD"] >= 2 && [...$.game.buildingShop, ...$.game.buildings].flatMap(b => b.actionSpaces).filter(as => GameCommands.IsActionSpaceFeasible(as, $.game.actingPlayer, true, true) && as.occupants.some(o => o !== $.game.actingPlayer.id))?.length, action: async () => {
        await GameCommands.CostPlayerCost($.game.actingPlayer, {"GOLD": 2});
        const space = await GameCommands.PlayerChoose({
            type: ["GAME ACTION SPACE", "SHOP ACTION SPACE"],
            prompt: [$.game.actingPlayer, " must choose an opponent-occupied action space to use."],
            predicate: (as) => GameCommands.IsActionSpaceFeasible(as, $.game.actingPlayer, true, true) && as.occupants.some(o => o !== $.game.actingPlayer.id)
        });
        await GameCommands.UseActionSpace(space);
    }},

    {name: "Free Drinks", description: ["Steal ", "PWOB", " from an opponent"], count: 2, feasible: () => $.game.players.some(p => p !== $.game.actingPlayer && (p.resources["P"] || p.resources["W"] || p.resources["O"] || p.resources["B"])), action: async () => {
        const opponent = await GameCommands.PlayerChoose({
            type: "PLAYER",
            predicate: p => p !== $.game.actingPlayer && (p.resources["P"] || p.resources["W"] || p.resources["O"] || p.resources["B"]),
            prompt: [$.game.actingPlayer, " must choose a player to steal ", "PWOB", " from."]
        });
        const resources = ["P", "W", "O", "B"].filter(r => opponent.resources[r]);
        const resource = await GameCommands.PlayerChoose({
            prompt: [$.game.actingPlayer, " must choose ", "PWOB", " to steal."],
            options: resources.map(r => ({id: r, label: r}))
        });
        await GameCommands.CostPlayerCost(opponent, {[resource]: 1});
        await GameCommands.GivePlayerBenefits($.game.actingPlayer, {[resource]: 1});
    }},

    {name: "Change Of Plans", description: ["Discard active ", "QUEST", " for ", {"VP": 6}, "; opponents can discard active ", "QUEST", " for ", {"VP": 3}], count: 1, feasible: () => $.game.actingPlayer.activeQuests?.length, action: async () => {
        const quest = await GameCommands.PlayerChoose({
            type: "PLAYER QUEST",
            predicate: q => $.game.actingPlayer.activeQuests.includes(q),
            prompt: [$.game.actingPlayer, " must choose ", "QUEST", " to discard."]
        });
        $.game.actingPlayer.activeQuests = $.game.actingPlayer.activeQuests.filter(q => q !== quest);
        $.game.questDeck.push(quest);
        await GameCommands.GivePlayerBenefits($.game.actingPlayer, {"VP": 6});
        await GameCommands.EachOpponentDoes(async pl => {
            if (!pl.activeQuests?.length) return;
            const quest = await GameCommands.PlayerChoose({
                type: "PLAYER QUEST",
                predicate: q => pl.activeQuests.includes(q),
                prompt: [pl, " must choose ", "QUEST", " to discard."]
            });
            pl.activeQuests = pl.activeQuests.filter(q => q !== quest);
            $.game.questDeck.push(quest);
            await GameCommands.GivePlayerBenefits(pl, {"VP": 3});
        })
    }},

    {name: "Doppleganger", description: ["Use an opponent-occupied action space, where the opponent has more ", "CORRU", " than you"], count: 1, isSkullport: true, feasible: () => [...$.game.buildingShop, ...$.game.buildings].flatMap(b => b.actionSpaces).filter(as => GameCommands.IsActionSpaceFeasible(as, $.game.actingPlayer, true, true) && as.occupants.some(o => o !== $.game.actingPlayer.id && o !== "AMBASSADOR" && $.game.players[o].resources["CORRU"] > $.game.actingPlayer.resources["CORRU"]))?.length, action: async () => {
        const space = await GameCommands.PlayerChoose({
            type: ["GAME ACTION SPACE", "SHOP ACTION SPACE"],
            prompt: [$.game.actingPlayer, " must choose an opponent-occupied action space to use, where the opponent has more ", "CORRU", " than ", $.game.actingPlayer],
            predicate: (as) => GameCommands.IsActionSpaceFeasible(as, $.game.actingPlayer, true, true) && as.occupants.some(o => o !== $.game.actingPlayer.id && o !== "AMBASSADOR" && $.game.players[o].resources["CORRU"] > $.game.actingPlayer.resources["CORRU"])
        });
        await GameCommands.UseActionSpace(space);
    }},

    {name: "Expose Corruption", description: ["Each opponent with more ", "CORRU", " than you gets ", "CORRU"], count: 2, isSkullport: true, action: async () => {
        await GameCommands.EachOpponentDoes(async pl => {
            if (pl.resources["CORRU"] > $.game.actingPlayer.resources["CORRU"])
                await GameCommands.GivePlayerBenefits(pl, {"CORRU": 1});
        });
    }},

    {name: "Corrupting Influence", description: ["Put ", "CORRU", " from track to 2 unoccupied action spaces"], count: 2, isSkullport: true, feasible: () => $.game.corruptionOnTrack >= 2 && $.game.buildings.flatMap(b => b.actionSpaces).filter(as => !as.occupants?.length).length >= 2, action: async () => {
        const space1 = await GameCommands.PlayerChoose({
            type: "GAME ACTION SPACE",
            prompt: [$.game.actingPlayer, " must choose an action space to put ", "CORRU", " on. (1/2)"],
            predicate: as => !as.occupants?.length
        });
        $.game.corruptionOnTrack--;
        GameCommands.GiveActionSpaceResources(space1, {"CORRU": 1});
        const space2 = await GameCommands.PlayerChoose({
            type: "GAME ACTION SPACE",
            prompt: [$.game.actingPlayer, " must choose an action space to put ", "CORRU", " on. (2/2)"],
            predicate: as => !as.occupants?.length && as !== space1
        });
        $.game.corruptionOnTrack--;
        GameCommands.GiveActionSpaceResources(space2, {"CORRU": 1});
    }},

    {name: "Foist Responsibility", description: ["Get ", "CORRU", "; give your ", "MANDATORY", " ", "MANDATORY_QUEST", " to an opponent with ≥", "CORRU"], count: 1, isSkullport: true, feasible: () => $.game.actingPlayer.activeQuests.some(q => q.isMandatoryQuest) && $.game.players.some(p => p !== $.game.actingPlayer && p.resources["CORRU"]), action: async () => {
        const quest = await GameCommands.PlayerChoose({
            type: "PLAYER QUEST",
            predicate: q => q.isMandatoryQuest && $.game.actingPlayer.activeQuests.includes(q),
            prompt: [$.game.actingPlayer, " must choose a ", "MANDATORY", " ", "MANDATORY_QUEST", " to give to an opponent with ≥", "CORRU", "."]
        });
        const opponent = await GameCommands.PlayerChoose({
            type: "PLAYER",
            prompt: [$.game.actingPlayer, " must choose an opponent ≥", "CORRU", " to give the ", "MANDATORY", "MANDATORY_QUEST", quest.cost, Icon('caret-right'), quest.benefit, " to."],
            predicate: p => p !== $.game.actingPlayer && p.resources["CORRU"]
        });
        $.game.actingPlayer.activeQuests = $.game.actingPlayer.activeQuests.filter(q => q !== quest);
        opponent.activeQuests.push(quest);
    }},

    {name: "Forge Deed", description: ["Get ", "CORRU", "CORRU", "; steal ", "BUILDING", " from an opponent"], count: 1, isSkullport: true, feasible: () => $.game.buildings.some(b => !b.default && b.owner !== $.game.actingPlayer), action: async () => {
        await GameCommands.GivePlayerBenefits($.game.actingPlayer, {"CORRU": 2});
        const building = await GameCommands.PlayerChoose({
            type: "GAME BUILDING",
            predicate: b => !b.default && b.owner !== $.game.actingPlayer,
            prompt: [$.game.actingPlayer, " must choose ", "BUILDING", " to steal from an opponent."]
        });
        building.owner = $.game.actingPlayer;
    }},

    {name: "Honorable Example", description: ["Get ", {"VP": 6}, " if you have the least ", "CORRU"], count: 1, isSkullport: true, action: async () => {
        if ($.game.players.every(p => p === $.game.actingPlayer || p.resources["CORRU"] > $.game.actingPlayer.resources["CORRU"]))
            await GameCommands.GivePlayerBenefits($.game.actingPlayer, {"VP": 6});
    }},

    {name: "Accelerated Plans", description: ["Return ", "AGENT", " from Waterdeep Harbor; assign ≤", "AGENT", "AGENT", "immediately, "], count: 1, feasible: () => $.misc.choosingBuildingForTurn || $.game.buildings.find(b => b.id === BuildingNameIdMap["Waterdeep Harbor"]).actionSpaces.some(as => as.occupants?.includes($.game.actingPlayer.id)), action: async () => {
        const feasibleSpaces = $.game.buildings.find(b => b.id === BuildingNameIdMap["Waterdeep Harbor"]).actionSpaces.filter(as => as.occupants?.includes($.game.actingPlayer.id));
        const actionSpace = (feasibleSpaces.length === 1) ? feasibleSpaces[0] : await GameCommands.PlayerChoose({
            type: "GAME ACTION SPACE",
            predicate: (as) => as.buildingId === BuildingNameIdMap["Waterdeep Harbor"] && as.occupants?.includes($.game.actingPlayer.id),
            prompt: [$.game.actingPlayer, " must choose an action space in ", "BUILDING", " ", {tag: 'b', children: "Waterdeep Harbor"}, " to return ", "AGENT", " from."]
        });
        const agentIndex = actionSpace.occupants.findIndex(o => o === $.game.actingPlayer.id);
        actionSpace.occupants.splice(agentIndex, 1);
        $.game.actingPlayer.agents.push($.game.actingPlayer.id);
        
        for (let i = 0; i < 2; i++) {
            if (!$.game.actingPlayer.agents.length || !$.game.buildings.some(b => b.actionSpaces.some(a => 
                GameCommands.IsActionSpaceFeasible(a, $.game.actingPlayer)
            ))) return;
            const actionSpace = await GameCommands.PlayerChoose({
                prompt: [$.game.actingPlayer, " must choose an action space to assign ", "AGENT", ` to. (${i+1} / 2)`],
                predicate: GameCommands.IsActionSpaceFeasible,
                type: "GAME ACTION SPACE",
                skippable: true
            });
            if (actionSpace) await GameCommands.AssignAgentToActionSpace(actionSpace);
        }
    }},

    {name: "Real Estate Deal", description: ["Discard an unoccupied ", "BUILDING", " you own; own ", "BUILDING", " in shop for free."], count: 1, feasible: () => $.game.buildings.some(b => b.owner === $.game.actingPlayer && !b.actionSpaces[0].occupants?.length), action: async () => {
        const b1 = await GameCommands.PlayerChoose({
            type: "GAME BUILDING",
            predicate: b => b.owner === $.game.actingPlayer && !b.actionSpaces[0].occupants?.length,
            prompt: [$.game.actingPlayer, " must choose a ", "BUILDING", " to discard."]
        });
        $.game.buildings.splice($.game.buildings.findIndex(b => b === b1));
        const b2 = await GameCommands.PlayerChoose({
            type: "SHOP BUILDING",
            prompt: [$.game.actingPlayer, " must choose a ", "BUILDING", " to own for free."]
        });
        await GameCommands.PutShopBuildingUnderPlayerControl(b2);
    }},

    {name: "Sample Wares", description: ["Assign ", "AGENT", " to a ", "BUILDING", " in shop"], count: 2, feasible: () => $.game.actingPlayer.agents?.length, action: async () => {
        const actionSpace = await GameCommands.PlayerChoose({
            prompt: [$.game.actingPlayer, " must choose an action space to assign ", "AGENT", " to."],
            predicate: GameCommands.IsActionSpaceFeasible,
            type: "SHOP ACTION SPACE"
        });
        await GameCommands.AssignAgentToActionSpace(actionSpace);
    }},

    {name: "Recall Agent", description: ["Return assigned ", "AGENT"], count: 2, feasible: () => $.misc.choosingBuildingForTurn || [...$.game.buildingShop, ...$.game.buildings].some(b => b.actionSpaces.some(as => as.occupants.includes($.game.actingPlayer.id))), action: async () => {
        const actionSpace = await GameCommands.PlayerChoose({
            type: ["GAME ACTION SPACE", "SHOP ACTION SPACE"],
            predicate: as => as.occupants.includes($.game.actingPlayer.id),
            prompt: [$.game.actingPlayer, " must choose an action space to return ", "AGENT", " from."]
        });
        const agentIndex = actionSpace.occupants.findIndex(o => o === $.game.actingPlayer.id);
        actionSpace.occupants.splice(agentIndex, 1);
        $.game.actingPlayer.agents.push($.game.actingPlayer.id);
    }}
].map((i, id) => ({...i, id}));

/** @type {Intrigue[]} */
const Intrigues = IntrigueTypes.flatMap(i => Array.from({length: i.count}, () => {
    const {count, ...int} = i; return int;
})).map((i, id) => ({...i, id}));
export default Intrigues;