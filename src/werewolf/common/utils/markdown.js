import context from "@/context.js";
import { RoleLink, ArtifactLink, TeamLink, ArticleLink } from "@/components/Links.js";
/** @import { Markdown, Artifact, Team } from "@/types.js" */

export const cardinals = new Proxy({}, {get: (_,p) => {
    switch ((+p + 1) % 100) {
        case 11: case 12: case 13: return `${+p + 1}th`;
        default: return `${+p + 1}${['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th'][p % 10]}`;
    }
}});

/**
 * Turn a Markdown entry into a FRUIT element.
 * @param {Markdown} entry 
 * @param {boolean} delimitList If the entry is an array, whether it should be delimited (commas/ampersands.) Usually, true only when recursing.
 * @param {string} delimiter If the entry is an array, a custom last-element delimeter (e.g. " or ")
 */
export default function markdownToFRUIT(entry, delimitList = false, delimiter = " & ") {
    if (typeof entry === 'function') entry = entry();
    if (typeof entry !== 'object') return entry;
    if (Array.isArray(entry)) {
        switch (entry.length) {
            case 0: return '';
            case 1: return markdownToFRUIT(entry[0], true);
            case 2: 
                if (!delimitList)
                    return [markdownToFRUIT(entry[0], true), markdownToFRUIT(entry[1], true)].flat();
                return [markdownToFRUIT(entry[0], true), delimiter, markdownToFRUIT(entry[1], true)].flat();
            default: 
                if (!delimitList)
                    return entry.flatMap(e => markdownToFRUIT(e, true));
                return entry.flatMap((e, i) => [markdownToFRUIT(e, true), i === entry.length - 1 ? '' : i === entry.length - 2 ? delimiter : ', ']);
        }
    }
    if (Object.hasOwn(entry, 'delimiter'))
        return markdownToFRUIT(entry.array, true, entry.delimiter);
    if (Object.hasOwn(entry, 'linkTo'))
        return ArticleLink(entry.linkTo, entry.text);
    if (Object.hasOwn(entry, 'shielded')) { // card
        if (entry.atNow.owner.cards.length === 1)
            return entry.atNow.owner.id === -1 
            ? `the center card` : entry.atNow.owner === context.game.actingPlayer
            ? `your card` : [markdownToFRUIT(entry.atNow.owner), `'s card`];
        return entry.atNow.owner.id === -1 
            ? `the ${cardinals[entry.atNow.index]} center card`
            : entry.atNow.owner === context.game.actingPlayer
            ? `your ${cardinals[entry.atNow.index]} card`
            : [markdownToFRUIT(entry.atNow.owner), `'s ${cardinals[entry.atNow.index]} card`];
    }
    if (Object.hasOwn(entry, 'browserId')) {  // player
        if (context.misc.playerTeams)
            return {tag: 'b', style: {color: `var(--tx-team-${context.misc.playerTeams[entry.id].name})`}, children: entry.name};
        return {tag: 'b', style: {color: `var(--${entry.color})`}, children: entry.name};
    }
    if (Object.hasOwn(entry, 'rolePack')) return RoleLink(entry);
    if (Object.hasOwn(entry, 'icon')) return ArtifactLink(entry);
    return TeamLink(entry);
}