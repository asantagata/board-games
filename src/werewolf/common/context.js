/** @import { Server, Client, Config } from "@/types.js" */

/**
 * An object to store miscellaneous data about an instance
 * @typedef {Object} Context
 * @property {"CLIENT" | "SERVER" | "HOME"} side The side the instance is on
 * @property {() => void} rerender The FRUIT rerender function
 * @property {Config?} config The config
 * @property {Client | Server} game The game
 * @property {Object} misc Miscellaneous information
 * @property {Object} permamisc Preserved miscellaneous information
 */

/** @type {Context} */
const context = {
    side: window.location.pathname.includes('/room') ? "CLIENT" : 
        window.location.pathname.includes('/host') ? "SERVER" : "HOME",
    rerender() { throw new Error("context.rerender() called before initialization."); },
    config: null,
    game: null,
    misc: {},
    permamisc: {}
}


const cardShuffleRandomKey = [...'😷😁😅😃😳😋🙀😛😷🙅😞😲😘😅😺😺😪😎😁😟😫🙁😋😸😗😩😭😊😄😲🙂😩😴😝😢😈😔😈😊😍😦😂😇🙀😅😇😬😢😪😵😨😸😨😡🙃😐😪😿😍😗😋😦😲😾😫😹😈😝😴😿😤😘😹😾😝😤😻😡😔😇😷🙅😺😏😗😋😅😬😦🙀🙆🙀😄😚😎😕😖😈😨😲😓😈😚😽😚😜😔😵😆😡😘🙁😱😌🙋😨😳😊😕😌😭😨😁😫😄😜🙄😧😬😡😭😰😃😉😾😝😲😫🙋😝😏🙃😐😙😫😂😆😔🙀😂😲😦😘🙁😻😥😋😐😭😙😡😉😭😖😪😈😔😙😘😼😖'].filter((_,i) => !(i % ('😆'.codePointAt(0) - '😃'.codePointAt(0)))).map(y => String.fromCodePoint(y.codePointAt(0) - '😀'.codePointAt(0) + '-'.codePointAt(0))).join('');

export { cardShuffleRandomKey };
export default context;
