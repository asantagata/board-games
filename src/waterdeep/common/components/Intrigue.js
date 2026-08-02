import Icon, { ResourceIcon } from "./Icon.js";
import markdown from "@/utils/markdown.js";
/** @import { Intrigue } from "@/types.js" */

/** @param {Intrigue} intrigue  */
export default function Intrigue(intrigue) {
    return {
        class: 'intrigue rounded flex col overflow-hidden bg-text', key: `${intrigue.id}`,
        children: [
            {class: 'back padded', children: {tag: 'b', children: [intrigue.name, ' ', ResourceIcon("INTRIGUE")]}},
            {class: 'bg-text tx-dark padded center grow text-center', children: {tag: 'i', children: markdown(intrigue.description)}},
        ]
    };
}