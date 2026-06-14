import context from "@/context.js";
/** @import { Card, Artifact, Player } from "@/types.js" */

export function awaitRequest() {
    const promise = new Promise((res) => {
        context.game.request.resolve = (input) => {
            context.game.request.controlType = null;
            context.game.request.predicate = null;
            res(input);
        };
    });
    return promise;
}

/**
 * @param {Object} options
 * @param {("CARD" | "ARTIFACT" | "PLAYER")?} options.controlType The control type
 * @param {((cap: Card | Artifact | Player) => boolean)?} options.predicate The predicate
 */
export function prepareRequest({ controlType, predicate } = {}) {
    context.game.request = {
        resolve: () => null,
        controlType: controlType ?? null,
        predicate: predicate ?? null,
    };
}