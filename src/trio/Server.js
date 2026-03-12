import { getSeed, getCardDistribution } from "./utils.js";
import SVGs from "./SVGs.js";

function Setup() {
    return {
        class: 'setup-wrapper',
        children: {
            class: 'setup gap col',
            key: 'setup',
            children: [
                {key: 'seednotif', id: 'seednotif', class: {vis: this.state.showingSeedNotif >= 0, gap: true, center: true}, children: [{class: 'icon', innerHTML: SVGs.check}, 'Copied']},
                {key: 'pl', children: [
                    {tag: 'h2', children: 'Players'},
                    {class: 'gap col', children: this.state.players.map(p => ({
                        class: 'center gap',
                        key: `player-${p.id}`,
                        children: [
                            {tag: 'input', type: 'text', autocomplete: 'false', placeholder: 'no-name nelly', on: {change() {
                                p.name = this.target.value;
                            }}},
                            {class: 'gap', children: Array.from({length: 6}, (_, c) => ({
                                class: {'swatch': true, 'selected': p.color === c},
                                style: {background: `var(--pc-${c})`},
                                on: {click() {
                                    if (p.color === c) return;
                                    const otherP = this.state.players.find(o => o.color === c);
                                    const currentC = p.color;
                                    p.color = c;
                                    if (otherP) otherP.color = currentC;
                                    this.rerender();
                                }}
                            }))},
                            ...(this.state.players.length > 2 ? [{
                                class: 'icon-button', innerHTML: SVGs.x, on: {click() {
                                    this.state.players = this.state.players.filter(s => s !== p);
                                    this.rerender();
                                }}
                            }] : [])
                        ]
                    }))}
                ]},
                ...(this.state.players.length === 6 ? [] : [{
                    key: 'add', tag: 'button', children: '+ Add player', on: {click() {
                        const newColor = Array.from({length: 6}, (_, i) => i).find(i => !this.state.players.some(op => op.color === i));
                        this.state.players.push({color: newColor, name: '', id: this.state.playerId++});
                        this.rerender();
                    }}
                }]),
                {
                    key: 'seed', children: [
                        {tag: 'h2', children: 'Seed'},
                        {tag: 'input', class: 'fullwidth', type: 'text', autocomplete: false, binding: 'seed', value: this.state.seed, on: {
                            change() {
                                this.state.seed = this.target.value;
                            }
                        }},
                        {tag: 'h2', class: 'text-right', children: [
                            {tag: 'u', children: 'Generate', on: {
                                click() {
                                    this.state.seed = getSeed();
                                    this.bindings.seed.element.value = this.state.seed;
                                }
                            }},
                            ' • ',
                            {tag: 'u', children: 'Copy', on: {
                                click() {
                                    navigator.clipboard.writeText(this.state.seed);
                                    const now = Date.now();
                                    this.setState.showingSeedNotif(now);
                                    window.setTimeout(() => {
                                        if (this.state.showingSeedNotif === now) {
                                            this.setState.showingSeedNotif(-1);
                                        }
                                    }, 600);
                                }
                            }}
                        ]}
                    ]
                },
                {
                    key: 'start', tag: 'button', children: 'Start', on: {click() {
                        this.state.players = this.state.players.map((p, i) => ({...p, id: i, name: p.name.trim() || 'no-name nelly'}));
                        this.state.cards = getCardDistribution(this.state.players.length, this.state.seed, {state: 'face-down'});
                        this.state.badgeOwners = Object.fromEntries(Array.from({length: 12}, (_,i) => [i + 1, -1]));
                        this.state.activePlayerId = 0;
                        this.state.winnerIds = [];
                        this.setState.settingUp(false);
                    }}
                }
            ]
        }
    };
}

function Game() {
    return {class: 'game', children: [
        {class: 'table center', key: 't', children: {
            class: 'card-list table-cards center',
            style: {'--rowsize': [0,0,4,3,4,3,3][this.state.players.length]},
            children: this.state.cards.table.map(Card)
        }},
        {class: 'player-list gap col', binding: 'player-list', key: 'pa',
            children: this.state.players.map(p => ({
                class: {'player-area': true, gap: true, col: true, active: p.id === this.state.activePlayerId}, 
                style: {'--pc': `var(--pc-${p.color})`},
                children: [
                    {
                        class: 'player-header', children: [
                            {class: 'player-name', children: 
                                `${this.state.winnerIds.includes(p.id) ? `${p.name} • winner!` : p.name} (${Object.values(this.state.badgeOwners).filter(o => o === p.id).length})`
                            },
                            {class: 'player-badges', children: Array.from({length: 12}, (_,i) => ({
                                class: {
                                    badge: true, 
                                    owned: this.state.badgeOwners[i+1] === p.id,
                                    available: this.state.badgeOwners[i+1] === -1
                                },
                                style: {
                                    '--c': `var(--c-${i+1})`
                                },
                                children: i + 1,
                                on: {click() {
                                    this.state.badgeOwners[i+1] = p.id;
                                    Object.values(this.state.cards).forEach(list => {
                                        list.forEach(c => {
                                            if (c.card === i+1) {
                                                c.state = 'claimed'
                                            }
                                        });
                                    });
                                    if (Object.values(this.state.badgeOwners).every(i => i > -1)) {
                                        const winsByPlayer = Array.from(
                                            {length: this.state.players.length},
                                            (_,i) => Object.values(this.state.badgeOwners).filter(o => o === i).length
                                        );
                                        const maxWins = Math.max(...winsByPlayer);
                                        this.state.winnerIds = Object.entries(winsByPlayer).filter(([_,wins]) => wins === maxWins).map(([i,_]) => +i);
                                        Object.values(this.state.cards).forEach(list => {
                                            list.forEach(c => {
                                                c.state = 'face-up'
                                            });
                                        });
                                    }
                                    this.rerender();
                                }}
                            }))}
                        ]
                    },
                    {
                        class: 'player-hand card-list', children: this.state.cards[p.id].map(Card)
                    },
                    ...(p.id === this.state.activePlayerId && this.state.winnerIds.length === 0 ? [{
                        class: 'next-button', children: {
                            tag: 'svg', xmlns: 'http://www.w3.org/2000/svg', width: 24, height: 24, viewBox: '0 0 24 24', 'stroke-width': 2, fill: 'none', stroke: 'currentColor', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', children: {tag: 'path', xmlns: 'http://www.w3.org/2000/svg', d: 'm6 9 6 6 6-6'}
                        }, on: {click() {
                            this.state.activePlayerId = (this.state.activePlayerId + 1) % this.state.players.length;
                            Object.values(this.state.cards).forEach(list => {
                                list.forEach(c => {
                                    if (c.state === 'face-up')
                                        c.state = 'face-down'
                                });
                            });
                            this.bindings['player-list'].element.children[this.state.activePlayerId].scrollIntoView({block: 'center', behavior: 'smooth'});
                            this.rerender();
                        }}
                    }] : [])
                ]
            }))
        },
        ...(this.state.winnerIds.length === 0 ? [] : [
            {class: 'newgame-button', key: 'ng', children: 'New game', on: {click() {
                this.state.settingUp = true;
                this.state.seed = getSeed();
                this.rerender();
            }}}
        ])
    ]};
}

function Card(card) {
    return {
        class: {card: true, 'face-up': card.state === 'face-up', 'face-down': card.state === 'face-down', claimed: card.state === 'claimed'},
        on: {click() {
            if (card.state === 'face-down' && this.target.matches(
                `.player-hand > .card:not(.face-down) + .card.face-down,
                .player-hand > .card.face-down:first-child,
                .player-hand > .card.face-down:has(+ .card:not(.face-down)),
                .player-hand > .card.face-down:last-child,
                .table-cards > .card.face-down`
            )) {
                card.state = 'face-up';
                this.rerender();
            }
        }},
        children: [
            {class: 'face front-face', children: card.card, style: {'--c': `var(--c-${card.card})`}},
            {class: 'face back-face', children: '?', style: {'--c': 'var(--c-back)'}},
        ]
    };
}

const Server = {
    state() {
        return {
            settingUp: true,
            players: [
                {id: 0, color: 0, name: ''},
                {id: 1, color: 1, name: ''}
            ],
            playerId: 2,
            seed: getSeed(),
            showingSeedNotif: -1,
            cards: null,
            badgeOwners: null,
            activePlayerId: -1,
            winnerIds: []
        };
    },
    render() {
        return this.state.settingUp ? Setup.call(this) : Game.call(this);
    }
};

export default Server;