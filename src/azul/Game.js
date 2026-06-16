import context from "./context.js";
import { GAME_GRID, PENALTIES, getPlayerScores, getPlayerBonuses, handleGameClick, handleGameHover, rowFeasible, startGame } from "./utils.js";

const SVGs = {
    row: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1" stroke="var(--tile-2)"/><circle cx="19" cy="12" r="1" stroke="var(--tile-3)"/><circle cx="5" cy="12" r="1" stroke="var(--tile-4)"/></svg>`,
    col: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1" stroke="var(--tile-2)"/><circle cx="12" cy="5" r="1" stroke="var(--tile-3)"/><circle cx="12" cy="19" r="1" stroke="var(--tile-4)"/></svg>`,
    set: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--tile-3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="5" r="1"/><circle cx="5" cy="19" r="1"/></svg>`
}

function ObjectiveTileClass(color, canBeNegative = true) {
    return {'tile': true, 'glow-tile': false, ...Object.fromEntries(Array.from({length: 6}, (_, col) => [`tile-${col}`, col === color])), ...(canBeNegative ? {[`tile--1`]: color === -1} : {})};
}

function RowsChildren(player) {
    return Array.from({length: 5}, (_, row) => {
        const feasible = rowFeasible(player, row);
        return Array.from({length: row + 1}, (_, cell) => {
        const color = player.rows[row] && player.rows[row].count > cell ? player.rows[row].tile : 0;
        return {
            style: {'grid-area': `n${row+1}${cell+1}`},
            class: {...ObjectiveTileClass(color, false), [`row-${row}`]: true, feasible},
            'data-tile': color,
            'data-player': player.id,
            'data-row': row
        };
    });
    }).flat();
}

function GridChildren(player) {
    return GAME_GRID.map((row, rowId) => row.map((color, colId) => {
        const newborn = player.rows[rowId]?.count === rowId + 1 && player.rows[rowId]?.tile === color;
        return {
            style: {'grid-area': `g${rowId+1}${colId+1}`},
            'data-tile': color,
            class: {
                'tile': true, [`tile-${color}`]: true, 
                'inactive-tile': !player.grid[rowId][colId] && !newborn,
                'grid-glow-tile': newborn
            }
        };
    })).flat(1);
}

const CHEVRON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;
const ChevronChildren = Array.from({length: 5}, (_, i) => ({
    class: 'flex center',
    style: {'grid-area': `a${i+1}`},
    innerHTML: CHEVRON
}));

function LeftChevronChildren(player) {
    return Array.from({length: 6}, (_, i) => ({
        class: {flex: true, center: true, 'left-chevron': true, 'inactive-chevron': !rowFeasible(player, i)},
        style: {'grid-area': `c${i+1}`},
        innerHTML: CHEVRON
    }))
}

function PenaltyChildren(player) {
    return [
        ...[...player.penalty, ...Array.from({length: 7 - player.penalty.length}, () => 0)].map((t,i) => ({
            style: {'grid-area': `p${i+1}`},
            class: {...ObjectiveTileClass(t), 'feasible': player.id === context.actingPlayerId && context.selectedFactoryAndTile, 'penalty': true},
            'data-tile': t,
            'data-player': player.id,
            'data-row': 5
        })),
        ...PENALTIES.map((p,i) => ({
            children: p, style: {'grid-area': `pl${i+1}`}, class: {'penalty-label': true, 'inactive-pl': i >= player.penalty.length}
        }))
    ];
}

function TallyChildren(player, scores) {
    const scoresExists = scores.roundTotal + -2 * scores.penalty;
    let nonZeroEntries = +scores.bonus;
    return [
        {
            style: {'grid-area': 't6'},
            class: {score: true, zero: !scores.bonus, equals: true, 'bonus-scores': true},
            children: `${scores.bonus}`
        },    
    ...[
        {area: 't1', index: 1},
        {area: 't2', index: 2},
        {area: 't3', index: 3},
        {area: 't4', index: 4},
        {area: 't5', index: 5},
        {area: 't7', index: 'penalty'},
    ].map(e => ({
        style: {'grid-area': e.area},
        class: {score: true, zero: !scores[e.index], plus: !(scores[e.index] && !nonZeroEntries++)},
        children: `${scores[e.index]}`
    })),
        {
            class: {score: true, plus: player.pastRoundScore, 'round-total-score': true, zero: !scoresExists},
            style: {'grid-area': 't9'},
            children: `${scores.roundTotal}`
        },
        {
            class: {score: true, equals: scores.netTotal},
            style: {'grid-area': 'total'},
            children: `${scores.netTotal}`
        }
    ];
}

function BonusChild(player) {
    const bonuses = getPlayerBonuses(player);
    if (!bonuses.row && !bonuses.col && !bonuses.row) 
        return {class: {bonuses: true, 'no-bonuses': true}, innerHTML: 'No bonuses'}
    const relevantBonuses = Object.keys(bonuses).filter(k => bonuses[k]).map(k => ({type: k, count: bonuses[k]}));
    return {class: {bonuses: true, 'no-bonuses': false}, innerHTML: relevantBonuses.map(b => 
        `${b.count} × ${SVGs[b.type]}`
    ).join(' <span class="bonus-plus">+</span> ')};
}

function PlayerArea(player) {
    const scores = getPlayerScores(player);
    const scoresExists = scores.roundTotal + -2 * scores.penalty - scores.bonus;
    return {
        class: {'player-area': true, 'acting-player': player.id === context.actingPlayerId},
        style: {'--p': `var(--tile-${player.color})`},
        key: player.id,
        children: [
            ...RowsChildren(player),
            ...ChevronChildren,
            ...GridChildren(player),
            ...TallyChildren(player, scores),
            ...PenaltyChildren(player),
            ...LeftChevronChildren(player),
            BonusChild(player),
            {tag: 'h2', class: {'round-score-text': true, zero: !scoresExists}, children: 'Round score:'},
            {
                class: 'flex space-between', style: {'grid-area': 'nt8'},
                children: [
                    {
                        class: {'player-name': true, 'player-name-active': player.id === context.actingPlayerId}, children: player.name
                    },
                    {class: {'score': true, 'gap': true, 'zero': !player.pastRoundScore}, children: [
                        {tag: 'h2', class: 'past-score-text', children: 'Past score: '},
                        {children: player.pastRoundScore}
                    ]}
                ]
            }
        ]
    };
}

function Factory(factory, index) {
    if (Object.keys(factory).length === 0) return {class: 'factory tile-collection', 'data-factory': index};
    const unfoldedFactory = Object.keys(factory).map(k => Array.from({length: factory[k]}, () => +k)).flat(1);
    return {
        class: 'factory tile-collection',
        'data-factory': index,
        children: unfoldedFactory.map(f => ({class: ObjectiveTileClass(f, false), 'data-tile': f}))
    }
}

function PlayerName(playerOrId) {
    let player = isNaN(playerOrId) ? playerOrId : context.players[playerOrId];
    return {tag: 'span', style: {color: `var(--tile-${player.color})`}, children: player.name};
}

let instrId = 0;
function Footer() {
    return {
        id: 'footer', class: 'padded flex gap',
        children: [
            {
                class: 'flex gap col grow',
                children: [
                    {
                        key: 'fact', id: 'factories', style: {'--n-factories': context.factories.length}, children: [
                            ...context.factories.map(Factory),
                            ..."ABCDEFGHIJK".split('').slice(0, context.factories.length).map(i => ({
                                tag: 'h2', class: 'factory-letter', children: i
                            }))
                        ]
                    },
                    {
                        id: 'floor', key: 'foot',
                        class: 'flex gap tile-collection',
                        'data-factory': '-1',
                        children: Object.keys(context.floor).map(k => Array.from({length: context.floor[k]}, 
                            () => ({class: ObjectiveTileClass(+k),'data-tile': k}))).flat(1)
                    },
                    {id: 'instruction', key: `i-${instrId++}`, style: {'--p': `var(--tile-${context.players[context.actingPlayerId]?.color ?? '-1'})`}, children: (() => {
                        if (!context.selectedFactoryAndTile && !context.gameOver) return [PlayerName(context.actingPlayerId), ' must choose tiles from a factory or the factory-floor.'];
                        else if (!context.gameOver) {
                            const tile = context.selectedFactoryAndTile.tile;
                            const count = (context.selectedFactoryAndTile.factory === -1 ? context.floor : context.factories[context.selectedFactoryAndTile.factory])[tile];
                            return [PlayerName(context.actingPlayerId), ' must place ',
                                {tag: 'span', children: '■'.repeat(count), style: {color: `var(--tile-${tile})`}},
                                ' in their rows or floor.'
                            ]
                        } else {
                            const winners = [...context.winningPlayerIds];
                            return [
                                'Game over! ',
                                ...winners.slice(0, -1).flatMap(w => [PlayerName(w), ', ']).slice(0, -1),
                                (winners.length > 1 ? ' & ' : ''),
                                PlayerName(winners.at(-1)),
                                ` ${winners.length > 1 ? 'have' : 'has'} won!`,
                                {tag: 'span', class: 'halftext', children: ' ● '},
                                {tag: 'u', children: 'Play again, same players', on: {click() {
                                    startGame();
                                }}},
                                {tag: 'span', class: 'halftext', children: ' ● '},
                                {tag: 'u', children: 'Play again, new players', on: {click() {
                                    context.gameStarted = false;
                                    context.rerender();
                                }}}
                            ]
                        }
                    })()},
                ]
            },
            {
                id: 'bonus-guide', children: [
                    {class: 'right', innerHTML: `Row ${SVGs.row}`}, {children: ': +2'},
                    {class: 'right', innerHTML: `Column ${SVGs.col}`}, {children: ': +7'},
                    {class: 'right', innerHTML: `Set ${SVGs.set}`}, {children: ': +10'},
                ]
            }
        ]
    };
}

export default function Game() {
    return {
        id: 'game', class: 'fullheight fullwidth flex col',
        children: [
            {
                class: 'player-areas padded grow dark flex gap wrap min-height-0',
                children: context.players.map(PlayerArea)
            },
            Footer()
        ],
        on: {
            click(e) { handleGameClick(e); },
            mouseover(e) { handleGameHover(e); },
            mouseexit(e) { handleGameHover(e); },
        }
    };
}