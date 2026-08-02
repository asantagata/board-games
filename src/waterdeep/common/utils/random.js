import $ from "@/$.js";

export function getRandomSeed() {
    const CHARS = "?ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789";
    return Array.from({length: 5}, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

export function seededShuffle(array, seed = $.config.seed) {
    let hash = 0, final = [];
    for (const char of seed) {
        hash = (hash << 5) - hash + char.charCodeAt(0);
        hash |= 0;
    }
    for (let i = array.length; i > 0; i--) {
        final.push(array.splice(hash % i, 1)[0]);
        hash -= i;
    }
    return final;
}

export function unseededShuffle(array) {
    array = [...array];
    for (let i = array.length - 1; i >= 0; i--) {
        let j = Math.floor(Math.random() * i);
        let temp = array[i];
        array.splice(i, 1, array[j]);
        array.splice(j, 1, temp);
    }
    return array;
}

export function getRandomConfirmationString(index) {
    const CHARS = "?ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789";
    const seed = $.config.seed;
    const nPlayers = $.config.players.length;
    const skull = $.config.skullport;
    let hash = 0;
    for (const char of seed) {
        hash = (hash << 3) - hash + char.charCodeAt(0);
        hash |= 0;
    }
    hash = Math.floor((hash - index * 17) * 0.2 * (index + 1) / (nPlayers - 1));
    if (skull) hash *= (nPlayers - index * 13);
    hash = Math.abs(hash);
    let str = '';
    for (let i = 0; i < 3; i++) {
        str += CHARS[hash % CHARS.length];
        hash = Math.floor(hash / CHARS.length);
    }
    return str;
}