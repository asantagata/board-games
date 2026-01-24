import { golems } from "../utils/data.js";
import { spreadGems } from "../utils/game.js";
import SVGs from "./SVGs.js";

export default function GolemCard(id, index = 0, count = 1) {
    const golem = golems[id];

    return {
        class: 'card golem-card',
        style: {
            '--color-1': golem.cost.y ? 'var(--y)' : golem.cost.g ? 'var(--g)' : golem.cost.b ? 'var(--b)' : 'var(--p)',
            '--color-2': golem.cost.g ? 'var(--g)' : golem.cost.y ? 'var(--y)' : golem.cost.b ? 'var(--b)' : 'var(--p)',
            '--color-3': golem.cost.b ? 'var(--b)' : golem.cost.p ? 'var(--p)' : golem.cost.g ? 'var(--g)' : 'var(--y)',
            '--color-4': golem.cost.p ? 'var(--p)' : golem.cost.b ? 'var(--b)' : golem.cost.g ? 'var(--g)' : 'var(--y)',
            '--index': index,
            '--count': count
        },
        children: [
            {
                class: 'card-ribbon',
                innerHTML: spreadGems(golem.cost).map(SVGs.gem).join('')
            },
            {
                class: 'golem-card-value',
                children: golem.value
            }
        ]
    };
}