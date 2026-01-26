import context from "./context.js";
import { playerStartGems, phases, merchants, golems } from "./data.js";

function getEmptyGems() { return {y: 0, g: 0, b: 0, p: 0}; }

function shuffleRange(start, end) {
    const range = Array.from({length: end - start + 1}, (v, k) => k + start);
    for (let i = range.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * i);
        const temp = range[i];
        range.splice(i, 1, range[j]);
        range.splice(j, 1, temp);
    }
    return range;
}

function getTurnStartStanding() {
    return window.structuredClone({
        players: context.players,
        merchantRow: context.merchantRow,
        merchantDeck: context.merchantDeck,
        golemRow: context.golemRow,
        golemDeck: context.golemDeck,
        details: undefined
    });
}

export function setupGame() {
    context.gameStarted = true;
    context.players = context.players.map((player, index) => ({
        playerId: index, name: player.name.trim() || 'no-name nelly', color: player.color,
        gems: {...playerStartGems[index]}, freeCards: [0, 1], usedCards: [],
        nGolems: 0, score: 0
    }));
    const entireMerchantDeck = shuffleRange(2, 44);
    context.merchantRow = entireMerchantDeck.slice(0, 6).map(cardId => ({gems: getEmptyGems(), cardId}));
    context.merchantDeck = entireMerchantDeck.slice(6);
    const entireGolemDeck = shuffleRange(0, 35);
    context.golemRow = entireGolemDeck.slice(0, 5);
    context.golemDeck = entireGolemDeck.slice(5);
    context.golemThreshold = context.players.length < 3 ? 6 : 5;
    context.standing = {
        activePlayerId: 0,
        phase: phases.START,
        turnStartStanding: getTurnStartStanding(),
        details: undefined,
        lastRound: false,
        roundIndex: 1,
        gameOver: false,
        winnerIds: [],
        history: [],
        description: []
    };
    context.rerender();
}

export function spreadGems(gems) {
    return `${'y'.repeat(gems.y)}${'g'.repeat(gems.g)}${'b'.repeat(gems.b)}${'p'.repeat(gems.p)}`.split('');
}

export function gemsGreaterOrEqual(a, b) {
    return a.y >= b.y && a.g >= b.g && a.b >= b.b && a.p >= b.p;
}

export function goBack() {
    Object.assign(context, context.standing.turnStartStanding);
    context.standing.turnStartStanding = getTurnStartStanding();
    context.standing.phase = phases.START;
}

export function rest() {
    context.standing.description = (a, m, g) => ({path: [a, `'s turn / `], question: ['Rest']});
    const activePlayer = context.players[context.standing.activePlayerId];
    activePlayer.freeCards = [...activePlayer.freeCards, ...activePlayer.usedCards];
    activePlayer.usedCards = [];
    endPlayerTurn();
}

export function playMerchant(cardId, repeat = false) {
    const activePlayer = context.players[context.standing.activePlayerId];
    if (!repeat) {
        activePlayer.freeCards = activePlayer.freeCards.filter(c => c !== cardId);
        activePlayer.usedCards.push(cardId);
    }
    const merchant = merchants[cardId];
    context.standing.description = (a, m, g) => ({path: [a, `'s turn / playing merchant / `], question: ['Played merchant ', m(cardId)]});
    if (merchant.type === 'upgrade') {
        context.standing.phase = phases.DOING_UPGRADE;
        context.standing.details = {upgradeIndex: 0, upgradeCount: merchant.upgrades};
    } else {
        applyGemChange(activePlayer.gems, merchant.from, -1);
        applyGemChange(activePlayer.gems, merchant.to);
        if (gemsGreaterOrEqual(activePlayer.gems, merchant.from) && merchant.from.y + merchant.from.g + merchant.from.b + merchant.from.p > 0) {
            context.standing.phase = phases.REPEATING_TRADE;
            context.standing.details = {cardId};
        } else endPlayerTurn();
    }
}

function applyGemChange(collection, change, sign = 1) {
    collection.y = collection.y + change.y * sign;
    collection.g = collection.g + change.g * sign;
    collection.b = collection.b + change.b * sign;
    collection.p = collection.p + change.p * sign;
}

export function upgradeGem(gem) {
    const activePlayer = context.players[context.standing.activePlayerId];
    activePlayer.gems[gem]--;
    activePlayer.gems[{y: 'g', g: 'b', b: 'p'}[gem]]++;
    context.standing.details.upgradeIndex++;
    if (context.standing.details.upgradeIndex === context.standing.details.upgradeCount)
        endPlayerTurn();
}

export function payGem(gem) {
    context.players[context.standing.activePlayerId].gems[gem]--;
    context.merchantRow[context.standing.details.paid ?? 0].gems[gem]++;
    context.standing.details.paid++;
}

export function acquireMerchant() {
    const activePlayer = context.players[context.standing.activePlayerId];
    const [{cardId, gems}] = context.merchantRow.splice(context.standing.details.paid, 1);
    activePlayer.freeCards.push(cardId);
    context.standing.description = (a, m, g) => ({path: [a, `'s turn / acquiring merchant / `], question: ['Acquired merchant ', m(cardId)]});
    applyGemChange(activePlayer.gems, gems);
    endPlayerTurn();
}

export function acquireGolem(golemId) {
    const index = context.golemRow.findIndex(i => i === golemId);
    context.golemRow = context.golemRow.filter(i => i !== golemId);
    const activePlayer = context.players[context.standing.activePlayerId];
    const golem = golems[golemId];
    context.standing.description = (a, m, g) => ({path: [a, `'s turn / acquiring golem / `], question: ['Acquired golem ', g(golemId, index)]});
    applyGemChange(activePlayer.gems, golem.cost, -1);
    activePlayer.nGolems++;
    activePlayer.score += golem.value;
    if (index === 0) activePlayer.score += 3;
    else if (index === 1) activePlayer.score += 1;
    endPlayerTurn();
}

export function endPlayerTurn() {
    const activePlayer = context.players[context.standing.activePlayerId];
    if (spreadGems(activePlayer.gems).length > 10) {
        context.standing.phase = phases.RECONCILING_OVERFLOW;
    } else {
        nextTurn();
    }
}

function nextTurn() {
    // refill rows
    if (context.merchantRow.length < 6 && context.merchantDeck.length > 0) {
        context.merchantRow.push({cardId: context.merchantDeck.shift(), gems: getEmptyGems()});
    }

    if (context.golemRow.length < 5) {
        context.golemRow.push(context.golemDeck.shift());
    }

    const {history, ...restOfStanding} = context.standing;
    context.standing.history.push({...restOfStanding});

    const activePlayer = context.players[context.standing.activePlayerId];
    if (activePlayer.nGolems === context.golemThreshold)
        context.standing.lastRound = true;

    if (context.standing.activePlayerId === context.players.length - 1) {
        if (context.standing.lastRound) {
            context.standing.phase = phases.GAME_OVER;
            context.standing.gameOver = true;
            context.players.forEach(p => p.score += p.gems.g + p.gems.b + p.gems.p);
            const maxScore = Math.max(...context.players.map(p => p.score));
            const winners = context.players.filter(p => p.score === maxScore);
            context.standing.winnerIds = winners.map(p => p.playerId);
            return;
        } else {
            context.standing.roundIndex++;
        }
    }

    context.standing.activePlayerId = (context.standing.activePlayerId + 1) % context.players.length;
    context.standing.turnStartStanding = getTurnStartStanding();
    context.standing.phase = phases.START;
    context.standing.details = undefined;
}

export function revertTo(historyEntry, index) {
    const historyToBe = context.standing.history.slice(0, index);
    Object.assign(context, historyEntry.turnStartStanding);
    Object.assign(context.standing, historyEntry);
    context.standing.turnStartStanding = getTurnStartStanding();
    context.standing.phase = phases.START;
    context.standing.history = historyToBe;
    context.rerender();
}