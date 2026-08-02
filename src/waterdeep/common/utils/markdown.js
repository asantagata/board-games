import { ResourceIcon } from "@/components/Icon.js";
/** @import { Markdown } from "@/types.js" */

const ResourceTypeKeys = {"P": 1, "W": 1, "O": 1, "B": 1, "PW": 1, "WO": 1, "WB": 1, "PO": 1, "PB": 1, "OB": 1, "PWO": 1, "PWB": 1, "WOB": 1, "POB": 1, "PWOB": 1, "GOLD": 1, "VP": 1, "CORRU": 1, "FACE-UP QUEST": 1, "INTRIGUE": 1, "AGENT": 1, "FIRST": 1, "QUEST": 1, "AMBASSADOR": 1, "BUILDING": 1, "MANDATORY_QUEST": 1};
const QuestTypeKeys = {"COMMERCE": 1, "PIETY": 1, "SKULLDUGGERY": 1, "WARFARE": 1, "ARCANA": 1, "MANDATORY": 1};

/**
 * @param { Markdown } md
 * @param {{
 *  delimitList: boolean
 *  delimiter: string,
 *  mdcOpts: object
 * }} options
 */
export default function markdown(md, options) {
    const {delimitList = false, delimiter = ' & ', mdcOpts = null} = options ?? {};
    if (typeof md === 'function') md = md();
    if (typeof md !== 'object') {
        if (ResourceTypeKeys[md]) return ResourceIcon(md);
        if (QuestTypeKeys[md]) return {tag: 'b', children: md, class: `tx-${md}`};
        return md;
    }
    if (Array.isArray(md)) {
        const mdcOptsComp = {...options, ...(mdcOpts ?? {})};
        if (!delimitList) return md.flatMap(mdc => markdown(mdc, mdcOptsComp));
        switch (md.length) {
            case 0: return [];
            case 1: return markdown(md[0], mdcOptsComp);
            default: return md.flatMap((mdc, i) => [markdown(mdc, mdcOptsComp), i === md.length - 1 ? '' : i === md.length - 2 ? delimiter : ', ']);
        }
    }
    if (!Object.keys(md)) return [];
    if (ResourceTypeKeys[Object.keys(md)[0]]) return {tag: 'span', children: Object.keys(md).flatMap(res => {
        if (md[res] >= 0) return repeat(ResourceIcon(res), md[res]);
        return {tag: 'span', children: ['≤', ...repeat(ResourceIcon("CORRU"), md[res].upTo)]};
    })}
    if (Object.hasOwn(md, 'lord')) return {tag: 'b', children: md.name, class: `tx-PLAYER-${md.color}`};
    return md;
}

function repeat(icon, by) {
    if (icon.class.endsWith('multi-resource') && by <= 3)
        return Array.from({length: by}, () => icon).flatMap((icon, ix) => [icon, ix < by - 1 ? ' ' : '']);
    if (by <= 3) return Array.from({length: by}, () => icon);
    else return [`${by}×`, icon];
}

