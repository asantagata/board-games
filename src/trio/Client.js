import { getCardDistribution } from "./utils.js";
import SVGs from "./SVGs.js";

function Radio(getVal, min, max, onChange) {
    return {
        class: 'radio gap',
        children: Array.from({length: max - min}, (_,i) => min + i).map(i => ({
            class: {'radio-option': true, center: true, 'selected': i === getVal()}, 
            children: i,
            on: {click() {
                onChange(i);
            }}
        }))
    };
}

function Setup() {
    return {
        class: 'setup-wrapper',
        children: {
            class: 'setup gap col',
            key: 'setup',
            children: [
                {
                    children: [
                        {tag: 'h2', children: 'Seed'},
                        {tag: 'input', type: 'text', class: 'fullwidth', value: this.state.seed, on: {change() {
                            this.state.seed = this.target.value;
                        }}}
                    ]
                },
                {
                    children: [
                        {tag: 'h2', children: '# Players'},
                        Radio(() => this.state.nPlayers, 2, 7, (nv) => {
                            this.state.nPlayers = nv;
                            this.state.playerId = Math.min(this.state.nPlayers - 1, this.state.playerId);
                            this.rerender();
                        })
                    ]
                },
                {
                    children: [
                        {tag: 'h2', children: 'I am player #...'},
                        Radio(() => this.state.playerId + 1, 1, this.state.nPlayers + 1, (nv) => {
                            this.state.playerId = nv - 1;
                            this.rerender();
                        })
                    ]
                },
                {
                    tag: 'button', children: 'Start', on: {click() {
                        this.state.settingUp = false;
                        this.state.cards = getCardDistribution(this.state.nPlayers, this.state.seed, {state: 'face-up'})[this.state.playerId];
                        this.rerender();
                    }}
                }
            ]
        }
    };
}

function Game() {
    return {
        class: 'center gap col fullheight', children: [
            {
                key: 'cardlist',
                class: 'card-list client-card-list center',
                children: this.state.cards.map(card => ({
                    class: {card: true, 'client-card': true, 'face-up': card.state === 'face-up', 'face-down': card.state === 'face-down'},
                    children: [
                        {class: 'face front-face', children: card.card, style: {'--c': `var(--c-${card.card})`}},
                        {class: 'face back-face', children: '?', style: {'--c': 'var(--c-back)'}},
                    ],
                    on: {
                        click() {
                            card.state = card.state === 'face-up' ? 'face-down' : 'face-up';
                            this.rerender();
                        }
                    }
                }))
            },
            {
                key: 'return',
                tag: 'button',
                class: 'return-button',
                children: 'New game',
                on: {click() {
                    this.state.settingUp = true;
                    this.rerender();
                }}
            }
        ]
    };
}

const Client = {
    state() {
        return {
            settingUp: true,
            nPlayers: 2,
            seed: '',
            playerId: 0,
            cards: []
        };
    },
    render() {
        return this.state.settingUp ? Setup.call(this) : Game.call(this);
    }
};

export default Client;