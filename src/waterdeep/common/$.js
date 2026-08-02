import { getRandomSeed } from "@/utils/random.js";
/** @import {Game, Player, RequestType, Building, Quest, Intrigue, HistoricGame, Lord} from "@/types.js" */

// this is only used by the server; the client-side game is one FRUIT component i think. i'm so simple!

const $ = {
    /** @type {Game | null} */
    game: null,
    /** @type {{seed: string, skullport: boolean, long: boolean, players: Partial<Player>[]}} */
    config: {
        seed: getRandomSeed(),
        players: [ {id: 1, color: "O", name: ''}, {id: 2, color: "B", name: ''} ],
        skullport: true, long: false
    },
    /** @type {{resolve: (a: any) => any, predicate: (a: any) => boolean, types: RequestType[]} | null} */
    request: null,
    rerender: () => null,
    /** 
     * @type {{
     *  callStack: Markdown[],
     *  question: Markdown,
     *  example: null | Building | Quest | Intrigue,
     *  options: (Building | Quest | Intrigue | {id: string | number | boolean | null, label: Markdown})[] | null,
     *  restoreParity: boolean,
     *  showIntrigueSearch: boolean,
     *  intrigueQuery?: string,
     *  lastIntrigueInput?: number,
     *  showLords: boolean
     * }} 
     * */
    ui: {
        callStack: [],
        question: '',
        example: null,
        options: null,
        restoreParity: false,
        showIntrigueSearch: false,
        intrigueQuery: "",
        lastIntrigueInput: null,
        showLords: false
    },
    /**
     * @type {Array<{{
     *  eventType: "ROUND_START" | "TURN",
     *  description: Markdown,
     *  historicGame: HistoricGame
     * }}>}
     */
    history: [],

    misc: {
        lastCostChanges: null,
        lastSpaceResources: null,
        choosingBuildingForTurn: false
    },

    /**
     * @type {{
     *  myId: number,
     *  lord: Lord,
     *  intrigueDeckIndex: number,
     *  intrigueDeck: Intrigue[],
     *  intrigueHand: Intrigue[],
     *  intrigueHandAndIndexHistory: {intrigueHand: Intrigue[], intrigueDeckIndex: number}[]
     * }}
     */
    client: {
        myId: 1,
        lord: null,
        intrigueDeckIndex: -1,
        intrigueDeck: [],
        intrigueHand: [],
        intrigueHandAndIndexHistory: []
    }
};
export default $;