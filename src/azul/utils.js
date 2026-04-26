import context from "./context.js";

export const GAME_GRID = Array.from({length: 5}, (_, row) => (
    Array.from({length: 5}, (_, col) => (row+col+5)%5+1)
));

export const PENALTIES = [-1,-1,-2,-2,-2,-3,-3];

function sum(arr) { return arr.reduce((acc,cur) => acc + cur, 0); }

function evaluateTileScore(player, row) {
    if (player.rows[row]?.count !== row + 1) return 0;
    const color = player.rows[row].tile;
    const col = GAME_GRID[row].indexOf(color);
    let score = 1;
    const grid = (r, c) => player.grid[r]?.[c] || 
        (r < row && player.rows[r]?.count === r + 1 && player.rows[r]?.tile === GAME_GRID[r]?.[c]);
    for (let r = row-1; grid(r, col); r--) score++;
    for (let r = row+1; grid(r, col); r++) score++;
    for (let c = col-1; grid(row, c); c--) score++;
    for (let c = col+1; grid(row, c); c++) score++;
    return score;
}

let scoreMemo = {};
export function getPlayerScores(player) {
    if (scoreMemo[player.id] && player.id !== context.actingPlayerId) return scoreMemo[player.id];
    const bonuses = getPlayerBonuses(player);
    const scores = {
        past: player.pastRoundScore,
        penalty: sum(PENALTIES.slice(0, player.penalty.length)),
        bonus: 2 * bonuses.row + 7 * bonuses.col + 10 * bonuses.set,
        1: evaluateTileScore(player, 0),
        2: evaluateTileScore(player, 1),
        3: evaluateTileScore(player, 2),
        4: evaluateTileScore(player, 3),
        5: evaluateTileScore(player, 4)
    };
    scores.netTotal = sum(Object.values(scores));
    scores.roundTotal = scores.netTotal - scores.past;
    scoreMemo[player.id] = scores;
    return scores;
}

let bonusMemo = {};
export function getPlayerBonuses(player) {
    if (bonusMemo[player.id] && player.id !== context.actingPlayerId) return bonusMemo[player.id];
    const grid = (r, c) => player.grid[r][c] || 
        (player.rows[r]?.count === r + 1 && player.rows[r]?.tile === GAME_GRID[r][c]);
    const bonuses = {
        row: Array.from({length: 5}, (_,r) => Array.from({length: 5}, (_,c) => grid(r,c)).every(t => t)).filter(t => t).length,
        col: Array.from({length: 5}, (_,c) => Array.from({length: 5}, (_,r) => grid(r,c)).every(t => t)).filter(t => t).length,
        set: Array.from({length: 5}, (_,s) => Array.from({length: 5}, (_,i) => grid(i,(4-i+s)%5)).every(t => t)).filter(t => t).length
    };
    bonusMemo[player.id] = bonuses;
    return bonuses;
}

export function startGame() {
    context.players = context.players.map((p,i) => ({
        id: i,
        color: p.color,
        name: p.name.trim() || 'no-name nelly',
        rows: [null, null, null, null, null],
        grid: Array.from({length: 5}, () => Array.from({length: 5}, () => false)),
        penalty: [],
        pastRoundScore: 0
    }));
    context.gameOver = false;
    context.actingPlayerId = 0;
    context.winningPlayerIds = new Set();
    context.gameStarted = true;
    context.selectedFactoryAndTile = null;
    context.nextRoundStartPlayerId = null;
    scoreMemo = {};
    bonusMemo = {};
    resetFactories();
    context.rerender();
}

export function resetFactories() {
    context.factories = Array.from({length: context.players.length * 2 + 1}, () => {
        const factory = {};
        Array.from({length: 4}, () => Math.floor(Math.random() * 5) + 1).forEach(v => factory[v] = factory[v] ? factory[v] + 1 : 1)
        return factory;
    });
    context.floor = {[-1]: 1};
}

export function rowFeasible(player, row) { // uses row 5 for penalty
    return player.id === context.actingPlayerId 
        && context.selectedFactoryAndTile 
        && (
            row === 5 
            || (
                !player.grid[row][GAME_GRID[row].indexOf(context.selectedFactoryAndTile.tile)]
                && (
                    player.rows[row] === null 
                    || (
                        player.rows[row].tile === context.selectedFactoryAndTile.tile 
                        && player.rows[row].count < row + 1))));
}

function getSelectedFactory() {
    return context.selectedFactoryAndTile.factory === -1 ? context.floor 
        : context.factories[context.selectedFactoryAndTile.factory];
}

function getSelectedCount() {
    return getSelectedFactory()[context.selectedFactoryAndTile.tile];
}

export function handleGameClick(e) {
    if (e.target.matches('.tile-collection > .tile:not(.tile--1)')) {
        const tile = +e.target.dataset.tile;
        const factory = +e.target.parentElement.dataset.factory;
        context.selectedFactoryAndTile = {factory, tile}; // uses factory -1 for floor
        context.rerender();
    } else if (e.target.matches('.player-area > .tile')) {
        if (+e.target.dataset.player !== context.actingPlayerId) return;
        const row = +e.target.dataset.row; // uses row 5 for penalty
        const player = context.players[context.actingPlayerId];
        if (!rowFeasible(player, row)) return;
        const factory = getSelectedFactory();
        const count = getSelectedCount();
        // remove from factory
        factory[context.selectedFactoryAndTile.tile] = 0;
        // handle -1 tile
        if (context.selectedFactoryAndTile.factory === -1 && context.floor[-1]) {
            context.floor[-1] = false;
            context.nextRoundStartPlayerId = player.id;
            player.penalty.push(-1);
        }
        // place in penalty or row
        const tile = context.selectedFactoryAndTile.tile;
        if (row === 5) {
            player.penalty.push(...Array.from({length: Math.min(7 - player.penalty.length, count)}, () => tile));
        } else {
            const already = player.rows[row]?.count ?? 0;
            const capacity = row + 1;
            const freeSpace = capacity - already;
            const goingIn = Math.min(freeSpace, count);
            const remainder = count - goingIn;
            player.rows[row] = {tile, count: already + goingIn};
            player.penalty.push(...Array.from({length: Math.min(7 - player.penalty.length, remainder)}, () => tile));
        }
        // move rest of factory to floor
        if (context.selectedFactoryAndTile.factory !== -1) {
            for (const factoryTile in factory) {
                if (factoryTile === tile) continue;
                context.floor[factoryTile] = (context.floor[factoryTile] ?? 0) + factory[factoryTile];
            }
            context.factories[context.selectedFactoryAndTile.factory] = {};
        }
        // continue
        nextTurn();
        context.rerender();
    }
}

export function handleGameHover(e) {
    const subject = document.querySelector('.feasible:hover');
    Array.from(document.getElementsByClassName('glow-tile')).forEach(c => c.classList.remove('glow-tile'));
    if (!context.selectedFactoryAndTile || !subject) return;
    let count = getSelectedCount();
    const row = +subject.dataset.row; // uses row 5 for penalty
    if (row === 5) {
        if (context.selectedFactoryAndTile.factory === -1 && context.floor[-1]) count++; // -1 tile
        const freePenaltyTiles = document.querySelectorAll('.acting-player > .penalty.tile-0');
        for (let i = 0; i < count; i++) {
            const penaltyTile = freePenaltyTiles[i];
            if (!penaltyTile) break;
            penaltyTile.classList.add('glow-tile');
        }
    } else {
        const player = context.players[context.actingPlayerId];
        const already = player.rows[row]?.count ?? 0;
        const capacity = row + 1;
        const freeSpace = capacity - already;
        const goingIn = Math.min(freeSpace, count);
        let remainder = count - goingIn;
        if (context.selectedFactoryAndTile.factory === -1 && context.floor[-1]) remainder++; // -1 tile
        const freeRowTiles = document.querySelectorAll(`.acting-player > .row-${row}.tile-0`);
        for (let i = 0; i < goingIn; i++) {
            freeRowTiles[i].classList.add('glow-tile');
        }
        const freePenaltyTiles = document.querySelectorAll('.acting-player > .penalty.tile-0');
        for (let i = 0; i < remainder; i++) {
            const penaltyTile = freePenaltyTiles[i];
            if (!penaltyTile) break;
            penaltyTile.classList.add('glow-tile');
        }
    }
}

function nextTurn() {
    context.selectedFactoryAndTile = null;
    getPlayerScores(context.players[context.actingPlayerId]);
    if (context.factories.every(f => !Object.keys(f).length)
        && Object.keys(context.floor).every(k => !context.floor[k])) { // end of round
        // fix player rows & grid, identify next starting player
        let gameEnding = false;
        context.players.forEach(player => {
            const scores = getPlayerScores(player);
            player.pastRoundScore = scores.netTotal - scores.bonus;
            if (player.penalty.includes(-1)) context.actingPlayerId = player.id;
            player.penalty = [];
            player.rows.forEach((row, rowId) => {
                if (row?.count === rowId + 1) {
                    player.grid[rowId][GAME_GRID[rowId].indexOf(row.tile)] = true;
                    player.rows[rowId] = null;
                }
            });
            if (bonusMemo[player.id].row) gameEnding = true;
        });
        if (gameEnding) {
            context.gameOver = true;
            const maxScore = Math.max(...Object.values(scoreMemo).map(m => m.netTotal));
            context.winningPlayerIds = new Set(Object.keys(scoreMemo).filter(m => scoreMemo[m].netTotal === maxScore).map(i => +i));
            context.actingPlayerId = -1;
        } else {
            resetFactories();
        }
        scoreMemo = {};
    } else {
        context.actingPlayerId = (context.actingPlayerId + 1) % context.players.length;
    }
}