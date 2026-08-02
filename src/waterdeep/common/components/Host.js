import { getRandomSeed, getRandomConfirmationString } from "@/utils/random.js";
import { startGame } from "@/utils/game.js";
import $ from "@/$.js";
import Icon from "./Icon.js";
import Game from "./Game.js";

function Config() {
    return {class: 'back center fullwidth fullheight', children: [
        {class: 'col gap', children: [
            {class: 'flex flex-between gap', key: 'heading', children: [
                {tag: 'b', class: 'hftx', children: "PLAYERS"},
                {tag: 'b', class: 'hftx', children: [
                    {tag: 'a', class: 'hftx', target: '_blank', children: "BASE", href: "https://media.wizards.com/downloads/dnd/DnD_LOW_Rulebook_EN.pdf"},
                    ' / ',
                    {tag: 'a', class: 'hftx', target: '_blank', children: "SKULLPORT", href: "https://media.wizards.com/downloads/dnd/SOS_Rulebook.pdf"}
                ]}
            ]},
            {class: 'flex col gap', key: 'players', children: $.config.players.map((player, ix) => ({
                key: `${player.id}`, class: 'flex gap', children: [
                    {tag: 'input', class: 'padded rounded dark', placeholder: 'No-name Nelly', on: {input() {
                        player.name = this.target.value;
                    }}},
                    {class: 'flex gap align-center', children: ["P", "O", "B", "R", "Y", "G"].map(col => ({...Icon('person', `font-large tx-PLAYER-${col} transition-opacity ${player.color === col ? '' : 'low-opacity pointer'}`), on: {click() {
                        if (col === player.color) return;
                        const otherPlayer = $.config.players.find(p => p.color === col);
                        if (otherPlayer) otherPlayer.color = player.color;
                        player.color = col;
                        $.rerender();
                    }}}))},
                    {class: `grow text-center padded rounded dark transition-color tx-PLAYER-${player.color}`, children: getRandomConfirmationString(ix)},
                    ...($.config.players.length > 2 ? [{tag: 'button', children: Icon('x-circle', 'font-md'), on: {click() {
                        $.config.players = $.config.players.filter(p => p !== player);
                        $.rerender();
                    }}}] : [])
                ]
            }))},
            {class: 'flex gap', key: 'buttons', children: [
                ...($.config.players.length < ($.config.skullport ? 6 : 5) ? [{key: 'add', tag: 'button', class: 'subtle font-md grow', children: Icon('user-plus'), on: {click() {
                    const id = Math.max(...$.config.players.map(p => p.id)) + 1;
                    const color = ["P", "O", "B", "R", "Y", "G"].find(i => !$.config.players.some(op => op.color === i));
                    $.config.players.push({color, name: '', id});
                    $.rerender();
                }}}] : []),
                {key: 'play', tag: 'button', class: 'subtle font-md grow', children: Icon('play'), on: {click() {
                    startGame();
                }}},
            ]},
            {class: 'flex flex-between gap', key: 'sp', children: [
                {tag: 'b', class: 'line-after grow', children: {tag: 'span', children: ['USE ', {tag: 'span', class: 'tx-LIGHT-CORRU', children: 'SKULLPORT'}, '?']}},
                {tag: 'input', type: 'checkbox', checked: $.config.skullport || undefined, on: {change() {
                    $.config.skullport = this.target.checked;
                    $.config.long = false;
                    if (!$.config.skullport)
                        $.config.players = $.config.players.filter((_,i) => i < 5);
                    $.rerender();
                }}}
            ]},
            ...($.config.skullport ? [
            {class: 'flex flex-between gap', key: 'long', children: [
                {tag: 'b', class: 'line-after grow', children: 'LONG GAME?'},
                {tag: 'input', type: 'checkbox', checked: $.config.long || undefined, on: {change() {
                    $.config.long = this.target.checked;
                }}}
            ]}] : []),
            {class: 'flex flex-between gap', key: 'seed', children: [
                {tag: 'b', class: 'line-after grow', children: 'SEED'},
                {class: 'flex gap', children: [
                    {class: 'padded rounded dark', children: $.config.seed},
                    {tag: 'button', class: 'subtle font-md', children: Icon('copy'), on: {click() {
                        navigator.clipboard.writeText($.config.seed);
                    }}},
                    {tag: 'button', class: 'subtle font-md', children: Icon('arrow-clockwise'), on: {click() {
                        $.config.seed = getRandomSeed(); $.rerender();
                    }}}
                ]}
            ]}
        ]}
    ]}
}

export default function Host() {
    return {
        state() { $.rerender = () => this.rerender(); return null; },
        render() {
            return { tag: 'main', class: 'fullwidth fullheight', children: {key: `${!!$.game}`, class: 'fullwidth fullheight', children: $.game ? Game() : Config()} };
        }
    };
}