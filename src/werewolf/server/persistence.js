import context from "@/context.js";
import { ArtifactIDs } from "@/data/Artifacts.js"; 
import { RoleIDs } from "@/data/Roles.js";
import { RippleIDs } from "@/data/Ripples.js";
/** @import { Config } from "@/types.js"; */

/** @typedef {{name: string, datetime: number, memberCardCount: number, config: Config, slot: number?}} Save */

/**
 * @param {Object} options
 * @param {Config} options.config 
 * @param {number} options.datetime
 * @param {string} options.name
 */
function stringifyConfig({config, datetime, name}) {
    return [
        `${datetime}`,
        config.allMembersSameCount ? '1' : '0',
        `${config.members?.[0]?.cardCount ?? '1'}`,
        `${config.centerCount ?? '3'}`,
        Object.keys(config.roleCounts).filter(roleId => config.roleCounts[roleId])
            .map(roleId => Array.from({length: config.roleCounts[roleId]}, () => roleId).join(',')).join(','),
        Object.keys(config.artifacts).filter(artifactId => config.artifacts[artifactId]).join(','),
        Object.keys(config.ripples).filter(rippleId => config.ripples[rippleId]).join(','),
        name
    ].join(';');
}

function countsOfInstances(str, delimiter = ',') {
    if (!str) return {};
    const arr = str.split(delimiter);
    const counts = {};
    for (const val of arr) {
        if (counts[val]) counts[val]++;
        else counts[val] = 1;
    }
    return counts;
}

/**
 * @returns {Save} 
 */
function destringifyConfig(string) {
    const [
        datetime, allMembersSameCountStr, memberCardCount, centerCount,
        roleCountsStr, artifactsStr, ripplesStr, ...nameDelimited
    ] = string.split(';');
    
    const roleCounts = {
        ...Object.fromEntries(Object.values(RoleIDs).map(k => [k, 0])), 
        ...countsOfInstances(roleCountsStr)
    };

    const artifacts = {
        ...Object.fromEntries([
            ...Object.values(ArtifactIDs).map(k => [k, false]),
            ...(artifactsStr ? artifactsStr.split(',').map(aId => [aId, true]) : [])
        ])
    };

    const ripples = {
        ...Object.fromEntries([
            ...Object.values(RippleIDs).map(k => [k, false]),
            ...(ripplesStr ? ripplesStr.split(',').map(rId => [rId, true]) : [])
        ])
    };

    return {
        name: nameDelimited.join(';'), datetime: +datetime, memberCardCount: +memberCardCount,
        config: {
            allMembersSameCount: !!+allMembersSameCountStr, centerCount: +centerCount,
            roleCounts, artifacts, ripples
        }
    };
}

/** @returns {Object.<number, Save>} */
export function getSaves() {
    const saves = {};
    for (let i = 1; i < 21; i++) {
        const str = localStorage.getItem(`save-${i}`);
        if (str === null) continue;
        saves[i] = {...destringifyConfig(str), slot: i};
    }
    return saves;
}

/**
 * @param {Object} options
 * @param {Config} options.config 
 * @param {number} options.slot
 * @param {string} options.name 
 */
export function saveToSlot({config, slot, name}) {
    const save = {config: {
        ...config, members: null, 
        ripples: {...config.ripples}, 
        artifacts: {...config.artifacts},
        roleCounts: {...config.roleCounts}
    }, datetime: Date.now(), name};
    context.permamisc.saves[slot] = {
        name: save.name, datetime: save.datetime, 
        memberCardCount: config.members?.[0]?.cardCount ?? 1,
        slot, config: {...save.config, members: null}
    };
    localStorage.setItem(`save-${slot}`, stringifyConfig(save))
}

export function getDateTimeStr(n, now) {
    if (!context.permamisc.datetimes) context.permamisc.datetimes = {};
    const date = context.permamisc.datetimes?.[n] ?? (new Date(n));
    context.permamisc.datetimes[n] = date;
    if (date.toDateString() === now.toDateString())
        return date.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
        });
    return date.toLocaleDateString();
}

/**
 * @param {Save} save 
 */
export function deleteSave(save) {
    delete context.permamisc.saves[save.slot];
    localStorage.removeItem(`save-${save.slot}`);
    context.rerender();
}

/**
 * @param {Save} save 
 */
export function loadSave(save) {
    context.config = {
        roleCounts: save.config.roleCounts,
        artifacts: save.config.artifacts,
        ripples: save.config.ripples,
        centerCount: save.config.centerCount,
        allMembersSameCount: save.config.allMembersSameCount,
        members: context.config.members.map(m => ({...m, cardCount: save.memberCardCount}))
    }
}