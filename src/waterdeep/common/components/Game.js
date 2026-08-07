import { handleClick } from "@/utils/handler.js";
import Building from "./Building.js";
import Quest from "./Quest.js";
import Intrigue from "./Intrigue.js";
import Icon, { ResourceIcon } from "./Icon.js";
import markdown from "@/utils/markdown.js";
import { reinstateHistory } from "@/utils/history.js";
import $ from "@/$.js";
import { getIntrigueSuggestions } from "@/utils/intrigue.js";
/** @import { Player } from "@/types.js" */

function CorruTrack() {
    const trackSpace = $.game.corruptionOnTrack ? (9 - Math.floor(($.game.corruptionOnTrack + 2) / 3)) : 9;
    const corruOnSpace = $.game.corruptionOnTrack ? ((($.game.corruptionOnTrack) % 3) || 3) : 0;
    return {class: 'corru-track', children: [
        {class: 'line-after corru-pill-wrapper', children: {class: 'pill tbdb tx-dark', children: [
            `${-1 * trackSpace} `, ...Array.from({length: 3}, () => Icon('skull', 'tx-HFCORRU'))]}},
        {class: 'line-after corru-pill-wrapper', children: {class: 'pill tbdb tx-dark', children: 
            trackSpace !== 9 ? [`${-1 * (trackSpace + 1)} `, ...Array.from({length: 3}, (_,i) => Icon('skull', corruOnSpace >= (3 - i) ? 'tx-CORRU' : 'tx-HFCORRU'))] : [`-10×`, ResourceIcon("VP")]}}
    ]};
}

function FaceUpQuests() {
    return {
        class: 'flex col gap', children: [
            {tag: 'b', class: 'line-after', children: "Quests"},
            {class: 'flex col gap', children: $.game.faceUpQuests.map(q => Quest(q, "SHOP QUEST"))}
        ]
    }
}

function BuildingShop() {
    return {
        class: 'flex col gap', children: [
            {tag: 'b', class: 'line-after', children: "Shop"},
            {class: 'flex col gap', children: $.game.buildingShop.map(b => Building(b, "SHOP BUILDING", "SHOP ACTION SPACE"))}
        ]
    }
}

/** @param {Player} player  */
function Player(player) {
    const completedQuestMap = {};
    for (const quest of player.completedQuests ?? []) {
        completedQuestMap[quest.questType] = !completedQuestMap[quest.questType] ? 1 : completedQuestMap[quest.questType] + 1;
        if (quest.isSkullport) completedQuestMap["CORRU"] = !completedQuestMap["CORRU"] ? 1 : completedQuestMap["CORRU"] + 1;
    }
    const bonuses = Object.values($.game.bonuses)?.flat().filter(b => b.owner === player) ?? [];
    return {
        class: `player padded rounded flex gap ${$.request?.types?.includes("PLAYER") && (!$.request.predicate || $.request.predicate(player)) ? 'feasible' : ''}`, style: {'--tx-PLAYER': `var(--tx-PLAYER-${player.color})`}, 
        on: {click() { handleClick("PLAYER", player); }},
        children: [
            {class: 'flex col gap', children: [
                {class: `tx-PLAYER flex align-center gap ${player === $.game.actingPlayer ? 'acting-player-name' : ''}`, children: [
                    ...($.game.nextRoundFirstPlayer === player ? [{...ResourceIcon("FIRST"), key: '1'}] : []),
                    player.name,
                    {tag: 'span', key: 'agents', children: player.agents.map(agent => ResourceIcon("AGENT", {classes: `font-large ${agent === "AMBASSADOR" ? 'tx-AMBASSADOR' : `tx-PLAYER-${player.color}`}`}))}
                ]},
                {class: 'player-resource-grid gap text-center tx-dark bg-text padded rounded', children: ["P", "W", "O", "B", "CORRU", "GOLD", "INTRIGUE", "VP"].map(res => res === "INTRIGUE" ? (player.intrigues.length ? markdown({"INTRIGUE": player.intrigues.length}) : {tag: 'span'}) : (player.resources[res] ? markdown({[res]: player.resources[res]}) : {tag: 'span'}))}
            ]},
            {tag: 'hr'},
            ...(player.activeQuests.length || player.completedQuests.length ? [{
                class: 'flex col gap grow', children: [
                    ...(player.activeQuests.length ? [{key: 'active', class: 'flex col gap', children: [
                        {tag: 'b', class: 'line-after tx-PLAYER', children: 'Active quests'},
                        {class: 'flex flex-wrap gap', children: player.activeQuests.map(q => Quest(q, "PLAYER QUEST"))}
                    ]}] : []),
                    ...(player.completedQuests.length || $.ui.showLords ? [
                        {tag: 'b', class: 'line-after tx-PLAYER', children: 'Completed quests', key: 'bonusheader'}, {key: 'bonus', class: 'flex col gap padded rounded tx-dark bg-text',
                        children: [
                        ...(player.completedQuests.length ? [{class: 'flex flex-wrap gap', children:
                            Object.keys(completedQuestMap).map(type => ({
                                class: 'pill tx-dark tbdb', 
                                style: {'background': type === 'CORRU' ? '' 
                                    : `color-mix(in oklab, var(--text) 100%, var(--tx-${type}) 50%)`},
                                children: [`${completedQuestMap[type]}×`, {tag: 'b', class: `tx-${type}`, children: type === 'CORRU' ? 'BLUE' : type}]
                            }))
                        }] : []),
                        ...(bonuses.length || $.ui.showLords ? [{tag: 'ul', children: [
                            ...bonuses.map(b => ({tag: 'li', children: [
                                {tag: 'b', children: b.quest.name}, ': ',
                                {tag: 'i', children: markdown(b.description)},
                                `${(b.interval && b.hasBeenUsedThisInterval) ? ' (used)' : ''}`
                            ]})),
                            ...($.ui.showLords ? [{tag: 'li', children: [
                                Icon('crown', 'tx-GOLD'), ' ',
                                {tag: 'b', children: player.lord.name}, ': ',
                                {tag: 'i', children: markdown(player.lord.description)},
                                ...(player.lord.getBonusVP(player) ? [{tag: 'i', children: [' (+', {tag: 'span', children: markdown({"VP": player.lord.getBonusVP(player)})}, ')']}] : [])
                            ]}] : [])
                        ]}] : [])
                    ]}] : []),
                ]
            }] : [])
        ]
    };
}

function Terminal() {
    return {
        class: 'flex gap align-center', children: [
            {
                class: 'grow dark padded rounded terminal overflow-auto', id: 'terminal',
                children: [
                    {
                        render() {
                            return {children: $.history.slice(0,-1).map((hist, ix) => ({ key: `${ix}`, class: 'border-bottom flex flex-between gap', children: [
                                {class: 'hftx', children: markdown(hist.description)},
                                ...(hist.historicGame ? [
                                    {tag: 'button', children: Icon('clock-clockwise'), on: {click() {
                                        reinstateHistory(hist, ix);
                                    }}}
                                ] : [
                                    {tag: 'button', style: {visibility: 'hidden'}, children: Icon('clock-clockwise')}
                                ])
                            ]}))};
                        },
                        memo: () => $.history.length
                    },
                    {key: 'question', children: [
                        {class: 'flex col', children: [
                            {key: 'hist', class: 'flex flex-between', children: [
                                {tag: 'b', class: 'hftx', children: $.ui.callStack.flatMap((cs, i, arr) => [
                                    {tag: 'span', children: markdown(cs)}, ' / '
                                ])},
                                {tag: 'button', children: Icon('clock-clockwise'), on: {click() {
                                    reinstateHistory($.history.at(-1));
                                }}}
                            ]},              
                            {key: 'q', children: markdown($.ui.question)},
                            ...($.ui.showIntrigueSearch ? [IntrigueSearch()] : []),
                            ...($.ui.options?.length ? [{class: 'flex gap flex-wrap center', key: 'opts', children: $.ui.options.map(opt => ({
                                tag: 'button', class: 'option pointer', key: `${opt.id}`, on: {click(e) {
                                    if (handleClick("OPTION", opt.label ? opt.id : opt))
                                        e.stopPropagation();
                                }},
                                children: BuildingOrQuestOrIntrigue(opt) ?? markdown(opt.label)
                            })) ?? []}] : [])
                        ]},
                    ]},
                ]
            },
            ...($.ui.example ? [BuildingOrQuestOrIntrigue($.ui.example)] : [])
        ]
    };
}

function IntrigueSearch() {
    return {
        key: 'is', style: {'padding-top': 'var(--md)'},
        children: [
            {tag: 'input', class: 'padded rounded dkbk', value: '', on: {mount() { this.target.focus() }, input() {
                $.ui.intrigueQuery = this.target.value;
                let now = Date.now();
                $.ui.lastIntrigueInput = now;
                window.setTimeout(() => {
                    if ($.ui.lastIntrigueInput !== now) return;
                    $.ui.lastIntrigueInput = false;
                    $.ui.options = getIntrigueSuggestions();
                    $.rerender();
                }, 100);
            }}, placeholder: 'Intrigue'}
        ]
    }
}

function BuildingOrQuestOrIntrigue(thing) {
    return thing.actionSpaces ? Building(thing, null, null)
    : thing.action ? Intrigue(thing)
    : thing.name ? Quest(thing, null)
    : null;
}

export default function Game() {
    return {
        class: 'flex', tabindex: 0, on: {
            keydown(e) { 
                if (e.key === "Enter") document.querySelector('.option[data-key=null]')?.click();
             }
        }, key: `${$.ui.restoreParity}`, children: [
            {
                class: 'flex col gap dkbk padded left-sidebar overflow-auto minheight0 height-100dvh shrink-0', children: [
                    CorruTrack(),
                    FaceUpQuests(),
                    BuildingShop()
                ]
            },
            {
                class: 'padded gap dark flex flex-wrap wrap-list', children: $.game.buildings.map(b => Building(b, "GAME BUILDING", "GAME ACTION SPACE"))
            },
            {
                class: 'flex col gap back padded grow height-100dvh overflow-auto', children: [
                    Terminal(),
                    {
                        class: 'flex gap flex-wrap', children: $.game.players.map(Player)
                    }
                ]
            },
        ]
    };
}