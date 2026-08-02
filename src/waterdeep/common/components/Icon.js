/** @import { BenefitType } from "@/types.js" */

export default function Icon(name, classes = '') { 
    return {tag: 'i', class: `ph-fill ph-${name} ${classes}`}; 
}

/** @param {BenefitType | "AGENT" | "QUEST" | "FIRST" | "BUILDING" | "MANDATORY_QUEST"} benefit */
export function ResourceIcon(benefit, {classes = ''} = {}) {
    switch (benefit) {
        case "AGENT": return Icon('person', classes); 
        case "CORRU": return Icon('skull', `tx-CORRU ${classes}`);
        case "QUEST": return Icon('shield-checkered', `tx-QUEST ${classes}`);
        case "MANDATORY_QUEST": return Icon('shield-warning', `tx-QUEST ${classes}`);
        case "FACE-UP QUEST": return Icon('shield-checkered', `tx-QUEST ${classes}`);
        case "FACE-DOWN QUEST": return Icon('shield', `tx-QUEST ${classes}`);
        case "INTRIGUE": return Icon('bookmark', `tx-INTRIGUE ${classes}`);
        case "GOLD": return Icon('moon', `tx-GOLD ${classes}`);
        case "VP": return Icon('star-four', `tx-VP ${classes}`);
        case "PWOB": return Icon('question', `tx-PWOB ${classes}`);
        case "FIRST": return Icon('number-one', `tx-FIRST ${classes}`);
        case "AMBASSADOR": return Icon('person', `tx-AMBASSADOR ${classes}`);
        case "BUILDING": return Icon('building-office', `tx-BUILDING ${classes}`);
        default: 
            if (benefit.length === 1) return Icon('circle', `tx-${benefit}`);
            return {tag: 'span', class: 'nowrap multi-resource', children: benefit.split('').flatMap((b, i) => 
                [ResourceIcon(b, {classes}), i === benefit.length - 1 ? '' : '/'])}
    }
}