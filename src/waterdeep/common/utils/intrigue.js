import $ from "@/$.js";
import { IntrigueTypes } from "@/data/Intrigues.js";
import Intrigues from "@/data/Intrigues.js";
import Lords from "@/data/Lords.js";
import { seededShuffle } from "@/utils/random.js";

export function getIntrigueSuggestions() {
    const query = $.ui.intrigueQuery.trim();
    const regex = query ? new RegExp(`(\\W|^)${query}`, 'i') : null;
    return IntrigueTypes.filter(int => ($.config.skullport || !int.isSkullport) && (!int.feasible || int.feasible()) && (!query || regex.test(int.name))).slice(0, 5);
}

export function startRoom() {
    const lordDeck = seededShuffle(Lords.filter(l => !l.isSkullport || $.config.skullport));
    const intrigueDeck = seededShuffle(Intrigues.filter(i => !i.isSkullport || $.config.skullport));
    const intrigueDeckIndex = Math.floor(intrigueDeck.length * $.client.myId / $.config.players.length);
    $.client = {
        myId: $.client.myId,
        lord: lordDeck[$.client.myId],
        intrigueHand: [intrigueDeck[intrigueDeckIndex], intrigueDeck[(intrigueDeckIndex + 1) % intrigueDeck.length]],
        intrigueDeckIndex: (intrigueDeckIndex + 2) % intrigueDeck.length,
        intrigueDeck,
        intrigueHandAndIndexHistory: []
    };
}