import $ from "@/$.js";
/** @import { Lord, QuestType } from "@/types.js" */

let lordId = 0;

/**
 * @param {[QuestType, QuestType]} questTypes
 * @return {Partial<Lord>}
 */
function get4VPForQuestTypeLord(questTypes) {
    const questTypeObj = Object.fromEntries(questTypes.map(t => [t, true]));
    return {
        getBonusVP: (player) => player.completedQuests.filter(q => questTypeObj[q.questType]).length * 4,
        description: [{"VP": 4}, " per completed ", questTypes[0], " or ", questTypes[1], " ", "QUEST"]
    };
}

/** @type Lord[] */
export default [
    {id: lordId++, name: "Irusyl Eraneth", isSkullport: true, description: [{"VP": 6}, " for each ", "QUEST", " of your most-completed quest type"], getBonusVP: (player) => {
        const typeMap = {};
        for (let q of player.completedQuests) 
            if (q.questType) typeMap[q.questType] = typeMap[q.questType] ? (typeMap[q.questType] + 1) : 1;
        return Math.max(...Object.values(typeMap), 0) * 6;
    }},
    {id: lordId++, name: "The Xanathar", isSkullport: true, description: [{"VP": 4}, " for each ", "CORRU", " in your tavern"], getBonusVP: (player) => (player.resources?.CORRU ?? 0) * 4},
    {id: lordId++, name: "Sangalor", isSkullport: true, description: [{"VP": 4}, " for each owned ", {tag: 'b', class: 'tx-CORRU', children: "blue"}, ' ', "BUILDING", " and completed ", {tag: 'b', class: 'tx-CORRU', children: "blue"}, ' ', "QUEST"], getBonusVP: (player) => (player.completedQuests.filter(q => q.isSkullport).length + $.game.buildings.filter(b => b.owner === player && b.isSkullport).length) * 4},
    {...get4VPForQuestTypeLord(["ARCANA", "SKULLDUGGERY"]), id: lordId++, name: "Brianna Byndraeth"},
    {...get4VPForQuestTypeLord(["SKULLDUGGERY", "WARFARE"]), id: lordId++, name: "Caladorn Cassalanter"},
    {...get4VPForQuestTypeLord(["ARCANA", "PIETY"]), id: lordId++, name: "Kyriani Agrivar"},
    {...get4VPForQuestTypeLord(["ARCANA", "WARFARE"]), id: lordId++, name: "Khelben Arunsun, the Blackstaff"},
    {...get4VPForQuestTypeLord(["COMMERCE", "WARFARE"]), id: lordId++, name: "Durnan the Wanderer"},
    {id: lordId++, name: "Larissa Neathal", description: [{"VP": 6}, " per ", "BUILDING", " you own"], getBonusVP: (player) => $.game.buildings.filter(b => b.owner === player).length * 6},
    {...get4VPForQuestTypeLord(["ARCANA", "COMMERCE"]), id: lordId++, name: "Sammereza Sulphontis"},
    {...get4VPForQuestTypeLord(["PIETY", "WARFARE"]), id: lordId++, name: "Piergeiron the Paladinson"},
    {...get4VPForQuestTypeLord(["COMMERCE", "PIETY"]), id: lordId++, name: "Mirt the Moneylender"},
    {...get4VPForQuestTypeLord(["PIETY", "SKULLDUGGERY"]), id: lordId++, name: "Nindil Jalbuck"},
    {...get4VPForQuestTypeLord(["COMMERCE", "SKULLDUGGERY"]), id: lordId++, name: "Nymara Scheiron"},
];