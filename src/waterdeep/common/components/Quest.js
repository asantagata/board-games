import Icon, { ResourceIcon } from "./Icon.js";
import { handleClick } from "@/utils/handler.js";
import markdown from "@/utils/markdown.js";
/** @import {Quest, RequestType} from "@/types.js" */

/** 
 * @param {Quest} quest
 * @param { RequestType | null } requestType
 * */
export default function Quest(quest, requestType = null) {
    return {
        key: `${quest.id}`,
        class: `quest rounded flex col overflow-hidden bg-text ${$.request?.types?.includes(requestType) && (!$.request.predicate || $.request.predicate(quest)) ? 'feasible' : ''}`, title: quest.name, key: `${quest.id}`,
        on: {click() { handleClick(requestType, quest); }},
        children: [
            {
                render: () => ({class: `${quest.isSkullport ? 'tbdb' : 'tbdk'} padded-x tx-QUEST`, children: quest.isMandatoryQuest ? [{tag: 'b', children: "MANDATORY "}, ResourceIcon("MANDATORY_QUEST")] : [markdown(quest.questType), ' ', ResourceIcon("QUEST")]}),
                memo: () => false
            },
            {
                render: () => ({class: 'bg-text padded tx-dark flex col grow center', children: [
                    {tag: 'i', class: 'text-center', children: markdown(quest.cost)},
                    {tag: 'hr'},
                    {tag: 'i', class: 'text-center', children: 
                        [quest.benefit, quest.plotQuestBonus?.description, quest.benefitDescription]
                        .filter(b => b).flatMap((b, i, arr) => [
                            {tag: 'i', children: markdown(b)}, ...(i === arr.length - 1 ? [] : ['; '])
                        ])},
                ]}),
                memo: () => false
            },
        ]
    };
}