import context from "../utils/context.js";
import MerchantCard from "./MerchantCard.js";
import { spreadGems } from "../utils/game.js";
import SVGs from "./SVGs.js";

export default function PlayerArea(player) {
    const spreadedGems = spreadGems(player.gems);
    return {
        class: 'player-area',
        style: {'--color': `var(--${player.color})`},
        children: [
            {
                class: 'player-info',
                children: [
                    {
                        class: 'player-basics',
                        children: [
                            {class: {
                                'player-name': true,
                                'active-player-name': player.playerId === context.standing.activePlayerId
                            }, children: player.name},
                            {class: 'player-score', children: `${player.score} points`},
                            {class: 'player-golemcount', children: `${player.nGolems} / ${context.golemThreshold} golems`}
                        ]
                    },
                    {
                        class: 'player-caravan',
                        style: {'--count': spreadedGems.length},
                        children: [
                            ...spreadedGems,
                            ...Array.from({length: Math.max(0, 10 - spreadedGems.length)}, () => undefined)
                        ].map(gem => ({
                            class: 'caravan-gem',
                            innerHTML: SVGs.gem(gem)
                        }))
                    }
                ]
            },
            {
                class: 'player-cards',
                children: {
                    class: 'row stretchy-row',
                    style: {'--count': player.freeCards.length + player.usedCards.length},
                    children: [
                        ...player.usedCards.map((card, index) => ({...MerchantCard(card, index, player.freeCards.length + player.usedCards.length), class: 'card merchant-card used-card'})),
                        ...player.freeCards.map((card, index) => MerchantCard(card, index + player.usedCards.length, player.freeCards.length + player.usedCards.length))
                    ]
                }
            }
        ]
    }
}