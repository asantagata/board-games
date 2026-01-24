import { merchants } from "../utils/data.js";
import { spreadGems } from "../utils/game.js";
import SVGs from "./SVGs.js";

export default function MerchantCard(id, index = 0, count = 1) {
    const cardData = merchants[id];
    const colors = cardData.type === 'trade' ? {
        y: cardData.from.y + cardData.to.y,
        g: cardData.from.g + cardData.to.g,
        b: cardData.from.b + cardData.to.b,
        p: cardData.from.p + cardData.to.p,
    } : {y: 1, g: 1, b: 1, p: 1};
    const fromSVG = cardData.type === 'trade' ? spreadGems(cardData.from).map(SVGs.gem).join('') : '';
    const toSVG = cardData.type === 'trade' ? spreadGems(cardData.to).map(SVGs.gem).join('') : SVGs.gem('rainbow').repeat(cardData.upgrades);

    return {
        class: 'card merchant-card',
        style: {
            '--color-1': colors.y ? 'var(--y)' : colors.g ? 'var(--g)' : colors.b ? 'var(--b)' : 'var(--p)',
            '--color-2': colors.g ? 'var(--g)' : colors.y ? 'var(--y)' : colors.b ? 'var(--b)' : 'var(--p)',
            '--color-3': colors.b ? 'var(--b)' : colors.p ? 'var(--p)' : colors.g ? 'var(--g)' : 'var(--y)',
            '--color-4': colors.p ? 'var(--p)' : colors.b ? 'var(--b)' : colors.g ? 'var(--g)' : 'var(--y)',
            '--index': index,
            '--count': count
        },
        children: {
            class: 'card-ribbon',
            innerHTML: (fromSVG ? (fromSVG + SVGs.chevronDown) : '') + toSVG
        }
    };
}