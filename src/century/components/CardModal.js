import context from "../utils/context.js";
import { merchants, golems } from "../utils/data.js";
import MerchantCard from "./MerchantCard.js";
import GolemCard from "./GolemCard.js";
import SVGs from "./SVGs.js";
import { spreadGems } from "../utils/game.js";

export default function CardModal() {
    return {
        state() {
            return {
                mode: 'merchant',
                selectedCardId: null
            };
        },
        render() {
            return {
                class: 'modal-wrapper',
                id: 'card-modal-wrapper',
                on: {click(event) {
                    if (!event.target.closest('#card-modal')) {
                        context.cardModalOpen = false;
                        context.rerender();
                    }
                }},
                children: {
                    class: 'modal',
                    id: 'card-modal',
                    children: [
                        {
                            class: 'tabs',
                            key: 'tabs',
                            children: [
                                {
                                    class: {tab: true, 'selected-tab': this.state.mode === 'merchant'}, 
                                    children: '🏬', 
                                    on: {
                                        click() {
                                            this.state.mode = 'merchant';
                                            this.state.selectedCardId = null;
                                            this.rerender();
                                        }
                                    }
                                },
                                {
                                    class: {tab: true, 'selected-tab': this.state.mode === 'golem'}, 
                                    children: '🤖', 
                                    on: {
                                        click() {
                                            this.state.mode = 'golem';
                                            this.state.selectedCardId = null;
                                            this.rerender();
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            class: 'card-list',
                            key: this.state.mode,
                            children: this.state.mode === 'merchant' 
                            ? Array.from({length: 43}).map((_, i) => ({
                                ...MerchantCard(i), 
                                class: {card: true, 'merchant-card': true, 'used-card': !context.merchantDeck.includes(i)},
                                on: {
                                    mouseenter() {
                                        this.state.selectedCardId = i;
                                        this.rerender();
                                    },
                                    mouseleave() {
                                        window.setTimeout(() => {
                                            if (this.state.selectedCardId === i) {
                                                this.state.selectedCardId = null;
                                                this.rerender();
                                            }
                                        }, 50)
                                    }
                                }
                            })) 
                            : Array.from({length: 36}).map((_, i) => ({
                                ...GolemCard(i), 
                                class: {card: true, 'golem-card': true, 'used-card': !context.golemDeck.includes(i)},
                                on: {
                                    mouseenter() {
                                        this.state.selectedCardId = i;
                                        this.rerender();
                                    },
                                    mouseleave() {
                                        window.setTimeout(() => {
                                            if (this.state.selectedCardId === i) {
                                                this.state.selectedCardId = null;
                                                this.rerender();
                                            }
                                        }, 50)
                                    }
                                }
                            })) 
                        },
                        {
                            key: 'selected-card',
                            class: 'selected-card-description',
                            children: this.state.selectedCardId === null ? {
                                tag: 'h2',
                                children: 'No card selected'
                            } : [
                                {
                                    class: 'card-wrapper',
                                    children: this.state.mode === 'merchant' 
                                    ? MerchantCard(this.state.selectedCardId)
                                    : GolemCard(this.state.selectedCardId)
                                },
                                {
                                    class: 'card-description',
                                    children: this.state.mode === 'merchant'
                                    ? [
                                        {tag: 'h2', children: `Merchant card #${this.state.selectedCardId + 1}`},
                                        (() => {
                                            const merchant = merchants[this.state.selectedCardId];
                                            if (merchant.type === 'upgrade')
                                                return {
                                                    innerHTML: `Perform ${merchant.upgrades} upgrades (${SVGs.gem('y')}${SVGs.chevronRight}${SVGs.gem('g')}${SVGs.chevronRight}${SVGs.gem('b')}${SVGs.chevronRight}${SVGs.gem('p')}).`
                                                };
                                            if (merchant.from.y + merchant.from.g + merchant.from.b + merchant.from.p === 0) {
                                                return {
                                                    innerHTML: `Receive ${spreadGems(merchant.to).map(SVGs.gem).join('')}.`
                                                };
                                            }
                                            return {
                                                innerHTML: `Trade ${spreadGems(merchant.from).map(SVGs.gem).join('')} for ${spreadGems(merchant.to).map(SVGs.gem).join('')}. (Can be repeated so long as you have ${spreadGems(merchant.from).map(SVGs.gem).join('')}).`
                                            };
                                        })()
                                    ]
                                    : [
                                        {tag: 'h2', children: `Golem card #${this.state.selectedCardId + 1}`},
                                        (() => {
                                            const golem = golems[this.state.selectedCardId];
                                            return {
                                                innerHTML: `Trade ${spreadGems(golem.cost).map(SVGs.gem).join('')} for ${golem.value} points.`
                                            };
                                        })()
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
}