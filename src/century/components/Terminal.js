import context from "../utils/context.js";
import { gemsGreaterOrEqual, rest, playMerchant, goBack, endPlayerTurn, upgradeGem, spreadGems, payGem, acquireMerchant, acquireGolem, setupGame, revertTo } from "../utils/game.js";
import { merchants, phases, golems } from "../utils/data.js";
import GolemCard from "./GolemCard.js";
import MerchantCard from "./MerchantCard.js";
import SVGs from "./SVGs.js";

function stringifyMerchant(cardId) {
    const merchant = merchants[cardId];
    if (merchant.type === 'upgrade') return {tag: 'span', innerHTML: SVGs.gem('rainbow').repeat(merchant.upgrades)};
    const from = spreadGems(merchant.from).map(SVGs.gem).join('');
    const to = spreadGems(merchant.to).map(SVGs.gem).join('');
    return {tag: 'span', innerHTML: from + (from ? SVGs.chevronRight : '') + to};
}

function stringifyGolem(golemId, index) {
    const golem = golems[golemId];
    return {tag: 'span', innerHTML: spreadGems(golem.cost).map(SVGs.gem).join('') + SVGs.chevronRight + golem.value + ([' (<span style="color: #a8653c">●</span>)', ' (<span style="color: #b3aaa3">●</span>)'][index] || '')}
}

function Option(icon, text, onClick) {
    return {
        class: 'card option',
        children: [
            {class: 'option-icon', innerHTML: icon},
            {class: 'option-text', innerHTML: text}
        ],
        on: {
            click() {
                onClick();
                context.rerender();
            }
        }
    }
}

const bodyTypes = {
    [phases.START]: (activePlayer, activePlayerName) => ({
        path: [activePlayerName, `'s turn / `],
        question: [`What will `, activePlayerName, ` do?`],
        options: [
            ...(activePlayer.freeCards.some(cardId => {
                const card = merchants[cardId];
                return card.type === 'upgrade' || gemsGreaterOrEqual(activePlayer.gems, card.from);
            }) ? [
                Option(SVGs.gem('rainbow'), 'Play merchant', () => context.standing.phase = phases.PLAYING_MERCHANT)
            ] : []),
            ...(context.merchantRow.length > 0 ? [
                Option('🏬', 'Acquire merchant', () => {
                    context.standing.phase = phases.ACQUIRING_MERCHANT;
                    context.standing.details = {paid: 0};
                })
            ] : []),
            ...(context.golemRow.some(golemId => gemsGreaterOrEqual(activePlayer.gems, golems[golemId].cost)) ? [
                Option('🤖', 'Acquire golem', () => context.standing.phase = phases.ACQUIRING_GOLEM)
            ] : []),
            Option('💤', 'Rest', rest),
        ]
    }),
    [phases.PLAYING_MERCHANT]: (activePlayer, activePlayerName) => ({
        path: [activePlayerName, `'s turn / playing merchant / `],
        question: [`Which merchant will `, activePlayerName, ` play?`],
        options: [...activePlayer.freeCards.filter(cardId => {
            const card = merchants[cardId];
            return card.type === 'upgrade' || gemsGreaterOrEqual(activePlayer.gems, card.from);
        }).map((cardId, i, a) => ({...MerchantCard(cardId, i, a.length + 1), on: {click() {
            playMerchant(cardId); context.rerender();
        }}})),
        Option('⬅️', 'Go back', goBack)
        ]
    }),
    [phases.DOING_UPGRADE]: (activePlayer, activePlayerName) => ({
        path: [activePlayerName, `'s turn / playing merchant / upgrading ${context.standing.details.upgradeIndex + 1} of ${context.standing.details.upgradeCount} gems / `],
        question: [`Which upgrade will `, activePlayerName, ` perform?`],
        options: [
            ...['y', 'g', 'b'].filter(gem => activePlayer.gems[gem] > 0).map(gem => Option(
                SVGs.gem(gem), `Upgrade to ${SVGs.gem({y: 'g', g: 'b', b: 'p'}[gem])}`, () => upgradeGem(gem)
            )),
            Option('⏭️', 'Continue', endPlayerTurn),
            Option('⬅️', 'Go back', goBack)
        ]
    }),
    [phases.ACQUIRING_MERCHANT]: (activePlayer, activePlayerName) => ({
        path: [activePlayerName, `'s turn / acquiring merchant / `],
        question: [`Will `, activePlayerName, ` acquire the merchant card `, stringifyMerchant(context.merchantRow[context.standing.details.paid].cardId), ` or spend gems to continue?`],
        options: [
            ...['y', 'g', 'b', 'p'].filter(gem => activePlayer.gems[gem] > 0 && context.merchantRow.length > context.standing.details.paid + 1).map(gem => Option(
                SVGs.gem(gem), `Pay ${SVGs.gem(gem)}`, () => payGem(gem)
            )),
            Option('🃏', 'Acquire merchant', acquireMerchant),
            Option('⬅️', 'Go back', goBack)
        ]
    }),
    [phases.ACQUIRING_GOLEM]: (activePlayer, activePlayerName) => ({
        path: [activePlayerName, `'s turn / acquiring golem / `],
        question: [`Which golem will `, activePlayerName, ` acquire?`],
        options: [
            ...context.golemRow.filter(golemId => gemsGreaterOrEqual(activePlayer.gems, golems[golemId].cost)).map((golemId) => ({...GolemCard(golemId), on: {click() {
                acquireGolem(golemId);
                context.rerender();
            }}})),
            Option('⬅️', 'Go back', goBack)
        ]
    }),
    [phases.RECONCILING_OVERFLOW]: (activePlayer, activePlayerName) => ({
        path: [activePlayerName, `'s turn / returning excess gems / `],
        question: [`Which gem will `, activePlayerName, ` return?`],
        options: [
            ...['y', 'g', 'b', 'p'].filter(gem => activePlayer.gems[gem] > 0).map(gem => Option(SVGs.gem(gem), `Return gem ${SVGs.gem(gem)}`, () => {
                activePlayer.gems[gem]--;
                endPlayerTurn();
            })),
            Option('⬅️', 'Go back', goBack)
        ]
    }),
    [phases.GAME_OVER]: (activePlayer, activePlayerName) => ({
        path: [activePlayerName, `'s turn / `],
        question: [...context.standing.winnerIds.flatMap((id, i, a) => [
            getPlayerName(context.players[id]),
            i === a.length - 1 ? '' : i === a.length - 2 ? ' and ' : ', '
        ]), ` ${context.standing.winnerIds.length === 1 ? 'has' : 'have'} won!`],
        options: [
            Option('👤', 'Same players', setupGame),
            Option('👥', 'New players', () => context.gameStarted = false)
        ]
    }),
    [phases.REPEATING_TRADE]: (activePlayer, activePlayerName) => ({
        path: [activePlayerName, `'s turn / playing merchant / `],
        question: [`Will `, activePlayerName, ` repeat the trade `, stringifyMerchant(context.standing.details.cardId), `?`],
        options: [
            Option('🔄', 'Repeat', () => playMerchant(context.standing.details.cardId, true)),
            Option('⏭️', 'Continue', endPlayerTurn),
            Option('⬅️', 'Go back', goBack)
        ]
    })
};

function getPlayerName(player) {
    return {
        tag: 'span', 
        style: {color: `var(--${player.color})`},
        children: player.name
    };
}

let terminalKey = 0;

export default function Terminal() {
    const activePlayer = context.players[context.standing.activePlayerId];
    const activePlayerName = getPlayerName(activePlayer);

    const body = bodyTypes[context.standing.phase](activePlayer, activePlayerName);
    
    return {
        class: 'terminal',
        children: [
            ...context.standing.history.map((historyEntry, i) => ({
                class: 'terminal-entry',
                key: `history-${i}`,
                children: [
                    {
                        children: (() => {
                            const {path, question} = historyEntry.description(
                                getPlayerName(context.players[historyEntry.activePlayerId]),
                                stringifyMerchant, stringifyGolem
                            )
                            return [
                                {tag: 'span', children: `Round ${historyEntry.roundIndex} • `},
                                {tag: 'span', class: 'path', children: path},
                                {tag: 'span', class: 'question', children: question}
                            ];
                        })()
                    },
                    {
                        class: 'revert',
                        children: 'Revert',
                        on: {
                            click() {
                                revertTo(historyEntry, i)
                            }
                        }
                    }
                ]
            })),
            {
                key: 'last-entry',
                class: 'terminal-last-entry',
                children: [
                    {
                        key: 'path',
                        children: [
                            {tag: 'span', class: 'path', children: body.path},
                            {tag: 'span', class: 'question', children: body.question}
                        ]
                    },
                    {
                        key: `options-${terminalKey++}`,
                        class: 'options row stretchy-row', 
                        style: {'--count': body.options.length},
                        children: body.options.map((o, i, a) => ({...o, style: {...(o.style || {}), '--index': i, '--count': a.length}})),
                        on: {mount() {
                            this.target.parentElement.parentElement.scrollTo(0, 9999);
                        }}
                    }
                ]
            }
        ]
    };
}