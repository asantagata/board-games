import Icon, { ResourceIcon } from "./Icon.js";
import markdown from "@/utils/markdown.js";
import { handleClick } from "@/utils/handler.js";
import $ from "@/$.js";
/** @import { Building, ActionSpace, RequestType } from "@/types.js" */

/** 
 * @param { Building } building 
 * @param { RequestType | null } buildingRequestType
 * @param { RequestType | null } actionSpaceRequestType
 **/
export default function Building(building, buildingRequestType = null, actionSpaceRequestType = null) {
    let nonLastWordsOfName = building.name.substring(0, building.name.lastIndexOf(' '));
    if (nonLastWordsOfName) nonLastWordsOfName += ' ';
    return {
        class: `building rounded flex col overflow-hidden bg-text ${$.request?.types?.includes(buildingRequestType) && (!$.request.predicate || $.request.predicate(building)) ? 'feasible' : ''}`, key: `${building.id}`,
        on: {click() { handleClick(buildingRequestType, building); }},
        children: [
            {class: 'flex padded gap back align-center', children: [
                    ...((building.default || building.owner) ? [] : [{tag: 'span', children: markdown({"GOLD": building.goldCost})}]),
                    {tag: 'b', children: [nonLastWordsOfName, {tag: 'span', class: 'nowrap', children: [building.name.substring(building.name.lastIndexOf(' ') + 1) + ' ', ResourceIcon('BUILDING', {classes: `tx-PLAYER-${building.owner?.color}`})]}]},
                ]
            },
            ...building.actionSpaces.map(actionSpace => {
                return (
                    {class: `flex grow ${$.request?.types?.includes(actionSpaceRequestType) && (!$.request.predicate || $.request.predicate(actionSpace)) ? 'feasible' : ''}`, 
                        on: {click() { handleClick(actionSpaceRequestType, actionSpace); }}, 
                        children: [
                        {class: `flex col padded center space-evenly ${building.isSkullport ? 'sptb' : 'txbk'}`, children: [
                            ...(actionSpace?.occupants?.length ? actionSpace.occupants.map(agent => (ResourceIcon("AGENT", {classes: `font-large ${agent === "AMBASSADOR" ? 'tx-AMBASSADOR' : `tx-PLAYER-${$.game.players[agent].color}`}`}))) : [ResourceIcon("AGENT", {classes: 'font-large'})]),
                            ...((actionSpace.resources && Object.values(actionSpace.resources).some(r => r)) ? [{tag: 'span', children: markdown(actionSpace.resources)}] : [])
                        ]},
                        {
                            render: () => actionSpaceDesc(actionSpace, building),
                            memo: () => false
                        }
                    ]
                });
            })
        ]
    };
}

/** 
 * @param {ActionSpace} actionSpace
 * @param {Building} building
 */
function actionSpaceDesc(actionSpace, building) {
    const roundStartDesc = actionSpace.onPurchasedOrRoundStartDescription ? markdown(actionSpace.onPurchasedOrRoundStartDescription) : actionSpace.onPurchasedOrRoundStart ? markdown(actionSpace.onPurchasedOrRoundStart) : null;
    const ownerDesc = building.ownerBenefitsDescription ? markdown(building.ownerBenefitsDescription) : building.ownerBenefits ? markdown(building.ownerBenefits) : null;
    const mainDesc = actionSpace.description ? markdown(actionSpace.description) : actionSpace.cost ? [
        markdown(actionSpace.cost), Icon('caret-right'), markdown(actionSpace.benefit)
    ] : markdown(actionSpace.benefit);
    return {class: 'flex col grow padded gap space-between tx-dark bg-text minwidth0 center', children: [
        {class: 'flex col center text-center', children: [
            ...(roundStartDesc ? [{tag: 'i', children: [Icon('timer'), ': ', {tag: 'span', children: roundStartDesc}]}] : []),
            ...(mainDesc ? [{tag: 'i', children: [
                ...(roundStartDesc ? [ResourceIcon('AGENT'), ': '] : []), 
                {tag: 'span', children: mainDesc}]}] : []),  
        ]},
        ...(ownerDesc ? [{class: 'text-center', children: [{tag: 'i', children: 'Owner: '}, {tag: 'i', children: ownerDesc}]}] : [])
    ]};                        
}