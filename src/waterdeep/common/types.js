/** @typedef {"P" | "W" | "O" | "B"} Adventurer */
/** @typedef {"P" | "W" | "O" | "B" | "PW" | "WO" | "WB" | "PO" | "PB" | "OB" | "PWO" | "PWB" | "WOB" | "POB" | "PWOB"} AdventurerCombo */
/** @typedef {Adventurer | "GOLD" | "CORRU" | "VP"} ResourceType */
/** @typedef {AdventurerCombo | "GOLD" | "VP" | "CORRU"} CostType */
/** @typedef {CostType | "CORRU" | "FACE-UP QUEST" | "FACE-DOWN QUEST" | "INTRIGUE" } BenefitType */

/** @typedef {"COMMERCE" | "PIETY" | "SKULLDUGGERY" | "WARFARE" | "ARCANA"} QuestType */
/** @typedef {"GAME BUILDING" | "SHOP BUILDING" | "GAME ACTION SPACE" | "SHOP ACTION SPACE" | "PLAYER" | "SHOP QUEST" | "PLAYER QUEST" | "OPTION"} RequestType */
/** @typedef {"ROUND_START" | "TURN_LOOP" | "TURN" | "ROUND_END" | "GAME_END" | "TURN_LOOP_INNER" | "REASSIGN_HARBORITES" | "REASSIGN_HARBORITE" | "REASSIGN_HARBORITE_INNER"} EventType */

/** @typedef {{ [key in ResourceType]?: number }} Resources */
// invariant for these - only ever one AdventurerCombo in a set
/** @typedef {{ [key in CostType]?: number } & {"CORRU": number | {upTo: number}}} Costs */
/** @typedef {{ [key in BenefitType]?: number }} Benefits */

/** @typedef {number | "AMBASSADOR"} Agent */

/** 
 * @typedef {{
 *  id: number,
 *  name: string,
 *  isSkullport?: boolean,
 *  actionSpaces: ActionSpace[],
 *  default?: true,
 *  goldCost?: number,
 *  owner?: Player,
 *  ownerBenefits?: Benefits,
 *  ownerBenefitsDescription?: Markdown,
 * }} Building 
 */

/** 
 * Can have benefit/cost? or onPurchasedOrRoundStart/resources/cost?/benefit?? or action/cost?;
 * Description(s) are hardcoded for simple benefit/cost? & onPurchaseOrRoundStart
 * Feasible must be specified when beyond "has no cost" or "has (exact) cost"
 * @typedef {{
 *  description?: Markdown,
 *  benefit?: Benefits | () => Benefits, 
 *  action?: () => void | Promise<void>, 
 *  cost?: Costs, 
 *  feasible?: (player: Player, actionSpace: ActionSpace) => boolean, 
 *  onPurchasedOrRoundStart?: Resources | () => void, 
 *  onPurchasedOrRoundStartDescription?: Markdown,
 *  occupants?: Agent[], 
 *  resources?: Resources,
 *  buildingId: number,
 *  index: number
 * }} ActionSpace 
 */

/** 
 * @typedef {{
 *  id: number,
 *  name: string,
 *  color: "R" | "Y" | "G" | "B" | "P" | "O",
 *  lord: Lord, 
 *  activeQuests: Quest[], 
 *  completedQuests: Quest[], 
 *  resources: Resources, 
 *  intrigues: Intrigue[], 
 *  agents: Agent[],
 *  intrigueDeckIndex: number
 * }} Player 
 */

/** @typedef {{id: number, name: string, description: Markdown, isSkullport?: boolean, getBonusVP: (player: Player) => number}} Lord */

/**
 * @typedef {{
 *  id: number,
 *  name: string,
 *  isSkullport?: boolean,
 *  questType?: QuestType,
 *  cost: Costs,
 *  benefit: Benefits,
 *  otherBenefit?: () => void | Promise<void>,
 *  isPlotQuest?: boolean,
 *  isMandatoryQuest?: boolean,
 *  plotQuestBonus?: PlotQuestBonus,
 *  benefitDescription?: Markdown
 * }} Quest
 */

/** @typedef {`${number}_PURCHASES_BUILDING` | `${number}_ASSIGNS_AGENT_TO_BUILDING_${number}` | `${number}_RETURNS_CORRU` | `${number}_GETS_CORRU` | `${number}_DOES_ACTION_GIVING_${ResourceType}` | "START_OF_ROUND" | `${number}_COMPLETE_QUEST_${QuestType}` | `${number}_PLAYS_INTRIGUE` | "SOMEONE_TAKES_FIRST_PLAYER" | "SPECIAL_CAN_ASSIGN_AGENT_TO_OCCUPIED" | "IMMEDIATELY"} BonusTrigger */

/** 
 * @typedef {{
 *  id: number,
 *  trigger: BonusTrigger | (player: Player) => BonusTrigger, 
 *  action: (bonus: PlotQuestBonus) => void | Promise<void>,
 *  feasible?: (bonus: PlotQuestBonus) => boolean,
 *  interval?: "TURN" | "ROUND",
 *  hasBeenUsedThisInterval?: boolean,
 *  owner?: Player,
 *  description: Markdown,
 *  quest: Quest
 * }} PlotQuestBonus
 **/

/** @typedef {{id: number, isSkullport?: boolean, name: string, description: Markdown, feasible?: () => boolean, action: () => void | Promise<void>}} Intrigue */

/** Can also be any primitive, just omitting for autocomplete.
 * @typedef {QuestType | BenefitType | Benefits | Player} MarkdownPiece */
/** @typedef {MarkdownPiece | () => Markdown | (MarkdownPiece | () => Markdown)[]} Markdown */

/** 
 * @typedef {{
 *  players: Player[], 
 *  round: number, 
 *  actingPlayer: Player | null,
 *  questDeck: Quest[],
 *  faceUpQuests: Quest[], 
 *  buildingDeck: Building[], 
 *  buildingShop: Building[], 
 *  buildings: Building[],
 *  staticIntrigueDeck: Intrigue[],
 *  corruptionOnTrack: number,
 *  nextRoundAmbassadorOwner?: Player,
 *  nextRoundFirstPlayer: Player,
 *  thisRoundFirstPlayer: Player,
 *  thisRoundAmbassadorOwner?: Player,
 *  bonuses: { [key in BonusTrigger]?: PlotQuestBonus[] },
 *  harboriteToReassign: number | null,
 *  queue: EventType[],
 *  endTurnLoop: boolean
 * }} Game 
 * */

/**
 * @typedef {{
 *  players: {
 *   activeQuestIds: number[], 
 *   completedQuestIds: number[], 
 *   intrigueIds: number[]
 *   resources: Resources, 
 *   agents: Agent[],
 *   intrigueDeckIndex: number
 *  }[],
 *  round: number,
 *  actingPlayerId: number | null,
 *  questIdDeck: number[],
 *  faceUpQuestIds: number[],
 *  buildingIdDeck: number[],
 *  buildingShop: {
 *   id: number, 
 *   ownerId?: number, 
 *   actionSpaces: {
 *    occupants: Agent[],
 *    resources: Resources
 *   }[]
 *  }[],
 *  buildings: {
 *   id: number, 
 *   ownerId?: number, 
 *   actionSpaces: {
 *    occupants: Agent[],
 *    resources: Resources
 *   }[]
 *  }[],
 *  corruptionOnTrack: number,
 *  nextRoundAmbassadorOwnerId?: number,
 *  nextRoundFirstPlayerId: number,
 *  thisRoundFirstPlayerId: number,
 *  thisRoundAmbassadorOwnerId?: number,
 *  bonuses: { [key in BonusTrigger]?: {id: number, hasBeenUsedThisInterval?: boolean, ownerId: number}[] },
 *  harboriteToReassign: number | null,
 *  queue: EventType[],
 *  endTurnLoop: boolean
 * }} HistoricGame
 */

export {};