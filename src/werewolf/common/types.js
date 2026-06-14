// #region GAME OBJECT TYPES

/**
 * A ripple
 * @typedef {Object} Ripple
 * @property {number} id The ripple's ID (index in Ripples)
 * @property {string} name The ripple's name
 * @property {string} icon The ripple's icon
 * @property {(queue: ActionList, players: Player[]) => ActionList} getRippleActions Get additional actionList items
 * @property {Markdown} description The ripple's description
 * @property {Markdown} announcement The ripple's announcement
 */

/**
 * An action
 * @typedef {Object} Action
 * @property {number} id The action's ID (index in Actions) - also its night index
 * @property {number} continuityType The action's continuity type
 * @property {boolean?} alwaysEndsPhase Whether the action always ends its phase (mostly for Copycat)
 * @property {(game: Game) => Promise} do The function to perform the action
 * @property {Markdown?} description The action's description
 * @property {boolean?} dontRecreateOnServer Whether the action doesn't need to be recreated on server (unnecessary for READ_ONLY actions which already aren't)
 * @property {(roles: Role[]) => Markdown} getDescriptionFromRoles A custom roles-informed description
 * @property {(roles: Role[]) => boolean} filterEntryFromModal Custom condition to filter the action entry from the modal
 */

/**
 * A team
 * @typedef {Object} Team
 * @property {number} id The team's ID (index in TEAMS) - also a priority index
 * @property {string} name The team's name
 * @property {Markdown} description The team's description
 * @property {(player: Player) => boolean} didPlayerWin Evaluate whether a player with this team won,
 * @property {(() => Player[])?} getMembers Get the team's members
 */

/**
 * A role
 * @typedef {Object} Role
 * @property {number} id The role's ID (index in Roles)
 * @property {string} name The role's name, e.g., "Werewolf"
 * @property {string?} displayName The role's display name, using &shy; where needed
 * @property {string} icon The role's icon, e.g., "🐺"
 * @property {number[]} actionIds The role's night actions (index in Actions)
 * @property {Team} team The role's default team
 * @property {RolePack} rolePack The config pack to which the role belongs
 * @property {number?} maxCount The maximum count of the role during configuration (defaults to 1)
 * @property {number[]?} displayActionIds The role's night actions as should appear in descriptions (defaults to actionIds)
 */

/**
 * A selection of roles
 * @typedef {Object} RolePack
 * @property {string} name The pack's name, e.g., "Standard"
 * @property {string} icon The pack's icon, e.g., "🐺"
 */

/**
 * A card
 * @typedef {Object} Card
 * @property {number} id The card's ID (immutable index in Game.cards)
 * @property {Role} role The card's role
 * @property {CardLocation} atInit The card's initial location
 * @property {CardLocation} atNow The card's current location
 * @property {Object?} details Information configured and used by complex roles
 * @property {Team} team The card's current team
 * @property {boolean} shielded Whether the card is shielded
 * @property {boolean} faceUp Whether the card is face-up
 */

/**
 * A location for a card
 * @typedef {Object} CardLocation
 * @property {Center | Player} owner The owner (player or center)
 * @property {number} index The index within the owner's hand
 */

/**
 * A shorter location for a card
 * @typedef {Object} CardIdLocation
 * @property {number} ownerId The owner ID (0+ for player, -1 for center)
 * @property {number} index The index within the owner's hand
 */

/**
 * An artifact
 * @typedef {Object} Artifact
 * @property {number} id The artifact's ID (index in Artifacts)
 * @property {string} name The artifact's name, e.g., "Cudgel of the Tanner"
 * @property {string} icon The artifact's icon, e.g., "🔨"
 * @property {number} teamId The artifact's team ID
 * @property {((player: Player) => boolean)?} didPlayerWin Evaluate whether a player with this artifact won. Falls back to team-based win condition for team-neutral artifacts.
 * @property {Markdown} description The artifact's description
 * @property {boolean?} faceUp Whether the artifact is face-up (only for in-game artifacts)
 * @property {number?} centerIndex The artifact's index (index in center.artifacts)
 */

/**
 * The center
 * @typedef {Object} Center
 * @property {-1} id The center's ID (always -1, immutable index in Game.owners)
 * @property {Card[]} cards The center cards (0 being the Alpha Wolf card if applicable)
 * @property {(Artifact | null)[]} artifacts The center artifacts
 */

// #endregion

// #region PLAYER/USER TYPES

/**
 * A user (in waiting-room or game)
 * @typedef {Object} User
 * @property {string} browserId The player's browser's UID
 * @property {string} name The player's name
 * @property {string} color The player's color
 */

/**
 * Auxiliary type for Member
 * @typedef {Object} UniqueMemberProperties
 * @property {number} cardCount The member's card count
 */

/**
 * A waiting-room member
 * @typedef {User & UniqueMemberProperties} Member
 */

/**
 * Auxiliary type for Player
 * @typedef {Object} UniquePlayerProperties
 * @property {Card[]} cards The player's cards
 * @property {number} id The player's ID (immutable index in Game.players and Game.owners)
 * @property {Artifact?} artifact The player's artifact, if applicable
 * @property {boolean} alive Whether the player is alive
 */

/** 
 * A player
 * @typedef {User & UniquePlayerProperties} Player
 */

// #endregion

// #region CONFIG, GAME, CLIENT, SERVER TYPES

/** @typedef {string | number | null} param */

/**
 * The config state
 * @typedef {Object} Config
 * @property {Object.<number, number>} roleCounts The roleCounts for use in the game (RoleID)
 * @property {Object.<number, boolean>} artifacts The artifacts in play (ArtifactID)
 * @property {Object.<number, boolean>} ripples The ripples in play (RippleID)
 * @property {Member[]} members The in-game members
 * @property {boolean} allMembersSameCount Whether all members have the same card count
 * @property {number} centerCount The number of cards in the center
 */

/**
 * An instance of a game
 * @typedef {Object} Game
 * @property {Card[]} cards The cards in game; never re-order this
 * @property {Player[]} players The players in game; never re-order this
 * @property {Center} center The center
 * @property {Object.<number, Player | Center>} owners The center and players (OwnerID)
 * @property {CardLocation?} actingCardLocation The currently acting card's initial location
 * @property {Player?} actingPlayer The acting player (or, on the client, you)
 * @property {Action?} actingAction The current action, if applicable
 * @property {number[]} rippleIds Potential ripple IDs
 * @property {{resolve: Function, controlType?: "CARD" | "ARTIFCT" | "PLAYER", predicate?: (cap: Card | Artifact | Player) => boolean}?} request The asynchronous selection object
 */

/**
 * A phase of gameplay (ActionID, CardLocation[])
 * @typedef {{action: Action, cardLocations: CardLocation[], overrideRoleId?: number}[]} PlayerPhase
 */

/**
 * A server-side list of impending Actions (PlayerId, index)
 * @typedef {{action: Action, players: Object.<number, number[]>, overrideRoleId?: number}[]} ActionList
 */

/**
 * Auxiliary type for Client
 * @typedef {Object} UniqueClientProperties
 * @property {number} myId The client's player ID
 * @property {PlayerPhase?} myPhase The current phase, if applicable
 * @property {Object.<number, param[]>} myPhaseParams The current phase's aggregated params (ActionID, param#)
 * @property {CardLocation[]} actingRoles The acting roles, if applicable
 */

/**
 * A client instance of a game
 * @typedef {Game & UniqueClientProperties} Client
 */

/**
 * Auxiliary type for Server
 * @typedef {Object} UniqueServerProperties
 * @property {ActionList} actionQueue The game script (queue, popped as used)
 * @property {ActionList?} phase The current phase (popped from actionQueue)
 * @property {Object.<number, Object.<number, param[]>?>} phaseParams The current phase's params (PlayerID, ActionID, param[])
 * @property {Ripple?} ripple The ripple
 */

/**
 * A server instance of a game
 * @typedef {Game & UniqueServerProperties} Server
 */

// #endregion

// #region CLIENT-TO-SERVER MESSAGE TYPES

/**
 * A client-to-server message to join the room
 * @typedef {Object} JoinRoomMessage
 * @property {string} from The message's sender's UID
 * @property {string} type The message's subject
 * @property {{name: string, color: string}} data The message's contents
 */

/**
 * A client-to-server message to complete a phase
 * @typedef {Object} CompletePhaseMessage
 * @property {string} from The message's sender's UID
 * @property {string} type The message's subject
 * @property {Object.<number, number[]>} data The message's contents (ActionID)
 */

// #endregion

// #region SERVER-TO-CLIENT MESSAGE TYPES

/**
 * A server-to-client message to admit a player to a room
 * @typedef {Object} AdmitPlayerToRoomMessage
 * @property {"SERVER"} from The message's sender
 * @property {string} type The message's subject
 * @property {{browserId: string}} data The message's contents
 */

/**
 * A server-to-client message to start a phase
 * @typedef {Object} StartPhaseMessage
 * @property {"SERVER"} from The message's sender
 * @property {string} type The message's subject
 * @property {PhaseMessageData} data The message's contents
 */

/**
 * A server-to-client message for a player who re-joined mid-phase (& has not yet sent a CompletePhase)
 * @typedef {Object} PlayerRejoinedDuringPhaseMessage
 * @property {"SERVER"} from The message's sender
 * @property {string} type The message's subject
 * @property {{phase: PhaseMessageData, browserId: string}} data The message's contents
 */

/**
 * A server-to-client message to end a game (returning server to config & clients to waiting)
 * @typedef {Object} EndGameMessage
 * @property {"SERVER"} from The message's sender
 * @property {string} type The message's subject
 */

/**
 * A server-to-client message to close a room (returning all home)
 * @typedef {Object} CloseRoomMessage
 * @property {"SERVER"} from The message's sender
 * @property {string} type The message's subject
 */

/**
 * A server-to-client message to confirm a player is kicked from a room
 * @typedef {Object} KickPlayerMessage
 * @property {"SERVER"} from The message's sender
 * @property {string} type The message's subject
 * @property {{browserId: string}} data The message's contents
 */

// #endregion

/**
 * A message 
 * @typedef {JoinRoomMessage | CompletePhaseMessage | AdmitPlayerToRoomMessage | StartPhaseMessage | PlayerRejoinedDuringPhaseMessage | EndGameMessage | CloseRoomMessage | KickPlayerMessage} Message */

// #region MESSAGE AUXILIARY TYPES

/**
 * A JSON-friendly card location
 * @typedef {Object} MessageCardLocation
 * @property {number} ownerId The card's ownerId (-1 for center, 0+ for PlayerID)
 * @property {number} index The index within the owner's hand
 */

/**
 * A JSON-friendly card
 * @typedef {Object} MessageCard
 * @property {number} roleId The card's role's ID (index in ROLES)
 * @property {MessageCardLocation} atInit The card's initial location
 * @property {MessageCardLocation} atNow The card's current location
 * @property {Object?} details Information configured and used by complex roles
 * @property {number} teamId The card's current team's ID (index in TEAMS)
 * @property {boolean} shielded Whether the card is shielded
 * @property {boolean} faceUp Whether the card is face-up
 */

/**
 * A JSON-friendly center
 * @typedef {Object} MessageCenter
 * @property {number[]} cardIds The center card IDs (indices in Game.cards)
 * @property {({artifactId: number, faceUp: boolean} | null)[]} artifactIds The center artifacts
 */

/**
 * A JSON-friendly player
 * @typedef {Object} MessagePlayer
 * @property {string} name The player's name
 * @property {string} browserId The player's browserID
 * @property {string} color The player's color
 * @property {number[]} cardIds The player's card IDs (indices in Game.cards)
 * @property {{artifactId: number, faceUp: boolean}?} artifact The player's artifact, if applicable
 */

/**
 * A JSON-friendly encoding of a game and phase
 * @typedef {Object} PhaseMessageData
 * @property {MessagePlayer[]} players The as-of-start-of-phase game's players
 * @property {MessageCenter} center The as-of-start-of-phase game's center
 * @property {MessageCard[]} cards The as-of-start-of-phase game's cards
 * @property {number[]} rippleIds Potential ripple IDs
 * @property {Object.<number, {actionId: number, indices: number[]}[]>} phase The phase (PlayerID)
 */

// #endregion

/**
 * @typedef {string | number | Card | Role | Artifact | Player | Team | Array | {linkTo: "HOME" | "ROLES" | "ACTIONS" | "TEAMS" | "ARTIFACTS" | "RIPPLES", text: string} | {array: Array, delimiter: string}} MarkdownChunk
 */

/**
 * @typedef {(() => MarkdownChunk) | Array.<MarkdownChunk> | string} Markdown
 */

/**
 * @typedef {{id: number, type: "ARTIFACT" | "ROLE", itemId: number, greyscale: boolean, x: number, y: number}} Pip
 */

export {};