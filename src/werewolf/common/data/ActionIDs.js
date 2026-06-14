/* Actions must be written here in the order they should occur. */

let actionId = 1;
const ActionIDs = {
    COPYCAT$VIEW_CENTER_CARD_AND_ENQUEUE_ACTION: actionId++,
    DOPPY$VIEW_PLAYER_CARD_AND_SOMETIMES_ACT: actionId++,

    SENTINEL$PROTECT: actionId++,

    WOLFSDEN$VIEW_WOLVES_OR_CENTER: actionId++,
    MINION$VIEW_WOLVES: actionId++,
    MYSTIC_WOLF$VIEW_OTHER_PLAYER_CARD: actionId++,
    ALPHA_WOLF$GIVE_ALPHA_WOLF: actionId++,

    MASON$VIEW_MASONS: actionId++,
    APP_TANNER$VIEW_TANNERS: actionId++,

    SEER$VIEW_1_PLAYER_OR_2_CENTER_CARDS: actionId++,
    APP_SEER$VIEW_OTHER_PLAYER_CARD: actionId++,
    PI$VIEW_2_AND_ABSORB_EVIL_TEAM: actionId++,

    ROBBER$SWAP_AND_VIEW_OTHER_PLAYER_CARD: actionId++,
    WITCH$VIEW_AND_SWAP_FROM_CENTER: actionId++,
    TROUBLEMAKER$SWAP_TWO_OTHER_PLAYER_CARDS: actionId++,
    TROUBLEMAKER_JR$SWAP_TWO_SAME_PLAYER_CARDS: actionId++,
    VI$SWAP_LEFT_OR_RIGHT: actionId++,
    DRUNK$SWAP_WITH_CENTER: actionId++,
    BOOMERANGER$COME_BACK: actionId++,

    INSOMNIAC$VIEW_NEW_CARD: actionId++,
    YOUNSOMNIAC$VIEW_CARD: actionId++,
    REVEALER$REVEAL_OTHER_PLAYER_CARD: actionId++,
    PERVERT$REVEAL_SELF: actionId++,
    CURATOR$CURATE: actionId++,
    DOPPY$DO_LATER_ACTION: actionId++,

    GENERAL$NOTIFY_RIPPLE: actionId++,
    GENERAL$PREPARE_TO_VOTE: actionId++,
    GENERAL$VOTE: actionId++
};

export default ActionIDs;