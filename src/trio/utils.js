export function getSeed() {
    const CHARS = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_`;
    return Array.from({length: 10}, _ => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

function hashSeed(seed) {
    let hash = 0;
    for (const char of seed) {
        hash = (hash << 5) - hash + char.charCodeAt(0);
        hash |= 0;
    }
    return hash;
};

export function getCardDistribution(nPlayers, seed, rest) {
    const fini = [];
    const init = Array.from({length: 36}, (_, i) => ({card: Math.floor(i / 3) + 1, ...rest}));
    let hash = Math.abs(hashSeed(seed));

    const counts = {
        2: {table: 12, player: 12},
        3: {table: 9, player: 9},
        4: {table: 8, player: 7},
        5: {table: 6, player: 6},
        6: {table: 6, player: 5},
    }[nPlayers];

    for (let i = 36; i > 0; i--) {
        fini.push(init.splice(hash % i, 1)[0]);
        hash -= i;
    }

    const distribution = {table: fini.splice(0, counts.table)};

    for (let i = 0; i < nPlayers; i++)
        distribution[i] = fini.splice(0, counts.player).toSorted((a,b) => a.card - b.card);

    return distribution;
}