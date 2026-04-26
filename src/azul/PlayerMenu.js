import context from "./context.js";
import { startGame } from "./utils.js";

const SVG_X = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

export default function PlayerMenu() {
    return {
        class: 'padded flex fullheight center',
        children: [
            {
                class: 'flex col gap',
                children: [
                    {class: 'flex fullwidth space-between', children: [
                        {tag: 'h2', children: 'Players'},
                        {tag: 'h2', children: {
                            tag: 'a', children: 'How to play', target: '_blank',
                            href: 'https://cdn.1j1ju.com/medias/03/14/fd-azul-rulebook.pdf'
                        }}
                    ]},
                    {class: 'flex col gap', children: context.players.map((player, playerIndex) => ({
                        key: `${player.id}`,
                        children: {
                            class: 'flex gap align-center',
                            children: [
                                {tag: 'input', type: 'text', placeholder: 'no-name nelly', value: player.name, on: {
                                    change(e) { player.name = e.target.value; }
                                }},
                                {class: 'flex gap', 
                                    children: Array.from({length: 5}, (_, i) => {
                                        const colorIndex = (playerIndex+i+5)%5+1;
                                        return {
                                            class: {'player-color': true, 'tile': true, [`tile-${colorIndex}`]: true, 'selected': player.color === colorIndex},
                                            key: `${colorIndex}`,
                                            on: {click() {
                                                if (colorIndex === player.color) return;
                                                const otherPlayer = context.players.find(p => p.color === colorIndex);
                                                if (otherPlayer) otherPlayer.color = player.color;
                                                player.color = colorIndex;
                                                context.rerender();
                                            }}
                                        };
                                    })},
                                ...(context.players.length > 2 ? [{
                                    class: 'icon-button color-tile-1', innerHTML: SVG_X, on: {click() {
                                        context.players = context.players.filter(p => p.id !== player.id);
                                        context.rerender();
                                    }}
                                }] : [])
                            ]
                        }
                    }))},
                    {class: 'flex fullwidth space-between', children: [
                        {tag: 'button', children: 'Add player', disabled: (context.players.length === 4) || undefined, on: {click() {
                            const newColor = [1,2,3,4,5].filter(c => !context.players.some(p => p.color === c))[0];
                            const newId = Math.max(...context.players.map(p => p.id)) + 1;
                            const newPlayer = {name: '', id: newId, color: newColor};
                            context.players.push(newPlayer);
                            context.rerender();
                        }}},
                        {tag: 'button', children: 'Start', on: {
                            click() {
                                startGame();
                            }
                        }}
                    ]}
                ],
            }
        ]
    };
}