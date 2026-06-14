import context from "@/context.js";
import { awaitRequest, prepareRequest } from "./request.js";
import markdownToFRUIT from "@/utils/markdown.js";
import Icons from "@/components/Icons.js";
import Teams from "@/data/Teams.js";
/** @import { Markdown, param } from "@/types.js" */

/**
 * Transmit a message on the client-side terminal.
 * @param options
 * @param {Markdown} options.body
 * @param {Array.<{icon: string, name: string, response: param, teamId?: number}>?} options.responses
 * @param {boolean} options.isTemporary
 * @param {boolean} options.isEllipsis
 * @param {boolean} options.indented
 */
export function broadcast({body, responses = undefined, isTemporary = false, isEllipsis = false, indented = true}) {
    if (!context.misc.transmissions) context.misc.transmissions = [];
    const roles = context.game.actingRoles;
    const children = markdownToFRUIT([
        ...(roles ? ['[', roles, '] '] : []),
        ...(Array.isArray(body) ? body : [body])
    ]);
    const transmission = {
        class: {'transmission': true, 'temporary': isTemporary, 'ellipsis': isEllipsis, 'padded-left': indented},
        children: [
            {tag: 'p', children: children},
            ...(responses ? [{class: 'flex gap wrap flex-end', children: responses.map(r => ({
                tag: 'button', class: 'subtle-button flex center gap', children: [Icons[r.icon], r.name], on: {
                    click() {
                        context.game.request.resolve?.(r.response);
                    }
                }, style: r.teamId ? {'--text': `var(--tx-team-${Teams[r.teamId].name})`, color: `var(--tx-team-${Teams[r.teamId].name}`} : undefined
            }))}] : [])
        ]
    };
    if (isEllipsis) context.misc.transmissions.push({render: () => transmission, memo: () => false });
    else context.misc.transmissions.push(transmission);
    context.rerender();
    document.getElementById('terminal').scrollTo({top: 99999, behavior: 'smooth'});
}

export function broadcastEllipsis() {
    broadcast({body: 'Waiting', isTemporary: true, isEllipsis: true, indented: false});
}

/**
 * Transmit a message & await an "OK"
 * @param {Markdown} body
 * @param {boolean} isTemporary (false by default)
 * @param {boolean} isBeginningOfSequence
 */
export async function broadcastAndAwaitOK(body, isTemporary = false, isBeginningOfSequence = false) {
    if (context.side === "SERVER") return;
    prepareRequest();
    broadcast({body, isTemporary, responses: [{icon: 'check', name: 'OK', response: null}], indented: !isBeginningOfSequence});
    return await awaitRequest();
}

/**
 * 
 * @param {Markdown} body 
 * @param {Array.<{icon: string, name: string, response: param, teamId?: number}>} responses 
 * @param {boolean} isTemporary 
 * @returns {Promise<param>}
 */
export async function broadcastAndAwaitDecision(body, responses, isTemporary = false) {
    if (context.side === "SERVER") return;
    prepareRequest();
    broadcast({body, isTemporary, responses});
    return await awaitRequest();
}

/**
 * @param {number} cardId 
 */
export function handleCardClick(cardId) {
    const card = context.game.cards[cardId];
    if (context.game.request?.controlType === "CARD" && context.game.request?.predicate?.(card))
        context.game.request.resolve(card);
    else if (context.game.request?.controlType === "PLAYER")
        handlePlayerClick(card.atNow.owner.id);
}

/**
 * @param {number?} artifactIndex
 */
export function handleArtifactClick(artifactIndex) {
    if (artifactIndex === null) return;
    const artifact = context.game.center.artifacts[artifactIndex];
    if (context.game.request?.controlType === "ARTIFACT" && context.game.request?.predicate?.(artifact))
        context.game.request.resolve(artifact);
    else if (context.game.request?.controlType === "PLAYER")
        handlePlayerClick(artifact.ownerId);
}

/**
 * @param {number} playerId
 */
export function handlePlayerClick(playerId) {
    if (playerId === -1) return;
    const player = context.game.players[playerId];
    if (context.game.request?.controlType === "PLAYER" && context.game.request?.predicate?.(player))
        context.game.request.resolve(player);
}