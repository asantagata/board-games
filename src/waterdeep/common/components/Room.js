import $ from "@/$.js";
import Icon, { ResourceIcon } from "./Icon.js";
import { getRandomConfirmationString } from "@/utils/random.js";
import { startRoom } from "@/utils/intrigue.js";
import Building from "@/components/Building.js";
import Buildings from "@/data/Buildings.js";
import Lord from "@/components/Lord.js";
import Lords from "@/data/Lords.js";
import Quest from "@/components/Quest.js";
import Quests from "@/data/Quests.js";
import Intrigue from "@/components/Intrigue.js";
import Intrigues from "@/data/Intrigues.js";
import markdown from "@/utils/markdown.js";

function Radio(getVal, min, max, onChange) {
    return {
        class: 'flex gap',
        children: Array.from({length: max + 1 - min}, (_,i) => min + i).map(i => ({
            class: `${i === getVal() ? 'bg-VP' : 'pointer'} center radio-option`, 
            children: i,
            on: {click() {
                if (i === getVal()) return;
                onChange(i);
                $.rerender();
            }}
        }))
    };
}

function Config() {
    return {class: 'back center fullwidth fullheight', key: 'config', children: [
        {class: 'col gap', children: [
            {class: 'flex flex-between gap', key: 'heading', children: [
                {tag: 'b', class: 'hftx', children: "SETUP"},
                {tag: 'b', class: 'hftx', children: [
                    {tag: 'a', class: 'hftx', target: '_blank', children: "BASE", href: "https://media.wizards.com/downloads/dnd/DnD_LOW_Rulebook_EN.pdf"},
                    ' / ',
                    {tag: 'a', class: 'hftx', target: '_blank', children: "SKULLPORT", href: "https://media.wizards.com/downloads/dnd/SOS_Rulebook.pdf"}
                ]}
            ]},

            {class: 'flex flex-between gap', key: 'sd', children: [
                {tag: 'b', class: 'line-after grow', children: {tag: 'span', children: ['SEED']}},
                {tag: 'input', class: 'padded rounded dkbk', placeholder: 'R374W', value: '', on: {mount() { 
                    this.target.focus();
                    $.config.seed = '';
                    $.rerender();
                 }, input() {
                    this.target.value = this.target.value.toUpperCase();
                    $.config.seed = this.target.value.toUpperCase();
                    $.rerender();
                }}}
            ]},
                
            {class: 'flex flex-between gap', key: 'p#', children: [
                {tag: 'b', class: 'line-after grow', children: {tag: 'span', children: ['# PLAYERS?']}},
                Radio(() => $.config.players.length, 2, $.config.skullport ? 6 : 5, (i) => {
                    $.config.players = Array.from({length: i}, () => null);
                    $.client.myId = Math.min(i, $.client.myId);
                })
            ]},
            {class: 'flex flex-between gap', key: 'i#', children: [
                {tag: 'b', class: 'line-after grow', children: {tag: 'span', children: 'YOU ARE PLAYER #'}},
                Radio(() => $.client.myId, 1, $.config.players.length, i => $.client.myId = i)
            ]},
            {class: 'flex flex-between gap', key: 'sp', children: [
                {tag: 'b', class: 'line-after grow', children: {tag: 'span', children: ['USE ', {tag: 'span', class: 'tx-LIGHT-CORRU', children: 'SKULLPORT'}, '?']}},
                {tag: 'input', type: 'checkbox', checked: $.config.skullport || undefined, on: {change() {
                    $.config.skullport = this.target.checked;
                    if (!$.config.skullport) {
                        $.config.players = $.config.players.filter((_,i) => i < 5);
                        if ($.client.myId === 6) $.client.myId = 5;
                    }
                    $.rerender();
                }}}
            ]},

            {class: 'flex flex-between gap', key: 'conf', children: [
                {tag: 'b', class: 'line-after grow', children: {tag: 'span', children: 'CONFIRMATION'}},
                {class: 'padded rounded dkbk', style: {'white-space': 'nowrap'}, children: getRandomConfirmationString($.client.myId - 1)}
            ]},

            {key: 'play', tag: 'button', class: 'subtle font-md grow', children: Icon('play'), on: {click() {
                $.client.myId--;
                startRoom();
                $.game = true;
                $.rerender();
            }}}
        ]},
    ]};
}

function IntrigueRoom() {
    return {
        class: 'dkbk padded overflow-auto shrink-0', children: [
            {class: 'col gap', children: [
                {tag: 'b', class: 'line-after grow', children: {tag: 'span', children: ["LORD (", Icon('crown', 'tx-GOLD'), ")"]}},
                Lord($.client.lord),
                
                {tag: 'b', class: 'line-after grow', children: {tag: 'span', children: ["INTRIGUES (", ResourceIcon("INTRIGUE"), ")"]}},
                {
                    class: 'flex col gap', children: $.client.intrigueHand.map(int => ({
                        key: `${int.id}`, class: 'flex gap flex-between',
                        children: [
                            Intrigue(int),
                            {tag: 'hr', class: 'grow int-button'},
                            {tag: 'button', children: Icon('x-circle', 'font-md'), on: {click() {                            
                                $.client.intrigueHandAndIndexHistory.push({intrigueHand: [...$.client.intrigueHand], intrigueDeckIndex: $.client.intrigueDeckIndex});
                                $.client.intrigueHand = $.client.intrigueHand.filter(i => i !== int);
                                $.rerender();
                            }}}
                        ]
                    }))
                },
                {
                    class: 'flex gap', children: [
                        {tag: 'button', class: 'grow', children: ['+', ResourceIcon("INTRIGUE", {classes: 'font-md'})], on: {click() {
                            $.client.intrigueHandAndIndexHistory.push({intrigueHand: [...$.client.intrigueHand], intrigueDeckIndex: $.client.intrigueDeckIndex});
                            $.client.intrigueHand.push($.client.intrigueDeck[$.client.intrigueDeckIndex]);
                            $.client.intrigueDeckIndex = ($.client.intrigueDeckIndex + 1) % $.client.intrigueDeck.length;
                            $.rerender();
                        }}},
                        ...($.client.intrigueHandAndIndexHistory.length ? [{tag: 'button', class: 'grow', children: Icon('clock-clockwise', 'font-md'), on: {click() {
                            const history = $.client.intrigueHandAndIndexHistory.pop();
                            $.client.intrigueHand = history.intrigueHand;
                            $.client.intrigueDeckIndex = history.intrigueDeckIndex;
                            $.rerender();
                        }}}] : [])
                    ]
                }
            ]}
        ]
    }
}

window.$ = $;

function ExplanationSegment(title, body, dkbk = false) {
    return {class: `explanation rounded overflow-hidden flex col ${dkbk ? 'maxsize-100' : 'overflow-hidden'}`, children: [
        {class: 'back padded', children: [Icon('book-bookmark', 'tx-PWOB'), ' ', {tag: 'b', children: markdown(title)}]},
        {class: `padded grow ${dkbk ? 'dkbk overflow-auto flex' : 'tx-dark bg-text'}`, children: body}
    ]}
}

function IntrigueRoomAndExplanation() {
    return {
        id: 'room', key: 'room', class: 'fullwidth fullheight flex', children: [
            IntrigueRoom(),
            {
                render() {
                    return {class: 'padded gap flex-wrap overflow-auto', children: [
                        ExplanationSegment("Glossary", GlossaryExplanation),
                        ExplanationSegment("Gameplay", GameplayExplanation),
                        ExplanationSegment(["Buildings ", "BUILDING"], {class: 'flex flex-wrap gap wrap-list', children: Buildings.filter(b => (!b.isSkullport || $.config.skullport)).sort((a, b) => a.name.localeCompare(b.name)).map(Building)}, true),
                        ExplanationSegment(["Quests ", "QUEST"], {class: 'flex flex-wrap gap wrap-list', children: Quests.filter(b => !b.isMandatoryQuest && (!b.isSkullport || $.config.skullport)).sort((a, b) => a.name.localeCompare(b.name)).map(Quest)}, true),
                        ExplanationSegment(["Intrigues ", "INTRIGUE"], {class: 'flex flex-wrap gap wrap-list', children: Intrigues.filter(b => (!b.isSkullport || $.config.skullport)).sort((a, b) => a.name.localeCompare(b.name)).map(Intrigue)}, true),
                        ExplanationSegment(["Lords ", Icon('crown', 'tx-GOLD')], {class: 'flex flex-wrap gap wrap-list', children: Lords.filter(b => (!b.isSkullport || $.config.skullport)).sort((a, b) => a.name.localeCompare(b.name)).map(Lord)}, true),
                        
                    ]};
                },
                customMemo: () => false
            }
        ]
    }
}

const GameplayExplanation = [
    {tag: 'ul', children: [
        {tag: 'li', children: "Game start"},
        {tag: 'ul', children: [
            {tag: 'li', children: markdown(["Each player draws a Lord (", Icon('crown', 'tx-GOLD'), ')'])},
            {tag: 'li', children: markdown(["Starting player gets ", {"GOLD": 4}, "; each successive player gets 1 additional ", "GOLD"])},
            {tag: 'li', children: markdown(["Each player draws ", "INTRIGUE", "INTRIGUE"])},
            {tag: 'li', children: markdown(["Each player gets several ", "AGENT", "; quantity depends on player count"])},
        ]}
    ]},
    {tag: 'hr'},
    {tag: 'ul', children: [
        {tag: 'li', children: "Each of 8 rounds"},
        {tag: 'ul', children: [
            {tag: 'li', children: "Start of round"},
            {tag: 'ul', children: [
                {tag: 'li', children: markdown(["Return all assigned ", "AGENT", " to each player"])},
                {tag: 'li', children: markdown(["On round 5, each player gets 1 new ", "AGENT"])},
                {tag: 'li', children: markdown(["Perform all ", "BUILDING", " ", Icon('timer'), " conditions"])},
            ]},
            {tag: 'li', children: "Turn order"},
            {tag: 'ul', children: [
                {tag: 'li', children: markdown(["Player who owns ", "AMBASSADOR", " this round (if any)"])},
                {tag: 'li', children: markdown(["FIRST", " & loop through successive players"])},
                {tag: 'ul', children: [
                    {tag: 'li', children: markdown(["Skip players who cannot assign ", "AGENT", " to any action space"])}
                ]}
            ]},
            {tag: 'li', children: "Each turn"},
            {tag: 'ul', children: [
                {tag: 'li', children: markdown(["Player assigns ", "AGENT", " to an unoccupied action space & performs its action"])},
                {tag: 'li', children: markdown(["Player may complete a ", "QUEST"])},
                {tag: 'ul', children: [
                    {tag: 'li', children: markdown(["Non-", "MANDATORY", " ", "QUEST", " cannot be completed if a player has any ", "MANDATORY", " ", "MANDATORY_QUEST", " yet to complete"])}
                ]}
            ]},
            {tag: 'li', children: "End of round"},
            {tag: 'ul', children: [
                {tag: 'li', children: markdown(["Each agent assigned to ", "BUILDING", " ", {tag: 'b', children: "Waterdeep Harbor"}, " can be re-assigned to a new action space"])},
            ]},
        ]}
    ]},
    {tag: 'hr'},
    {tag: 'ul', children: [
        {tag: 'li', children: "Game end"},
        {tag: 'ul', children: [
            {tag: 'li', children: markdown(["Players get ", "VP", " for each ", "PWOB", " & each ", "GOLD", "GOLD"])},
            {tag: 'li', children: markdown(["Players lose ?×", "VP", " for each ", "CORRU", " according to the track"])},
            {tag: 'li', children: markdown(["Players get ?×", "VP", " according to their Lord condition"])},
            {tag: 'li', children: markdown(["The player with the most ", "VP", " is the winner!"])},
            {tag: 'ul', children: {tag: 'li', children: markdown(["Ties are broken by most ", "GOLD"])}}
        ]}
    ]}
];

const GlossaryExplanation = [
    {tag: 'ul', children: [
        {tag: 'li', children: markdown([{tag: 'i', children: "Tavern: "}, "one player's collection of resources"])},
        {tag: 'li', children: markdown(["P", ', ', "W", ', ', "O", ', ', "B", ' — ', {tag: 'i', children: "Adventurers"}, ': basic, functionless resources'])},
        {tag: 'ul', children: [
            {tag: 'li', children: markdown([{"P": 3}, ': 3×', "P"])},
            {tag: 'li', children: markdown(["POB", ': ', "P", ', ', "O", ', or ', "B"])},
            {tag: 'li', children: markdown([{"WB": 2}, ': ', "W", "W", ', ', "W", "B", ', or ', "B", "B"])},
            {tag: 'li', children: markdown(["PWOB", ': Any adventurer'])},
        ]},
        {tag: 'li', children: markdown(["GOLD", ' — ', {tag: 'i', children: "Gold: "}, 'unit of currency'])},
        {tag: 'li', children: markdown(["VP", ' — ', {tag: 'i', children: 'Victory point'}])},
        {tag: 'li', children: markdown(["CORRU", ' — ', {tag: 'i', children: "Corruption: "}, 'resource which penalizes you for ', "VP", ' at end of game'])},
        {tag: 'ul', children: [
            {tag: 'li', children: markdown([{tag: 'i', children: "The track: "}, "reports the current ", "VP", " cost associated with ", "CORRU"])},
            {tag: 'li', children: markdown(["If a player must get ", "CORRU", " while the track is empty, they lose 10×", "VP", " instead"])}
        ]}
    ]},
    {tag: 'hr'},
    {tag: 'ul', children: [
        {tag: 'li', children: markdown(["FIRST", ' — First player of the round, ', {tag: 'i', children: 'or: '}, ' token that makes a player the first player of the round'])},
        {tag: 'li', children: markdown(["AGENT", ' — ', {tag: 'i', children: 'Agent: '}, 'players assign agents on their turn'])},
        {tag: 'li', children: markdown(["AMBASSADOR", ' — ', {tag: 'i', children: 'Ambassador: '}, 'a special agent that players can control for one round at a time'])},
    ]},
    {tag: 'hr'},
    {tag: 'ul', children: [
        {tag: 'li', children: markdown(["BUILDING", ' — ', {tag: 'i', children: "Building: "}, 'contains action spaces'])},
        {tag: 'li', children: markdown([{tag: 'i', children: "Action space: "}, 'a space that causes some action when assigned to'])},
        {tag: 'ul', children: [
            {tag: 'li', children: markdown(["AGENT", ': ', ' — On assigning ', "AGENT", ' here...'])},
            {tag: 'ul', children: [
                {tag: 'li', children: markdown(["AGENT", ': ', "POB", ' — On assigning ', "AGENT", ' here, get ', "P", ', ', "O", ', or ', "B"])},
                {tag: 'li', children: markdown(["AGENT", ': ', "P", Icon('caret-right'), "B", ' — on assigning ', "AGENT", ' here, return ', "P", ' & get ', "B"])},
                {tag: 'li', children: {tag: 'i', children: markdown(["AGENT", ': is omitted when this is the only text on the card'])}},
            ]},
            {tag: 'li', children: markdown([{tag: 'i', children: 'Owner: '}, " — When an opponent's ", "AGENT", " is assigned here, the building's owner..."])},
            {tag: 'ul', children: [
                {tag: 'li', children: markdown([{tag: 'i', children: 'Owner: '}, "GOLD", "GOLD", " — When an opponent's ", "AGENT", " is assigned here, building owner gets ", "GOLD", "GOLD"])},
            ]},
            {tag: 'li', children: markdown([Icon('timer'), ': ', ' — When this building is purchased & at the start of each round...'])},
            {tag: 'ul', children: [
                {tag: 'li', children: markdown([Icon('timer'), ': ', "W", ' — When this building is purchased & at the start of each round, place ', "W", ' on this action space'])},
            ]}
        ]}
    ]},
    {tag: 'hr'},
    {tag: 'ul', children: [
        {tag: 'li', children: markdown(["QUEST", " — ", {tag: 'i', children: "Quest: "}, "can be completed for a cost, providing rewards"])},
        {tag: 'ul', children: [
            {tag: 'li', children: markdown(["QUEST", " — Get a face-up quest"])},
            {tag: 'li', children: [ResourceIcon("FACE-DOWN QUEST"), " — Get a face-down/random quest"]},
            {tag: 'li', children: markdown([ResourceIcon("MANDATORY_QUEST"), " — ", {tag: 'i', children: markdown(["MANDATORY", " quest: "])}," must be completed before non-", "MANDATORY", " quests"])},
            {tag: 'li', children: markdown(["ARCANA", ', ', "COMMERCE", ', ', "PIETY", ', ', "SKULLDUGGERY", ', ', "WARFARE", " — Types of quests"])},
            {tag: 'li', children: markdown("Immediate, one-time rewards:")},
            {tag: 'ul', children: [
                {tag: 'li', children: markdown(['Destroy ≤', "CORRU", "CORRU", "CORRU", ' from your tavern'])},
                {tag: 'li', children: markdown(['Own ', "BUILDING", "BUILDING", ' for free'])},
                {tag: 'li', children: markdown([{"VP": 18, "O": 2, "P": 1, "INTRIGUE": 1, "CORRU": 3}, ' — ', "Get 18×", "VP", ', 2×', "O", ', 1×', "P", ', 1× ', {tag: 'i', children: 'Intrigue'}, ' (', "INTRIGUE", '), & 1×', "CORRU"])},
            ]},
            {tag: 'li', children: markdown("Repeated, long-term rewards:")},
            {tag: 'ul', children: [
                {tag: 'li', children: markdown(['On start of round, get ', "PWOB"])},
                {tag: 'li', children: markdown(["On ", "BUILDING", "/", "INTRIGUE", " providing ", "B", ", get ", {"GOLD": 2}])},
                {tag: 'li', children: markdown(["On completing ", "SKULLDUGGERY", " ", "QUEST", ", get ", {"VP": 2}])}
            ]}
        ]}
    ]},
    {tag: 'hr'},
    {tag: 'ul', children: [
        {tag: 'li', children: markdown(["INTRIGUE", ' — ', {tag: 'i', children: "Intrigue"}, ': secret card, can be played for miscellaneous rewards'])},
        {tag: 'li', children: [Icon("crown", 'tx-GOLD'), ' — ', {tag: 'i', children: "Lord"}, ': provides a secret end-game condition for surplus ', ResourceIcon("VP")]}
    ]}
];

export default function Room() {
    return {
        state() { $.rerender = () => this.rerender(); return null; },
        render() {
            return { tag: 'main', class: 'fullwidth fullheight', children: {key: `${!!$.game}`, class: 'fullwidth fullheight', children: $.game ? IntrigueRoomAndExplanation() : Config()} };
        }
    };
}