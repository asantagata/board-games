import context from "@/context.js";
import { openModal } from "./Modal.js";
/** @import { Role, Card } from "@/types.js" */

/**
 * A card
 * @param {Card} card 
 * @param {Object?} cardProps
 */
export default function Card(card, cardProps = {}) {
    return {
        class: {card: true, 'face-up': context.misc.showAll || card.faceUp},
        children: [
            Face(card.role, {on: {contextmenu(e) { e.preventDefault(); openModal("ROLES", card.role?.id); }}}, context.misc.showAll === true ? card.team : undefined),
            Face(card.shielded ? "SHIELDED" : "BACK")
        ], ...cardProps
    }
}

/**
 * A face of a card
 * @param {Role | "BACK" | "SHIELDED"} role 
 * @param {Object?} faceProps
 */
export function Face(role, faceProps = {}, honestTeam = undefined) {
    if (role === "BACK") return { class: 'card-face card-back-face', children: '?' };
    if (role === "SHIELDED") return { class: 'card-face card-back-face card-shielded', children: '🛡️' };
    const {class: faceClass = {}, style: faceStyle = {}, ...usableFaceProps} = faceProps;
    return {
        class: {'card-face': true, 'card-front-face': role !== "BACK" && role !== "SHIELDED", ...faceClass},
        style: {
            '--bg': `var(--bg-team-${honestTeam?.name ?? role.team.name})`, 
            '--tx': `var(--tx-team-${honestTeam?.name ?? role.team.name})`, 
            ...faceStyle},
        children: [
            {class: 'face-icon', children: role.icon},
            {class: 'face-name', innerHTML: role.displayName ?? role.name}
        ],
        ...usableFaceProps
    };
}