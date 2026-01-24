import context from "../utils/context.js";
import MerchantCard from "./MerchantCard.js";
import GolemCard from "./GolemCard.js";
import PlayerArea from "./PlayerArea.js";
import TotemPole from "./TotemPole.js";
import Terminal from "./Terminal.js";
import { spreadGems } from "../utils/game.js";
import SVGs from "./SVGs.js";
import { phases } from "../utils/data.js";

export default function Game() {
    return {
        id: 'game',
        children: [
            {
                class: 'rows',
                children: [
                    {
                        class: 'flex',
                        children: [
                            TotemPole(),
                            {
                                class: 'decorated-row row',
                                children: context.merchantRow.map(({cardId, gems}, index) => ({
                                    key: cardId,
                                    children: {
                                        class: 'decorated-row-entry',
                                        children: [
                                            {...MerchantCard(cardId), class: {
                                                'card': true, 'merchant-card': true, 
                                                'topurchase-card': context.standing.phase === phases.ACQUIRING_MERCHANT && context.standing.details?.paid === index
                                            }},
                                            {
                                                class: 'gem-set',
                                                innerHTML: spreadGems(gems).map(SVGs.gem).join('')
                                            }
                                        ]
                                    }
                                }))
                            }
                        ]
                    },
                    {
                        class: 'flex',
                        children: [
                            {
                                class: 'decorated-row row',
                                children: context.golemRow.map((golemId, index) => ({
                                    key: golemId,
                                    children: {
                                        class: 'decorated-row-entry',
                                        children: [
                                            GolemCard(golemId),
                                            ...([
                                                [{class: 'copper-token token'}],
                                                [{class: 'silver-token token'}],
                                            ][index] ?? [])
                                        ]
                                    }
                                }))
                            },
                            TotemPole()
                        ]
                    }
                ]
            },
            {
                class: 'player-areas',
                children: context.players.map(PlayerArea)
            },
            {
                class: 'terminal-wrapper',
                children: [
                    {
                        key: 'subterminal-info',
                        class: 'subterminal-info',
                        children: [
                            {style: {'font-size': 'medium'}, children: `Round ${context.standing.roundIndex}`},
                            {children: [
                                {
                                    tag: 'span', 
                                    style: {color: `var(--${context.players[context.standing.activePlayerId].color})`},
                                    children: context.players[context.standing.activePlayerId].name
                                },
                                "'s turn"
                            ]},
                            ...(context.standing.gameOver ? [{
                                class: 'finalround-text', children: 'Game over'
                            }] : context.standing.lastRound ? [{
                                class: 'finalround-text', children: 'Final round'
                            }] : []),
                            {
                                class: 'gap-column',
                                children: [
                                    {tag: 'h2', children: {
                                        tag: 'a', children: 'How to play', target: '_blank', href: 'https://cdn.1j1ju.com/medias/b3/a5/81-century-edition-golem-rulebook.pdf'
                                    }},
                                    {tag: 'h2', children: {
                                        tag: 'u', class: 'a', children: 'See deck', on: {click() {
                                            context.cardModalOpen = true; context.rerender();
                                        }}
                                    }},
                                    {tag: 'h2', children: {
                                        tag: 'u', class: 'a', children: 'Main menu', on: {click() {
                                            context.quitModalOpen = true; context.rerender();
                                        }}
                                    }}
                                ]
                            }
                        ]
                    },
                    Terminal()
                ]
            }
        ]
    };
}