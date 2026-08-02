import $ from "@/$.js";
/** @import { RequestType } from "@/types.js" */

/**
 * 
 * @param {RequestType | null} requestType 
 * @param {Building | Quest | Intrigue | string | number | boolean | null} entity 
 */
export function handleClick(requestType, entity) {
    if (!requestType) return false;
    if (requestType === "OPTION") {
        $.request.resolve(entity);
        return true;
    }
    if ($.request?.types?.includes(requestType)) {
        if (!$.request?.predicate || typeof entity !== "object" || $.request.predicate(entity)) {
            $.request.resolve(entity);
            return true;
        }
    }
    return false;
}