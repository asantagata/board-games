import context from "../utils/context.js";
import { setupGame } from "../utils/game.js";
import SVGs from "./SVGs.js";

export default function PlayerMenu() {
    return {
        id: 'player-menu',
        children: [
            {
                class: 'player-list',
                children: [
                    {
                        class: 'flex-between',
                        key: 'heading',
                        children: [
                            {
                                tag: 'h2', children: 'Players'
                            },
                            {
                                tag: 'h2', children: {
                                    tag: 'a', children: 'How to play', target: '_blank', href: 'https://cdn.1j1ju.com/medias/b3/a5/81-century-edition-golem-rulebook.pdf'
                                }
                            }
                        ]
                    },
                    ...context.players.map((player) => ({
                        class: 'player-row',
                        key: `player-${player.playerId}`,
                        children: [
                            {
                                tag: 'input',
                                autocomplete: false,
                                placeholder: 'no-name nelly',
                                value: player.name,
                                on: {
                                    change(e) {
                                        player.name = e.target.value;
                                    }
                                }
                            },
                            {
                                class: 'color-row',
                                children: ['y', 'g', 'b', 'p', 'o'].map((color) => ({
                                    class: {'color-gem': true, 'selected-color-gem': player.color === color},
                                    innerHTML: SVGs.gem(color),
                                    on: {
                                        click() {
                                            if (player.color === color) return;
                                            let otherPlayer = context.players.find(p => p.color === color);
                                            if (otherPlayer) {
                                                otherPlayer.color = player.color;
                                            }
                                            player.color = color;
                                            context.rerender();
                                        }
                                    }
                                }))
                            },
                            ...(context.players.length > 2 ? [{
                                tag: 'button', innerHTML: SVGs.x, on: {
                                    click() {
                                        context.players = context.players.filter(p => p !== player);
                                        context.rerender();
                                    }
                                }
                            }] : [])
                        ],
                    })),
                    {
                        key: 'player-buttons',
                        class: 'player-buttons',
                        children: [
                            {tag: 'button', children: 'Add player', on: {
                                click() {
                                    const colors = new Set(['y', 'g', 'b', 'p', 'o']);
                                    context.players.forEach(p => colors.delete(p.color));
                                    const newColor = Array.from(colors)[0];
                                    const id = Math.max(...context.players.map(p => p.playerId)) + 1;
                                    context.players.push({name: '', color: newColor, playerId: id});
                                    context.rerender();
                                }
                            }},
                            {tag: 'button', children: 'Start', on: {
                                click() {
                                    setupGame();
                                }
                            }}
                        ]
                    }
                ]
            }
        ]
    };
}