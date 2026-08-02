import Icon from "./Icon.js";
import markdown from "@/utils/markdown.js";
/** @import { Lord } from "@/types.js" */

/** @param {Lord} lord  */
export default function Lord(lord) {
    return {
        class: 'lord rounded flex col overflow-hidden bg-text', key: `${lord.id}`,
        children: [
            {class: 'back padded', children: {tag: 'b', children: [lord.name, ' ', Icon('crown', 'tx-GOLD')]}},
            {class: 'bg-text tx-dark padded center grow text-center', children: {tag: 'i', children: markdown(lord.description)}},
        ]
    }
}