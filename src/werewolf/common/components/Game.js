import context from "@/context.js";
import { handleCardClick, handleArtifactClick, handlePlayerClick } from "@client/controls.js";
import Roles, { RoleIDs } from "@/data/Roles.js";
import Teams, { TeamIDs } from "@/data/Teams.js";
import Artifact from "./Artifact.js";
import Card from "./Card.js";
import Icons from "./Icons.js";
import Artifacts from "@/data/Artifacts.js";
import { openModal } from "./Modal.js";
/** @import { Center, Player, Card, Pip } from "@/types.js" */

/**
 * Player area component
 * @param {Center | Player} owner 
 * @returns {Object}
 */
function OwnerArea(owner) {
    context.misc.gameHasCurator = context.misc.gameHasCurator ?? context.game.cards.some(c => c.role.id === RoleIDs.CURATOR);
    context.misc.gameHasAlpha = context.misc.gameHasAlpha ?? context.game.cards.some(c => c.role.id === RoleIDs.ALPHA_WOLF);
    const cards = Array.from({length: owner.cards.length}, (_,i) => ({class: {'placeholder-card': true, 'placeholder': true, 'feasible': context.game.request.controlType === "CARD" && (context.game.request.predicate?.(owner.cards[i]) ?? true)}, id: `owner${owner.id}card${i}`}));
    if (context.misc.gameHasAlpha && owner.id === -1)
        cards.splice(1, 0, {tag: 'hr'});
    if (owner === context.misc.selectedPlayer) {
        context.misc.ownerAreaRefs[owner.id].scrollIntoView({block: 'center', behavior: 'smooth'});
        context.misc.ownerAreaRefs[owner.id].style.animation = '';
        window.setTimeout(() => context.misc.ownerAreaRefs[owner.id].style.animation = 'select-player 0.2s ease-in-out', 20);
    }
    return {
        style: {
            '--tx': `var(--${owner.color ?? 'text'})`,
            '--bg': owner.color ? `color-mix(in oklab, var(--${owner.color}) 15%, transparent 100%)` : 'var(--back)',
        },
        key: `${owner.id}`, on: {click() { if (owner.id !== -1) handlePlayerClick(owner.id); }, mount() {
            if (context.side === "CLIENT") return;
            if (!context.misc.ownerAreaRefs) context.misc.ownerAreaRefs = {};
            context.misc.ownerAreaRefs[owner.id] = this.target;
        }},
        class: {
            'owner-area': true, 'center-area': owner.id === -1, 
            feasible: (owner.id !== -1 && context.game.request.controlType === "PLAYER" && (context.game.request.predicate?.(owner) ?? true)),
            hover: context.game.request.controlType === "PLAYER" && owner.id === context.misc.hoveredPlayerId
        },
        children: [
            {tag: 'fieldset', children: [
                {tag: 'legend', class: 'flex center gap', children: [
                    {tag: 'b', class: 'nowrap', children: owner.name ?? 'Center'},
                    ...(
                        context.misc.gameHasCurator ? [{
                            class: 'flex center gap',
                            children: Array.from({length: owner.id === -1 ? owner.artifacts.length : 1}, (_,i) => ({class: {'placeholder-artifact': true, 'placeholder': true, 'feasible': owner.id === -1 && context.game.request.controlType === "ARTIFACT" && context.game.center.artifacts[i]}, id: `owner${owner.id}artifact${i}`}))
                        }] : []
                    ),
                    ...(context.misc.voters?.[owner.id] || []).map(v => ({...Icons.knife, style: {color: `var(--${v.color})`}})),
                    ...(context.side === "SERVER" && owner.id !== -1 && !owner.alive ? [Icons.skull] : []),
                    ...(context.misc.playerWins?.[owner.id] ? [Icons.crown] : [])
                ]},
                {class: 'flex flex-wrap gap', children: cards}
            ]}
        ]
    }
}

function posnStylesAt(descriptor, overrideCoords = null) {
    if (overrideCoords && !Object.hasOwn(overrideCoords, 'x')) {
        overrideCoords.y = context.misc.placeholderLocations[descriptor].top;
        overrideCoords.x = context.misc.placeholderLocations[descriptor].left;
    }
    return {
        position: 'absolute', 
        top: `${overrideCoords?.y ?? (context.misc.placeholderLocations[descriptor].top - context.misc.placeholderLocations.header.height)}px`, 
        left: `${overrideCoords?.x ?? context.misc.placeholderLocations[descriptor].left}px`
    };
}

function computePlaceholderLocations() {
    const header = document.getElementById('header').getBoundingClientRect();
    const headerHeight = header.height;
    context.misc.placeholderLocations = Object.fromEntries(Array.from(document.getElementsByClassName('placeholder')).map(el => {
        const rect = el.getBoundingClientRect();
        return [el.id, {
            left: rect.left,
            top: rect.top - (el.id.startsWith('pip') ? headerHeight : 0)
        }];
    }));
    context.misc.placeholderLocations.header = header;
}

function handleResize() {
    if (!(context.misc.showingGame || (context.side === "CLIENT" && context.game))) return;
    const rerendering = !context.misc.resizing;
    context.misc.resizing = true;
    const now = Date.now();
    context.misc.lastResize = now;
    window.setTimeout(() => {
        if (context.misc.lastResize === now) {
            document.body.offsetHeight;
            if (context.misc.pips) {
                context.misc.placeholderAreaRect = document.getElementById('game-placeholder-area').getBoundingClientRect();
                const pipWidth = document.querySelector('.pip').getBoundingClientRect().width + 3;
                context.misc.pips.forEach(p => {
                    p.x = Math.min(p.x, window.innerWidth - pipWidth);
                    p.y = Math.min(p.y, context.misc.placeholderAreaRect.bottom - pipWidth);
                });
            }
            recomputeGamePositions();
        }
    }, 250);
    if (rerendering) context.rerender();
}

export function recomputeGamePositions() {
    computePlaceholderLocations();
    context.misc.resizing = false;
    context.rerender();
}

window.addEventListener('resize', handleResize);

function handleCardHover() {
    if (context.game.request.controlType === "PLAYER") {
        const hoveredCard = document.querySelector('#game-overlay-area > .card:hover');
        if (hoveredCard) {
            const cardId = +hoveredCard.dataset.key?.slice(1);
            let newHoveredPlayerId = context.game.cards[cardId].atNow.owner.id;
            if (newHoveredPlayerId !== context.misc.hoveredPlayerId) {
                context.misc.hoveredPlayerId = newHoveredPlayerId;
                context.rerender();
            }
        } else {
            if (context.misc.hoveredPlayerId !== null) {
                context.misc.hoveredPlayerId = null;
                context.rerender();
            }
        }
    }
}

function PipsArea() {
    return {
        style: {
            '--tx': `var(--text)`,
            '--bg': 'var(--back)',
        },
        key: 'pips', id: 'pips-area', class: 'owner-area',
        children: {tag: 'fieldset', children: [
            {tag: 'legend', children: {tag: 'b', children: 'Pips'}},
            {class: 'flex flex-wrap gap', children: context.misc.pips.map(pip => ({class: {'placeholder-pip': true, 'placeholder': true, 'role-pip-placeholder': pip.type === "ROLE", 'artifact-pip-placeholder': pip.type === "ARTIFACT"}, id: `pip${pip.id}`}))}
        ]}
    };
}

/** @param {Pip} pip */
function Pip(pip) {
    const teamName = pip.type === "ARTIFACT" 
        ? (Teams[Artifacts[pip.itemId]?.teamId ?? TeamIDs.VILLAGE].name)
        : Roles[pip.itemId].team.name;
    return {
        key: `p${pip.id}`, style: {
            ...posnStylesAt(`pip${pip.id}`, pip),
            '--bg': `var(--bg-team-${teamName}`, 
            '--tx': `var(--tx-team-${teamName})`
        }, 
        id: `pip-${pip.id}`,
        class: {'pip': true, 'role-pip': pip.type === "ROLE", 'artifact-pip': pip.type === "ARTIFACT"},
        children: pip.type === "ARTIFACT" ? Artifacts[pip.itemId].icon : Roles[pip.itemId].icon,
        on: {
            contextmenu(e) { e.preventDefault(); openModal(`${pip.type}S`, pip.itemId); },
            mousedown() { 
                context.misc.draggingPip = pip; 
                context.misc.placeholderAreaRect = document.getElementById('game-placeholder-area').getBoundingClientRect();
                context.misc.pipRect = this.target.getBoundingClientRect();
                document.getElementById('game-area').classList.add('dragging-pip');
                if (!context.misc.pipZIndex) context.misc.pipZIndex = 10;
                this.target.style.zIndex = `${context.misc.pipZIndex++}`;
            }
        }
    }
}

export default function GameComponent() {
    const allArtifacts = context.game.cards.some(c => c.role.id === RoleIDs.CURATOR) ? [
        ...(context.game.center.artifacts?.filter(a => a).map((a, i) => ({...a, ownerId: -1})) ?? []),
        ...(context.game.players.filter(p => p.artifact).map(p => ({...p.artifact, ownerId: p.id})) ?? [])
    ].sort((a, b) => a.id - b.id) : [];
    return {
        id: 'game', class: 'fullwidth fullheight grow flex col minheight0',
        children: [
            {
                id: 'game-area', class: 'minheight0 overflow-auto', key: 'game',
                children: [
                    {
                        id: 'game-placeholder-area',
                        children: [
                            ...(context.misc.pips ? [PipsArea()] : []),
                            OwnerArea(context.game.center),
                            ...context.game.players.map(OwnerArea),
                        ]
                    },
                    {
                        id: 'game-overlay-area',
                        class: {
                            resizing: context.misc.resizing,
                            'rendering-new-phase': context.misc.renderingNewPhase
                        },
                        children: context.misc.placeholderLocations ? [
                            ...allArtifacts.map(a => Artifact(a, {style: posnStylesAt(`owner${a.ownerId}artifact${a.ownerId === -1 ? a.centerIndex : 0}`), key: `a${a.id}`, on: { click() { handleArtifactClick(a.centerIndex ?? null); } }})),
                            ...context.game.cards.map(c => Card(c, {style: posnStylesAt(`owner${c.atNow.owner.id}card${c.atNow.index}`), key: `c${c.id}`, on: { click() { handleCardClick(c.id); }, mouseenter() { handleCardHover() }, mouseleave() { handleCardHover() } }})),
                            ...(context.misc.pips?.map(Pip) ?? [])
                        ] : []
                    },
                ], on: {
                    mount() { 
                        computePlaceholderLocations();
                        context.rerender();
                    },
                    mousemove(e) {
                        if (context.side === "CLIENT" || !context.misc.draggingPip) return;
                        const pipElement = document.getElementById(`pip-${context.misc.draggingPip.id}`);
                        const x = e.clientX - context.misc.placeholderAreaRect.left - context.misc.pipRect.width / 2;
                        const y = e.clientY - context.misc.placeholderAreaRect.top - context.misc.pipRect.height / 2;
                        pipElement.style.left = `${x}px`;
                        pipElement.style.top = `${y}px`;
                        context.misc.draggingPip.x = x;
                        context.misc.draggingPip.y = y;
                    },
                    mouseup() {
                        if (context.side === "CLIENT" || !context.misc.draggingPip) return;
                        context.misc.draggingPip = null;
                        this.target.classList.remove('dragging-pip');
                    },
                    mouseleave() {
                        if (context.side === "CLIENT" || !context.misc.draggingPip) return;
                        context.misc.draggingPip = null;
                        this.target.classList.remove('dragging-pip');
                    },
                    scroll() {
                        if (context.side === "CLIENT" || !context.misc.draggingPip) return;
                        context.misc.placeholderAreaRect = document.getElementById('game-placeholder-area').getBoundingClientRect();
                    }
                }
            },
            ...(context.side === "CLIENT" || context.misc.showTerminal ? [{
                id: 'terminal-wrapper', class: 'back padded', key: 'terminal',
                children: {
                    id: 'terminal', class: 'dark padded overflow-auto fullheight',
                    children: context.misc.transmissions || []
                }
            }] : [])
        ]
    }
}