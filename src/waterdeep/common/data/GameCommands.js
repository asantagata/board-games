import $ from "@/$.js";
import Buildings, { BuildingNameIdMap } from "@/data/Buildings.js";
import Lords from "@/data/Lords.js";
import Quests from "@/data/Quests.js";
import Icon, { ResourceIcon } from "@/components/Icon.js";
import markdown from "@/utils/markdown.js";
import { getIntrigueSuggestions } from "@/utils/intrigue.js";
/** @import { Game, Player, Resources, Costs, Benefits, Building, Quest, Intrigue, ActionSpace, BonusTrigger, RequestType, Markdown } from "@/types.js" */

// game commands do not invoke a final $.rerender().

const GameCommands = {
    /**
     * @param {Markdown} message
     */
    async AwaitOK(message) {
        return GameCommands.PlayerChoose({prompt: message, options: [{id: null, label: [Icon('check-circle', 'font-md'), ' OK']}]});
    },

    /**
     * @param {Markdown} message
     */
    async AwaitYesNo(message) {
        return GameCommands.PlayerChoose({prompt: message, options: [
            {id: false, label: [Icon('x-circle', 'font-md'), ' No']},
            {id: true, label: [Icon('check-circle', 'font-md'), ' Yes']}
        ]});
    },

    /**
     * Assumes feasibility.
     * @param {ActionSpace} actionSpace
     * @param {Player} player
     */
    async AssignAgentToActionSpace(actionSpace, player = $.game.actingPlayer) {
        const building = $.game.buildings.find(b => b.id === actionSpace.buildingId);
        if (!actionSpace.occupants) actionSpace.occupants = [];
        actionSpace.occupants.push(player.agents.shift());

        if (Object.keys(actionSpace.resources ?? {}).length) {
            $.misc.lastSpaceResources = {...actionSpace.resources};
            await GameCommands.GivePlayerBenefits($.game.actingPlayer, actionSpace.resources, true);
            actionSpace.resources = {};
        }
        await GameCommands.UseActionSpace(actionSpace);
        if (building?.owner && building?.ownerBenefits && building.owner !== player) {
            if (typeof building?.ownerBenefits === "function")
                return await GameCommands.GivePlayerBenefits(building.owner, building?.ownerBenefits());
            else await GameCommands.GivePlayerBenefits(building.owner, building?.ownerBenefits);
        }
        await GameCommands.HandleBonuses(`${player.id}_ASSIGNS_AGENT_TO_BUILDING_${actionSpace.buildingId}`);
    },

    /**
     * @param {Player} player
     */
    async ChooseAndPlayIntrigue(player = $.game.actingPlayer) {
        $.ui.intrigueQuery = '';
        $.ui.showIntrigueSearch = true;
        let intrigue, preamble = [];
        while (true) {
            intrigue = await GameCommands.PlayerChoose({
               prompt: [...preamble, player, " must choose ", "INTRIGUE", " to play."],
               options: getIntrigueSuggestions()
           });
           if (player.intrigues.some(i => i.name === intrigue.name)) break;
           else preamble = [player, " does not have ", "INTRIGUE", " ", {tag: 'b', children: intrigue.name}, ". "];
        }
        $.ui.showIntrigueSearch = false;
        $.ui.example = intrigue;
        $.ui.callStack.push([`Playing ${intrigue.name}`]);
        const index = player.intrigues.findIndex(i => i.name === intrigue.name);
        player.intrigues.splice(index, 1);
        await GameCommands.AwaitOK([player, " plays ", "INTRIGUE", " ", {tag: 'b', children: intrigue.name}, "!"]);
        await intrigue.action();
        await GameCommands.HandleBonuses(`${player.id}_PLAYS_INTRIGUE`);
        $.ui.callStack.pop();
        $.ui.example = null;
    },

    /**
     * Assumes feasibility. "removeFromActive" = this quest should be removed from the player's activeQuests.
     * @param {Quest} quest 
     * @param {Player} player 
     * @param {boolean} removeFromActive
     */
    async CompletePlayerQuest(quest, player = $.game.actingPlayer, removeFromActive = true) {
        $.ui.callStack.push(["Completing quest ", quest.name]);
        $.ui.example = quest;
        if (removeFromActive) player.activeQuests = player.activeQuests.filter(q => q !== quest);
        player.completedQuests.push(quest);
        if (quest.plotQuestBonus) {
            const trigger = typeof quest.plotQuestBonus.trigger === "function" ? quest.plotQuestBonus.trigger(player) : quest.plotQuestBonus.trigger;
            if (!$.game.bonuses[trigger]) $.game.bonuses[trigger] = [];
            $.game.bonuses[trigger].push({...quest.plotQuestBonus, owner: player});
            if (trigger === "IMMEDIATELY")
                await $.game.bonuses[trigger].at(-1).action($.game.bonuses[trigger].at(-1));
        }
        await GameCommands.AwaitOK([player, " completes ", "QUEST", " ", {tag: 'b', children: quest.name}, "!"]);

        await GameCommands.CostPlayerCost(player, quest.cost);
        if (quest.benefit) await GameCommands.GivePlayerBenefits(player, quest.benefit);
        if (quest.otherBenefit) await quest.otherBenefit();
        await GameCommands.HandleBonuses(`${player.id}_COMPLETE_QUEST_${quest.questType}`);
        $.ui.callStack.pop();
        $.ui.example = null;
    },
    
    /**
     * @param {Player} player 
     * @param {Costs} cost 
     */
    async CostPlayerCost(player, cost) {
        $.ui.callStack.push(["Costing ", player, " ", cost]);
        let originalRes = {...player.resources};
        let changes = {"P": 0, "W": 0, "O": 0, "B": 0}; // positive
        if (cost["GOLD"]) {
            player.resources["GOLD"] -= cost["GOLD"];
            changes["GOLD"] = cost["GOLD"];
        }
        let corruReturned = false;
        if (cost["CORRU"]) {
            if (cost["CORRU"].upTo && player.resources["CORRU"]) {
                const max = Math.min(cost["CORRU"].upTo, player.resources["CORRU"]);
                const n = await GameCommands.PlayerChoose({
                    prompt: ["How many ", "CORRU", " will ", player, " return?"],
                    options: Array.from({length: max + 1}, (_, i) => ({ id: i, label: i ? Array.from({length: i}, () => "CORRU") : "None" }))
                });
                player.resources["CORRU"] -= n;
                changes["CORRU"] = n;
                corruReturned = true;
            } else {
                player.resources["CORRU"] -= cost["CORRU"];
                changes["CORRU"] = cost["CORRU"];
                corruReturned = true;
            }
        }
        for (const r of ["P", "W", "O", "B"]) {
            if (!cost[r]) continue;
            player.resources[r] -= cost[r];
            changes[r] = cost[r];
        }
        const DETERMINISTIC = {"P": 1, "W": 1, "O": 1, "B": 1, "VP": 1, "GOLD": 1};
        for (const r in cost) {
            if (DETERMINISTIC[r]) continue;
            for (let i = 0; i < cost[r]; i++) {
                let possibilities = r.split('').filter(sr => player.resources[sr]);
                if (!possibilities.length) {
                    await GameCommands.AwaitOK("We've reached an impasse. Let's try again.");
                    player.resources = originalRes;
                    $.ui.callStack.pop();
                    return await GameCommands.CostPlayerCost(player, cost);
                } else if (possibilities.length === 1) {
                    player.resources[possibilities[0]]--;
                    changes[possibilities[0]]++;
                } else {
                    const sr = await GameCommands.PlayerChoose({
                        prompt: ["What will ", player, ` spend? (${i + 1} / ${cost[r]}×`, r, ')'],
                        options: possibilities.map(pr => ({id: pr, label: pr}))
                    });
                    player.resources[sr]--;
                    changes[sr]++;
                }
            }
        }
        if (corruReturned) await GameCommands.HandleBonuses(`${player.id}_RETURNS_CORRU`);
        $.misc.lastCostChanges = changes;
        $.ui.callStack.pop();
    },

    /**
     * @param {(player: Player) => void | (player: Player) => Promise<void>} action 
     * @param {Player} of 
     */
    async EachOpponentDoes(action, of = $.game.actingPlayer) {
        for (let i = (of.id + 1) % $.game.players.length; i !== of.id; i = (i + 1) % $.game.players.length) {
            await action($.game.players[i]);
        }
    },

    /**
     * @param {Resources?} res1 
     * @param {Resources?} res2 
     */
    GetMergedResources(res1, res2) {
        const merge = {...(res1 ?? {})};
        for (const key in (res2 ?? {})) {
            if (merge[key]) merge[key] += res2[key];
            else merge[key] = res2[key];
        }
        return merge;
    },

    /**
     * @param {Player} player
     * @param {Benefits} benefits
     * @param {boolean?} isBuildingOrIntrigue
     */
    async GivePlayerBenefits(player, benefits, isBuildingOrIntrigue) {
        $.ui.callStack.push(["Giving ", player, " ", benefits]);
        const DETERMINISTIC = {"P": 1, "W": 1, "O": 1, "B": 1, "VP": 1, "GOLD": 1};
        const WORKFUL = {"CORRU": 1, "FACE-UP QUEST": 1, "FACE-DOWN QUEST": 1, "INTRIGUE": 1};
        const workfulBenefits = {};
        const nondeterministicBenefits = {};
        const changes = {};

        // deterministic pass
        for (const b in benefits) {
            if (DETERMINISTIC[b]) {
                if (player.resources[b]) player.resources[b] += benefits[b];
                else player.resources[b] = benefits[b];
                changes[b] = benefits[b];
            } else if (WORKFUL[b]) {
                workfulBenefits[b] = benefits[b];
            } else nondeterministicBenefits[b] = benefits[b];
        }

        // deterministic-but-workful pass
        if (workfulBenefits["CORRU"]) {
            let ungivableCorru = 0;
            for (let c = 0; c < workfulBenefits["CORRU"]; c++) {
                if ($.game.corruptionOnTrack) {
                    changes["CORRU"] = changes["CORRU"] ? changes["CORRU"] : 1;
                    player.resources["CORRU"] = player.resources["CORRU"] ? player.resources["CORRU"] + 1 : 1;
                    $.game.corruptionOnTrack--;
                } else ungivableCorru++;
            }
            if (ungivableCorru) {
                let vpToRemove = Math.min(ungivableCorru * 10, (player.resources["VP"] || 0));
                player.resources["VP"] = (player.resources["VP"] || 0) - vpToRemove;
                await GameCommands.AwaitOK(["The ", "CORRU", " track is emptied, so ", player, " loses ", {"VP": vpToRemove}, "."]);
            }
        }

        if (workfulBenefits["FACE-UP QUEST"]) {
            for (let i = 0; i < workfulBenefits["FACE-UP QUEST"]; i++) {
                const quest = await GameCommands.PlayerChoose({
                    type: "SHOP QUEST",
                    prompt: [player, " must choose a face-up ", "QUEST", ` to take. (${i+1} / ${workfulBenefits["FACE-UP QUEST"]})`]
                });
                player.activeQuests.push(quest);
                $.game.faceUpQuests = $.game.faceUpQuests.filter(q => q.id !== quest.id);
                $.game.faceUpQuests.push($.game.questDeck.shift());
            }
        }

        if (workfulBenefits["FACE-DOWN QUEST"]) {
            for (let i = 0; i < workfulBenefits["FACE-DOWN QUEST"]; i++)
                player.activeQuests.push($.game.questDeck.pop());
            await GameCommands.AwaitOK([player, " draws ", {"FACE-DOWN QUEST": workfulBenefits["FACE-DOWN QUEST"]}, "."]);
        }

        if (workfulBenefits["INTRIGUE"]) {
            for (let i = 0; i < workfulBenefits["INTRIGUE"]; i++) {
                player.intrigues.push($.game.staticIntrigueDeck[player.intrigueDeckIndex]);
                player.intrigueDeckIndex = (player.intrigueDeckIndex + 1) % $.game.staticIntrigueDeck.length;
            }
            await GameCommands.AwaitOK([player, " draws ", {"INTRIGUE": workfulBenefits["INTRIGUE"]}, ". (Do this on your room view!)"]);
        }

        // nondeterministic pass
        for (const b in nondeterministicBenefits) {
            if (!nondeterministicBenefits[b]) continue;
            for (let i = 0; i < nondeterministicBenefits[b]; i++) {
                const resource = await GameCommands.PlayerChoose({
                    prompt: [player, " must choose ", {[b]: 1}, `. (${i+1} / ${nondeterministicBenefits[b]})`],
                    options: b.split('').map(r => ({label: r, id: r}))
                });
                player.resources[resource] = player.resources[resource] ? player.resources[resource] + 1 : 1;
                changes[resource] = changes[resource] ? changes[resource] + 1 : 1;
            }
        }

        // bonuses
        if (isBuildingOrIntrigue) {
            for (let r in changes) {
                if (!changes[r]) continue;
                await GameCommands.HandleBonuses(`${player.id}_DOES_ACTION_GIVING_${r}`);
            }
        }
        if (changes["CORRU"]) await GameCommands.HandleBonuses(`${player.id}_GETS_CORRU`);
        $.ui.callStack.pop();
    },

    /**
     * @param {ActionSpace} actionSpace
     * @param {Resources?} res
     */
    GiveActionSpaceResources(actionSpace, res) {
        actionSpace.resources = GameCommands.GetMergedResources(actionSpace.resources, res);
    },

    /**
     * @param {BonusTrigger} trigger
     */
    async HandleBonuses(trigger) {
        for (const bonus of $.game.bonuses[trigger] ?? []) {
            if (bonus && (!bonus.interval || !bonus.hasBeenUsedThisInterval)) {
                if (bonus.feasible && !bonus.feasible(bonus)) return;
                $.ui.callStack.push(`Handling bonus (${bonus.quest.name})`);
                await GameCommands.AwaitOK([bonus.owner, " activates their bonus ", {tag: 'b', children: bonus.quest.name}, ": ", {tag: 'i', children: markdown(bonus.description)}, {tag: 'i', children: "!"}]);
                await bonus.action(bonus);
                if (bonus.interval) bonus.hasBeenUsedThisInterval = true;
                $.ui.callStack.pop();
            }
        }
    },

    /**
     * Accounts for all elements EXCEPT the building being in play instead of shop.
     * @param {ActionSpace} actionSpace
     * @param {Player} player Defaults to actingPlayer
     * @param {boolean} canAssignToOccupied
     * @param {boolean} mustAssignToOccupied
     * @returns {boolean}
     */
    IsActionSpaceFeasible(actionSpace, player = $.game.actingPlayer, canAssignToOccupied = false, mustAssignToOccupied = false) {
        if (actionSpace.buildingId === BuildingNameIdMap["Waterdeep Harbor"] && $.game.harboriteToReassign !== null) 
            return false;
        if (mustAssignToOccupied && !actionSpace.occupants?.length) return false;
        if (actionSpace.occupants?.length && !canAssignToOccupied && ($.game.bonuses["SPECIAL_CAN_ASSIGN_AGENT_TO_OCCUPIED"]?.[0]?.owner !== player || $.game.bonuses["SPECIAL_CAN_ASSIGN_AGENT_TO_OCCUPIED"]?.[0]?.hasBeenUsedThisInterval))
            return false;
        if (actionSpace.feasible) return actionSpace.feasible(player, actionSpace);
        if (actionSpace.cost) return GameCommands.ResourcesSatisfiesCost(player.resources, actionSpace.cost);
        return true;
    },

    /**
     * @param {Intrigue} intrigue
     * @param {Player} player
     * @returns {boolean}
     */
    IsIntrigueFeasible(intrigue, player = $.game.actingPlayer) {
        if (intrigue.feasible) return intrigue.feasible();
        return true;
    },

    /**
     * @param {Quest} quest
     * @param {Player} player Defaults to actingPlayer
     * @returns {boolean}
     */
    IsQuestFeasible(quest, player = $.game.actingPlayer) {
        const playerHasMandatories = player.activeQuests.some(q => q.isMandatoryQuest);
        return GameCommands.ResourcesSatisfiesCost(player.resources, quest.cost) 
            && (!playerHasMandatories || quest.isMandatoryQuest);
    },

    /**
     * All game choices.
     * @param {{
     *  type?: RequestType | RequestType[] | null,
     *  skippable?: boolean,
     *  prompt: Markdown,
     *  options: (Building | Quest | Intrigue | {id: string | number | boolean | null, label: Markdown})[] | null,
     *  predicate: (a: any) => boolean
     * }} options
     */
    async PlayerChoose({type, skippable = false, prompt = "Choose.", options = [], predicate = () => true}) {
        const typeArr = (typeof type === "object" ? type : type ? [type] : null);
        return await new Promise((resolve) => {
            $.request = {resolve: (res) => {
                $.request = null;
                resolve(res);
            }, types: typeArr, predicate};
            $.ui.lastIntrigueInput = null;
            $.ui.question = prompt;
            $.ui.options = [...options, ...(skippable ? [{id: null, label: [Icon('x-circle', 'font-md'), ' Skip']}] : [])];
            $.rerender();
            document.getElementById('terminal').scrollTo({top: 999999, behavior: "smooth"});
        })
    },

    /**
     * @param {Building} building 
     * @param {Player} player
     */
    async PurchaseBuilding(building, player = $.game.actingPlayer) {
        player.resources["GOLD"] -= building.goldCost;
        await GameCommands.PutShopBuildingUnderPlayerControl(building, player);
        await GameCommands.HandleBonuses(`${player.id}_PURCHASES_BUILDING`);
    },

    /**
     * @param {Building} building 
     * @param {Player} player
     */
    async PutShopBuildingUnderPlayerControl(building, player = $.game.actingPlayer) {
        if (building.actionSpaces[0].resources?.["VP"]) {
            await GameCommands.GivePlayerBenefits(player, {"VP": building.actionSpaces[0].resources["VP"]});
            building.actionSpaces[0].resources["VP"] = 0;
        }
        $.game.buildingShop = $.game.buildingShop.filter(b => b !== building);
        $.game.buildingShop.push($.game.buildingDeck.shift());
        let resources = building.actionSpaces[0].resources ?? {};
        if (building.actionSpaces[0].onPurchasedOrRoundStart)
            resources = GameCommands.GetMergedResources(resources, building.actionSpaces[0].onPurchasedOrRoundStart);
        const occupants = building.actionSpaces[0].occupants ?? [];
        $.game.buildings.push({...building, owner: player, actionSpaces: [{...building.actionSpaces[0], resources, occupants}]});
    },

    /**
     * @param {Resources} resources 
     * @param {Costs} cost 
     * @returns {boolean}
     */
    ResourcesSatisfiesCost(resources, cost) {
        if ((resources["GOLD"] ?? 0) < (cost["GOLD"] ?? 0)) return false;
        if (!cost["CORRU"]?.upTo && ((resources["CORRU"] ?? 0) < (cost["CORRU"] ?? 0))) return false;
        resources = {...resources};
        for (const r of ["P", "W", "O", "B"]) {
            if (!cost[r]) continue;
            if ((resources[r] ?? 0) < (cost[r] ?? 0)) return false;
            resources[r] -= cost[r];
        }
        const DETERMINISTIC = {"P": 1, "W": 1, "O": 1, "B": 1, "VP": 1, "GOLD": 1};
        for (const r in cost) {
            if (DETERMINISTIC[r]) continue;
            let count = 0;
            for (const sr of r) count += (resources[sr] ?? 0);
            if (count < cost[r]) return false;
        }
        return true;
    },

    /**
     * Assumes feasibility.
     * @param {ActionSpace} actionSpace
     * @param {Player} player
     */
    async UseActionSpace(actionSpace, player = $.game.actingPlayer) {
        $.ui.callStack.push(`Using ${Buildings[actionSpace.buildingId].name}`);
        $.ui.example = Buildings[actionSpace.buildingId];
        await GameCommands.AwaitOK([player, " uses ", "BUILDING", " ", {tag: 'b', children: Buildings[actionSpace.buildingId].name}, "!"]);
        if (actionSpace.cost) await GameCommands.CostPlayerCost(player, actionSpace.cost);
        if (actionSpace.benefit) {
            if (typeof actionSpace.benefit === "function")
                await GameCommands.GivePlayerBenefits(player, actionSpace.benefit(), true);
            else await GameCommands.GivePlayerBenefits(player, actionSpace.benefit, true);
        }
        if (actionSpace.action) await actionSpace.action();
        $.misc.lastSpaceResources = null;
        $.ui.callStack.pop();
        $.ui.example = null;
    },
};

window.GameCommands = GameCommands;
window.$ = $;

export default GameCommands;