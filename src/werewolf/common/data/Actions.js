import GameCommands, { CardPredicates, ArtifactPredicates, PlayerPredicates } from "./GameCommands.js";
import Teams, { TeamIDs } from "./Teams.js";
import Roles, { RoleIDs } from "./Roles.js";
import ActionIDs from "./ActionIDs.js";
/** @import {Action} from "@/types.js" */

/**
* This file contains definitions for all Actions.
* To introduce a new action, add a new unique entry to ActionIDs and the Actions object.
* Order on the Actions object doesn't matter, but consistency is nice.
*/

const ContinuityTypes = {
    READ_ONLY: 0,
    WRITE_ONLY: 1,
    READ_WRITE: 2,
    IS_OWN_PHASE: 3
}

const DOPPY_LATER_ROLE_IDS = [RoleIDs.BOOMERANGER, RoleIDs.INSOMNIAC, RoleIDs.YOUNSOMNIAC, RoleIDs.REVEALER, RoleIDs.PERVERT, RoleIDs.CURATOR];
const DOPPY_DURING_ACTION_IDS = new Set([ActionIDs.WOLFSDEN$VIEW_WOLVES_OR_CENTER, ActionIDs.MINION$VIEW_WOLVES, ActionIDs.APP_TANNER$VIEW_TANNERS, ActionIDs.MASON$VIEW_MASONS]);

/** @type {Object.<number, Action>} */
const Actions = {
    [ActionIDs.COPYCAT$VIEW_CENTER_CARD_AND_ENQUEUE_ACTION]: {
        id: ActionIDs.COPYCAT$VIEW_CENTER_CARD_AND_ENQUEUE_ACTION,
        getDescriptionFromRoles: (roles) => ["View a card from the center. The ", Roles[RoleIDs.COPYCAT], " takes on the viewed card's ", {linkTo: "TEAMS", text: "team alignment"}, ". When the viewed card has an ", {linkTo: "ACTIONS", text: "action"}, " to perform, you will perform it as the ", Roles[RoleIDs.COPYCAT], ...(roles.some(r => r.id === RoleIDs.DOPPELGANGER) ? [", unless it was the ", Roles[RoleIDs.DOPPELGANGER], "."] : ".")],
        continuityType: ContinuityTypes.READ_WRITE, alwaysEndsPhase: true,
        do: async function(game) {
            const actingCard = GameCommands.getCardNowAt(game.actingCardLocation);
            const centerCard = await GameCommands.playerChooseCard({
                prompt: [`Choose a card in the center to copycat.`],
                predicate: CardPredicates.CENTER,
                promptIsTemporary: true
            });
            await GameCommands.viewCard(centerCard);

            if (centerCard.role.id === RoleIDs.DOPPELGANGER) 
                return await GameCommands.broadcastAndAwaitOK(["The ", actingCard.role, " can't copycat the ", centerCard.role, ", so nothing happens."]);

            actingCard.details = {roleId: centerCard.role.id};
            actingCard.team = centerCard.role.team;
            for (const actionId of centerCard.role.actionIds)
                GameCommands.enqueueAction(Actions[actionId], game.actingPlayer, game.actingCardLocation.index);

            const statement = [];
            if (centerCard.role.team.id !== TeamIDs.VILLAGE)
                statement.push("The ", actingCard.role, " is now on the ", centerCard.role.team, " team. ");
            if (centerCard.role.actionIds.length)
                statement.push("You will wake up later tonight to perform the ", centerCard.role, "'s actions.");
            if (!statement.length)
                statement.push("The ", centerCard.role, " is on the ", Teams[TeamIDs.VILLAGE], " team and performs no night actions, so you are unaffected.");
            return await GameCommands.broadcastAndAwaitOK(statement);
        }
    },

    [ActionIDs.DOPPY$VIEW_PLAYER_CARD_AND_SOMETIMES_ACT]: {
        id: ActionIDs.DOPPY$VIEW_PLAYER_CARD_AND_SOMETIMES_ACT,
        getDescriptionFromRoles: (roles) => {
            const desc = ["View another player's card. The ", Roles[RoleIDs.DOPPELGANGER], " takes on the viewed card's ", {linkTo: "TEAMS", text: "team alignment"}, ". You must perform the viewed card's ", {linkTo: "ACTIONS", text: "actions"}, " as the ", Roles[RoleIDs.DOPPELGANGER], " immediately"];
            const laterRoles = DOPPY_LATER_ROLE_IDS.filter(rId => roles.some(r => r.id === rId));
            if (laterRoles.length) {
                desc.push(...[", except for actions of the ", laterRoles.map(id => Roles[id]), ", which are performed separately later on"]);
                if (roles.some(r => r.id === RoleIDs.COPYCAT))
                    desc.push(...[", and the ", Roles[RoleIDs.COPYCAT], ", which are not performed."])
                else desc.push(".");
            } else {
                if (roles.some(r => r.id === RoleIDs.COPYCAT))
                    desc.push(...[", except for the actions of the ", RoleIDs.COPYCAT, ", which are not performed."])
                desc.push(".");
            }
            return desc;
        },
        continuityType: ContinuityTypes.READ_WRITE,
        do: async function(game) {
            const actingCard = GameCommands.getCardNowAt(game.actingCardLocation);
            const playerCard = await GameCommands.playerChooseCard({
                prompt: [`Choose another player's card to act as.`],
                predicate: CardPredicates.ANY_OTHER_PLAYER,
                promptIsTemporary: true
            });
            await GameCommands.viewCard(playerCard);
            
            actingCard.details = {roleId: playerCard.role.id};
            
            if (playerCard.role.id === RoleIDs.COPYCAT) {
                actingCard.team = Roles[playerCard.details.roleId].team;
                return await GameCommands.broadcastAndAwaitOK(["The ", actingCard.role, " is now on the ", playerCard.role, "'s team. The ", actingCard.role, " can't act as the ", playerCard.role, ", so nothing happens."]);
            }

            actingCard.team = playerCard.role.team;

            const statement = [];
            if (playerCard.role.team.id !== TeamIDs.VILLAGE)
                statement.push("The ", actingCard.role, " is now on the ", playerCard.role.team, " team. ");

            const hasActionsNow = playerCard.role.actionIds.length 
                && !DOPPY_LATER_ROLE_IDS.includes(playerCard.role.id) 
                && playerCard.role.actionIds.some(id => !DOPPY_DURING_ACTION_IDS.has(id));
            const hasActionsLater = playerCard.role.actionIds.length 
                && (DOPPY_LATER_ROLE_IDS.includes(playerCard.role.id) 
                || playerCard.role.actionIds.some(id => DOPPY_DURING_ACTION_IDS.has(id)));

            if (hasActionsLater && hasActionsNow) statement.push("You will now act as ", playerCard.role, ". You will also wake up to act as ", playerCard.role, " later on.");
            else if (hasActionsLater) statement.push("You will wake up later on to act as ", playerCard.role, ".");
            else if (hasActionsNow) statement.push("You will now act as ", playerCard.role, ".");
            if (!statement.length)
                statement.push("The ", playerCard.role, " is on the ", Teams[TeamIDs.VILLAGE], " team and performs no night actions, so you are unaffected.");
            await GameCommands.broadcastAndAwaitOK(statement);

            if (DOPPY_LATER_ROLE_IDS.includes(playerCard.role.id))
                GameCommands.enqueueAction(Actions[ActionIDs.DOPPY$DO_LATER_ACTION], game.actingPlayer, game.actingCardLocation.index);
            else for (const actionId of playerCard.role.actionIds) {
                if (DOPPY_DURING_ACTION_IDS.has(actionId))
                    GameCommands.enqueueAction(Actions[actionId], game.actingPlayer, game.actingCardLocation.index);
                else
                    await GameCommands.doAction(Actions[actionId]);
            }
        }
    },

    [ActionIDs.SENTINEL$PROTECT]: {
        id: ActionIDs.SENTINEL$PROTECT,
        description: "You may shield any other player's card, preventing that card from being viewed or displaced.",
        continuityType: ContinuityTypes.READ_WRITE, alwaysEndsPhase: true,
        do: async function(game) {
            const playerCard = await GameCommands.playerChooseCard({
                prompt: [`Choose another player's card to shield.`],
                predicate: CardPredicates.ANY_OTHER_PLAYER,
                skippable: true, promptIsTemporary: true
            });
            if (playerCard) await GameCommands.shieldCard(playerCard);
            else await GameCommands.broadcastAndAwaitOK("You decline to shield a card.");
        }
    },

    [ActionIDs.WOLFSDEN$VIEW_WOLVES_OR_CENTER]: {
        id: ActionIDs.WOLFSDEN$VIEW_WOLVES_OR_CENTER,
        description: ["Ascertain which players are on the ", Teams[TeamIDs.WOLFSDEN], " team. If you're the only ", Teams[TeamIDs.WOLFSDEN], " player, you may view a card from the center."],
        continuityType: ContinuityTypes.READ_ONLY,
        do: async function() {
            const wolves = GameCommands.getPlayersSuchThat(p => GameCommands.getCardSuchThat(c => c.atInit.owner.id === p.id && (c.role.team.id == TeamIDs.WOLFSDEN || Roles[c.details?.roleId]?.team.id === TeamIDs.WOLFSDEN)));
            const statement = [`You identify the `, Teams[TeamIDs.WOLFSDEN], ` team: `, wolves, '. ']
            const dreamWolves = GameCommands.getPlayersSuchThat(p => GameCommands.getCardSuchThat(c => c.atInit.owner.id === p.id && (c.role.id == RoleIDs.DREAM_WOLF || c.details?.roleId === RoleIDs.DREAM_WOLF)));
            switch (dreamWolves.length) {
                case 0: break;
                case 1: 
                    statement.push("(Of these, ", dreamWolves, " is a ", Roles[RoleIDs.DREAM_WOLF], ".)");
                    break;
                default: 
                    statement.push("(Of these, ", dreamWolves, " are ", Roles[RoleIDs.DREAM_WOLF], ".)");
                    break;
            }
            await GameCommands.broadcastAndAwaitOK(statement);
            if (wolves.length === 1) {
                const centerCard = await GameCommands.playerChooseCard({
                    prompt: [`Since you are the only member of the `, Teams[TeamIDs.WOLFSDEN], ` team, you may view a card in the center.`],
                    predicate: CardPredicates.CENTER,
                    skippable: true, promptIsTemporary: true
                });
                if (centerCard) await GameCommands.viewCard(centerCard);
                else GameCommands.broadcastAndAwaitOK(`You decline to view a card from the center.`);
            }
        }
    },

    [ActionIDs.MINION$VIEW_WOLVES]: {
        id: ActionIDs.MINION$VIEW_WOLVES,
        description: ["Ascertain which players are on the ", Teams[TeamIDs.WOLFSDEN], " team. (They do not learn who you are.)"],
        continuityType: ContinuityTypes.READ_ONLY,
        do: async function(game) {
            const wolves = GameCommands.getPlayersSuchThat(p => GameCommands.getCardSuchThat(c => c.atInit.owner.id === p.id && (c.role.team.id == TeamIDs.WOLFSDEN || Roles[c.details?.roleId]?.team.id === TeamIDs.WOLFSDEN)));
            if (!wolves.length) return await GameCommands.broadcastAndAwaitOK([`There are no players on the `, Teams[TeamIDs.WOLFSDEN], ` team.`]);
            await GameCommands.broadcastAndAwaitOK([`You identify the `, Teams[TeamIDs.WOLFSDEN], ` team: `, wolves, '.']);
        }
    },

    [ActionIDs.MYSTIC_WOLF$VIEW_OTHER_PLAYER_CARD]: {
        id: ActionIDs.MYSTIC_WOLF$VIEW_OTHER_PLAYER_CARD,
        description: "You may view another player's card.",
        continuityType: ContinuityTypes.READ_ONLY,
        do: async function(game) {
            const playerCard = await GameCommands.playerChooseCard({
                prompt: `You may choose another player's card to view.`,
                predicate: CardPredicates.ANY_OTHER_PLAYER,
                skippable: true, promptIsTemporary: true
            });
            if (!playerCard)
                return await GameCommands.broadcastAndAwaitOK(`You decline to view a card.`);
            await GameCommands.viewCard(playerCard);
        }
    },

    [ActionIDs.ALPHA_WOLF$GIVE_ALPHA_WOLF]: {
        id: ActionIDs.ALPHA_WOLF$GIVE_ALPHA_WOLF,
        description: ["The first center card is a ", Roles[RoleIDs.WEREWOLF], "! Swap it with another player's card."],
        continuityType: ContinuityTypes.WRITE_ONLY,
        do: async function(game) {
            const playerCard = await GameCommands.playerChooseCard({
                prompt: [`Choose another player's card to swap with the center `, Roles[RoleIDs.WEREWOLF], ` card.`],
                predicate: CardPredicates.ANY_OTHER_PLAYER,
                promptIsTemporary: true
            });
            const alphaCard = GameCommands.getCardNowAt({owner: game.center, index: 0});
            GameCommands.swap2Cards(playerCard, alphaCard);
        }
    },

    [ActionIDs.MASON$VIEW_MASONS]: {
        id: ActionIDs.MASON$VIEW_MASONS,
        description: ["Ascertain which players are ", Roles[RoleIDs.MASON], "s."],
        continuityType: ContinuityTypes.READ_ONLY,
        do: async function(game) {
            const masons = GameCommands.getPlayersSuchThat(p => GameCommands.getCardSuchThat(c => c.atInit.owner.id === p.id && (c.role.id === RoleIDs.MASON || c.details.roleId === RoleIDs.MASON)));
            await GameCommands.broadcastAndAwaitOK([`You identify the `, Roles[RoleIDs.MASON], `s: `, masons, '.']);
        }
    },

    [ActionIDs.APP_TANNER$VIEW_TANNERS]: {
        id: ActionIDs.APP_TANNER$VIEW_TANNERS,
        description: ["Ascertain which players are on the ", Teams[TeamIDs.TANNER], " team. (They do not learn who you are.)"],
        continuityType: ContinuityTypes.READ_ONLY,
        do: async function(game) {
            const tanners = GameCommands.getPlayersSuchThat(p => GameCommands.getCardSuchThat(c => c.atInit.owner.id === p.id && (c.role.team.id == TeamIDs.TANNER || Roles[c.details?.roleId]?.team.id === TeamIDs.TANNER)));
            if (!tanners.length) return await GameCommands.broadcastAndAwaitOK([`There are no players on the `, Teams[TeamIDs.TANNER], ` team.`]);
            await GameCommands.broadcastAndAwaitOK([`You identify the `, Teams[TeamIDs.TANNER], ` team: `, tanners, '.']);
        }
    },

    [ActionIDs.SEER$VIEW_1_PLAYER_OR_2_CENTER_CARDS]: {
        id: ActionIDs.SEER$VIEW_1_PLAYER_OR_2_CENTER_CARDS,
        description: "You may view 2 cards in the center or 1 belonging to another player.",
        continuityType: ContinuityTypes.READ_ONLY,
        do: async function() {
            const playerOrCenterCard = await GameCommands.playerChooseCard({
                prompt: `You may choose a card to view. If you choose a card from the center, you may view another center card.`,
                predicate: CardPredicates.CENTER_OR_ANY_OTHER_PLAYER,
                skippable: true, promptIsTemporary: true
            });
            if (!playerOrCenterCard)
                return await GameCommands.broadcastAndAwaitOK(`You decline to view a card.`);
            await GameCommands.viewCard(playerOrCenterCard);
            if (playerOrCenterCard.atNow.owner.id === -1) {
                const otherCenterCard = await GameCommands.playerChooseCard({
                    prompt: `You may view another card from the center.`,
                    predicate: CardPredicates.CENTER_AND_NOT_SAME_AS(playerOrCenterCard),
                    skippable: true, promptIsTemporary: true
                });
                if (!otherCenterCard)
                    return await GameCommands.broadcastAndAwaitOK(`You decline to view another card.`);
                await GameCommands.viewCard(otherCenterCard);
            }
        }
    },

    [ActionIDs.APP_SEER$VIEW_OTHER_PLAYER_CARD]: {
        id: ActionIDs.APP_SEER$VIEW_OTHER_PLAYER_CARD,
        description: "You may view another player's card.",
        continuityType: ContinuityTypes.READ_ONLY,
        do: async function(game) {
            const playerCard = await GameCommands.playerChooseCard({
                prompt: `You may choose another player's card to view.`,
                predicate: CardPredicates.ANY_OTHER_PLAYER,
                skippable: true, promptIsTemporary: true
            });
            if (!playerCard)
                return await GameCommands.broadcastAndAwaitOK(`You decline to view a card.`);
            await GameCommands.viewCard(playerCard);
        }
    },

    [ActionIDs.PI$VIEW_2_AND_ABSORB_EVIL_TEAM]: {
        id: ActionIDs.PI$VIEW_2_AND_ABSORB_EVIL_TEAM,
        description: ["You may view up to two other players' cards. If either card is not on the ", Teams[TeamIDs.VILLAGE], " team, you stop looking. The ", Roles[RoleIDs.PARANORMAL_INVESTIGATOR], " takes on the last viewed card's ", {linkTo: "TEAMS", text: "team alignment"}, "."],
        continuityType: ContinuityTypes.READ_WRITE,
        do: async function(game) {
            const pi = GameCommands.getCardInitiallyAt(game.actingCardLocation);
            const playerCard1 = await GameCommands.playerChooseCard({
                prompt: [`You may choose another player's card to view.`],
                predicate: CardPredicates.ANY_OTHER_PLAYER,
                skippable: true, promptIsTemporary: true
            });
            if (!playerCard1) return await GameCommands.broadcastAndAwaitOK("You decline to view a card.");
            await GameCommands.viewCard(playerCard1);
            if (playerCard1.role.team.id !== TeamIDs.VILLAGE) {
                pi.team = playerCard1.role.team;
                return await GameCommands.broadcastAndAwaitOK(["The ", pi.role, " is now on the ", [playerCard1.role.team], " team."]);
            } else {
                const playerCard2 = await GameCommands.playerChooseCard({
                    prompt: [`You may choose yet another player's card to view.`],
                    predicate: CardPredicates.ANY_OTHER_PLAYER_AND_NOT_SAME_AS(playerCard1),
                    skippable: true, promptIsTemporary: true
                });
                if (!playerCard2) return await GameCommands.broadcastAndAwaitOK("You decline to view a card.");
                await GameCommands.viewCard(playerCard2);
                if (playerCard2.role.team.id !== TeamIDs.VILLAGE) {
                    pi.team = playerCard2.role.team;
                    GameCommands.broadcastAndAwaitOK(["The ", pi.role, " is now on the ", [playerCard2.role.team], " team."]);
                }
            }
        }
    },

    [ActionIDs.ROBBER$SWAP_AND_VIEW_OTHER_PLAYER_CARD]: {
        id: ActionIDs.ROBBER$SWAP_AND_VIEW_OTHER_PLAYER_CARD,
        description: "You may swap another player's card with this one, then view your new card.",
        continuityType: ContinuityTypes.READ_WRITE,
        do: async function(game) {
            const actingCard = GameCommands.getCardNowAt(game.actingCardLocation);
            if (actingCard.shielded) return await GameCommands.broadcastAndAwaitOK(
                [`There is a shield on `, actingCard, `, so you cannot swap it.`]
            );
            const otherPlayerCard = await GameCommands.playerChooseCard({
                prompt: [`You may choose another player's card to swap with `, actingCard, ` and view it.`],
                predicate: CardPredicates.ANY_OTHER_PLAYER,
                skippable: true, promptIsTemporary: true
            });
            if (!otherPlayerCard) return await GameCommands.broadcastAndAwaitOK(`You decline to swap your card.`);
            await GameCommands.swap2Cards(actingCard, otherPlayerCard);
            await GameCommands.viewCard(GameCommands.getCardNowAt(game.actingCardLocation));
        }
    },

    [ActionIDs.WITCH$VIEW_AND_SWAP_FROM_CENTER]: {
        id: ActionIDs.WITCH$VIEW_AND_SWAP_FROM_CENTER,
        description: "You may view a card in the center. If you do, you must swap it with any player's card.",
        continuityType: ContinuityTypes.READ_WRITE,
        do: async function(game) {
            const centerCard = await GameCommands.playerChooseCard({
                prompt: `You may choose a card in the center to view and swap with any player's card.`,
                predicate: CardPredicates.CENTER,
                skippable: true, promptIsTemporary: true
            });
            if (!centerCard) return await GameCommands.broadcastAndAwaitOK(`You decline to view a card.`);
            await GameCommands.viewCard(centerCard);
            const playerCard = await GameCommands.playerChooseCard({
                prompt: [`Choose a card to swap with `, centerCard, '.'],
                predicate: CardPredicates.ANY_PLAYER,
                promptIsTemporary: true
            });
            await GameCommands.swap2Cards(playerCard, centerCard);
        }
    },

    [ActionIDs.TROUBLEMAKER$SWAP_TWO_OTHER_PLAYER_CARDS]: {
        id: ActionIDs.TROUBLEMAKER$SWAP_TWO_OTHER_PLAYER_CARDS,
        description: "You may swap two other players' cards (without viewing either.)",
        continuityType: ContinuityTypes.WRITE_ONLY,
        do: async function() {
            const card1 = await GameCommands.playerChooseCard({
                prompt: `You may choose another player's card to swap with yet another player's card.`,
                predicate: CardPredicates.ANY_OTHER_PLAYER,
                skippable: true, promptIsTemporary: true
            });
            if (!card1) return await GameCommands.broadcastAndAwaitOK(`You decline to swap a card.`);
            const card2 = await GameCommands.playerChooseCard({
                prompt: [`Choose a card to swap with `, card1, '.'],
                predicate: CardPredicates.ANY_OTHER_PLAYER_AND_NOT_SAME_AS(card1),
                promptIsTemporary: true
            });
            await GameCommands.swap2Cards(card1, card2);
        }
    },

    [ActionIDs.TROUBLEMAKER_JR$SWAP_TWO_SAME_PLAYER_CARDS]: {
        id: ActionIDs.TROUBLEMAKER_JR$SWAP_TWO_SAME_PLAYER_CARDS,
        description: "You may swap two cards belonging to one player (without viewing either.)",
        continuityType: ContinuityTypes.WRITE_ONLY,
        do: async function() {
            const card1 = await GameCommands.playerChooseCard({
                prompt: `You may choose another player's card to swap with another of their cards.`,
                predicate: CardPredicates.ANY_OTHER_PLAYER_WITH_MULTIPLE_UNSHIELDED_CARDS,
                skippable: true, promptIsTemporary: true
            });
            if (!card1) return await GameCommands.broadcastAndAwaitOK(`You decline to swap a card.`);
            const card2 = await GameCommands.playerChooseCard({
                prompt: [`Choose a card to swap with `, card1, '.'],
                predicate: CardPredicates.SAME_PLAYER_AS_BUT_NOT_SAME_AS(card1),
                promptIsTemporary: true
            });
            await GameCommands.swap2Cards(card1, card2);
        }
    },

    [ActionIDs.VI$SWAP_LEFT_OR_RIGHT]: {
        id: ActionIDs.VI$SWAP_LEFT_OR_RIGHT,
        description: "You may swap all other players' cards upstream or downstream, skipping shielded cards.",
        continuityType: ContinuityTypes.WRITE_ONLY,
        do: async function(game) {
            const direction = await GameCommands.broadcastAndAwaitDecision({
                body: ["You may swap all other players' cards upstream or downstream, skipping shielded cards."],
                responses: [
                    {icon: 'up', name: 'Upstream', response: 'upstream'},
                    {icon: 'down', name: 'Downstream', response: 'downstream'}
                ],
                isSkippable: true, isTemporary: true
            });
            if (!direction) return await GameCommands.broadcastAndAwaitOK("You decline to swap all other players' cards.");
            const cards = game.players.filter(p => p.id !== game.actingPlayer.id)
                .flatMap(p => p.cards.filter(c => !c.shielded));
            if (direction === 'upstream') cards.reverse();
            GameCommands.swapNCards(...cards);
            await GameCommands.broadcastAndAwaitOK(`You swap all other players' cards ${direction}.`);
        }
    },

    [ActionIDs.DRUNK$SWAP_WITH_CENTER]: {
        id: ActionIDs.DRUNK$SWAP_WITH_CENTER,
        description: "Swap your card with a card in the center (without viewing it.)",
        continuityType: ContinuityTypes.WRITE_ONLY,
        do: async function(game) {
            const actingCard = GameCommands.getCardNowAt(game.actingCardLocation);
            if (actingCard.shielded) return await GameCommands.broadcastAndAwaitOK(
                [`There is a shield on `, actingCard, `, so you cannot swap it.`]
            );
            const centerCard = await GameCommands.playerChooseCard({
                prompt: [`You may choose a card in the center to swap with `, actingCard, `.`],
                predicate: CardPredicates.CENTER,
                promptIsTemporary: true
            });
            await GameCommands.swap2Cards(actingCard, centerCard);
        }
    },

    [ActionIDs.BOOMERANGER$COME_BACK]: {
        id: ActionIDs.BOOMERANGER$COME_BACK,
        description: ["The ", Roles[RoleIDs.BOOMERANGER], " returns to its original position."],
        continuityType: ContinuityTypes.READ_WRITE,
        do: async function(game) {
            const boomeranger = GameCommands.getCardInitiallyAt(game.actingCardLocation);
            const actingCard = GameCommands.getCardNowAt(game.actingCardLocation);
            if (boomeranger.shielded) return await GameCommands.broadcastAndAwaitOK(
                [`There is a shield on the`, boomeranger.role, `, so you cannot view it.`]
            );
            if (actingCard.shielded) return await GameCommands.broadcastAndAwaitOK(
                [`There is a shield on `, actingCard, `, so you cannot swap it.`]
            );
            await GameCommands.viewCard(boomeranger);
            if (boomeranger !== actingCard)
                await GameCommands.swap2Cards(boomeranger, actingCard);
        }
    },

    [ActionIDs.INSOMNIAC$VIEW_NEW_CARD]: {
        id: ActionIDs.INSOMNIAC$VIEW_NEW_CARD,
        description: "You may view your card.",
        continuityType: ContinuityTypes.READ_ONLY,
        do: async function(game) {
            const actingCard = GameCommands.getCardNowAt(game.actingCardLocation);
            if (actingCard.shielded) return await GameCommands.broadcastAndAwaitOK(
                [`There is a shield on `, actingCard, `, so you cannot view it.`]
            );
            await GameCommands.viewCard(actingCard);
        }
    },

    [ActionIDs.YOUNSOMNIAC$VIEW_CARD]: {
        id: ActionIDs.YOUNSOMNIAC$VIEW_CARD,
        description: ["You may view the ", Roles[RoleIDs.YOUNSOMNIAC], '.'],
        continuityType: ContinuityTypes.READ_ONLY,
        do: async function(game) {
            const pi = GameCommands.getCardInitiallyAt(game.actingCardLocation);
            if (pi.shielded) return await GameCommands.broadcastAndAwaitOK(
                [`There is a shield on `, pi, `, so you cannot view it.`]
            ); // lol
            await GameCommands.viewCard(pi);
        }
    },

    [ActionIDs.REVEALER$REVEAL_OTHER_PLAYER_CARD]: {
        id: ActionIDs.REVEALER$REVEAL_OTHER_PLAYER_CARD,
        description: ["You may reveal another player's card. If it is not on the ", Teams[TeamIDs.VILLAGE], " team, you must hide it."],
        continuityType: ContinuityTypes.READ_WRITE,
        do: async function(game) {
            const card = await GameCommands.playerChooseCard({
                prompt: [`You may choose another player's card to reveal. If it is not on the `, Teams[TeamIDs.VILLAGE], " team, you must hide it."],
                predicate: CardPredicates.ANY_OTHER_PLAYER_FACE_DOWN,
                skippable: true, promptIsTemporary: true
            });
            await GameCommands.faceUpCard(card);
            if (card.role.team.id !== TeamIDs.VILLAGE) await GameCommands.faceDownCard(card);
        }
    },

    [ActionIDs.PERVERT$REVEAL_SELF]: {
        id: ActionIDs.PERVERT$REVEAL_SELF,
        description: ["The ", Roles[RoleIDs.PERVERT], " reveals itself."],
        continuityType: ContinuityTypes.READ_WRITE,
        do: async function(game) {
            const pervert = GameCommands.getCardInitiallyAt(game.actingCardLocation);
            if (pervert.shielded) return await GameCommands.broadcastAndAwaitOK(
                [`There is a shield on `, pervert, `, so it cannot reveal itself.`]
            ); // lol
            await GameCommands.faceUpCard(pervert);
        }
    },

    [ActionIDs.CURATOR$CURATE]: {
        id: ActionIDs.CURATOR$CURATE,
        description: ["Give a player an ", {linkTo: "ARTIFACTS", text: "artifact"}, " from the center. If it is face-up, you must hide it. You may also reveal an artifact in the center. If the revealed artifact is on a non-", Teams[TeamIDs.VILLAGE], " team, you must hide it."],
        continuityType: ContinuityTypes.READ_WRITE,
        do: async function(game) {
            const player = await GameCommands.playerChoosePlayer({
                prompt: `Choose a player to give an artifact to.`,
                predicate: PlayerPredicates.NO_ARTIFACT,
                promptIsTemporary: true
            });
            const artifact = await GameCommands.playerChooseArtifact({
                prompt: [`Choose an artifact to give to `, player, '.'],
                predicate: ArtifactPredicates.CENTER,
                promptIsTemporary: true
            });
            await GameCommands.givePlayerArtifact(player, artifact);
            const artifactToFlip = await GameCommands.playerChooseArtifact({
                prompt: [`You may choose an artifact to reveal.`],
                predicate: ArtifactPredicates.CENTER_AND_FACE_DOWN,
                promptIsTemporary: true, skippable: true
            });
            if (artifactToFlip) {
                await GameCommands.revealArtifact(artifactToFlip);
                if (artifactToFlip.teamId && artifactToFlip.teamId !== TeamIDs.VILLAGE)
                    await GameCommands.hideArtifact(artifactToFlip);
            }
            else GameCommands.broadcastAndAwaitOK("You decline to reveal an artifact.");
        }
    },

    [ActionIDs.DOPPY$DO_LATER_ACTION]: {
        id: ActionIDs.DOPPY$DO_LATER_ACTION,
        filterEntryFromModal: (roles) => !DOPPY_LATER_ROLE_IDS.some(rId => roles.some(r => r.id === rId)),
        getDescriptionFromRoles: (roles) => ["If the card you viewed as ", Roles[RoleIDs.DOPPELGANGER], " was ", {array: DOPPY_LATER_ROLE_IDS.filter(rId => roles.some(r => r.id === rId)).map(rId => Roles[rId]), delimiter: " or "}, ", perform its ", {linkTo: "ACTIONS", text: "action"}, " now."],
        continuityType: ContinuityTypes.READ_WRITE,
        do: async function(game) {
            const doppy = GameCommands.getCardInitiallyAt(game.actingCardLocation);
            await GameCommands.broadcastAndAwaitOK(["You will now act as ", Roles[doppy.details.roleId], "."]);
            for (const actionId of Roles[doppy.details.roleId].actionIds)
                await GameCommands.doAction(Actions[actionId]);
        }
    },

    [ActionIDs.GENERAL$NOTIFY_RIPPLE]: {
        id: ActionIDs.GENERAL$NOTIFY_RIPPLE,
        description: "If ripples are enabled, a ripple takes place.",
        continuityType: ContinuityTypes.IS_OWN_PHASE, dontRecreateOnServer: true,
        do: async function(game) {
            await GameCommands.broadcastAndAwaitOK(["...to a ", {linkTo: "RIPPLES", text: "ripple"}, "! View the ripple on the host's screen."]);
        }
    },

    [ActionIDs.GENERAL$PREPARE_TO_VOTE]: {
        id: ActionIDs.GENERAL$PREPARE_TO_VOTE,
        description: "All players wake up and discuss the night phase.",
        continuityType: ContinuityTypes.IS_OWN_PHASE, dontRecreateOnServer: true,
        do: async function(game) {
            let ready = 0, statement = "...as does everyone else. You may now discuss the night with the other players! Continue when you are ready to vote.";
            if (game.actingPlayer.artifact) {
                await GameCommands.broadcastAndAwaitOK(["You have an ", {linkTo: "ARTIFACTS", text: "artifact"}, "!"]);
                await GameCommands.viewOwnArtifact(game.actingPlayer.artifact);
                statement = "You may now discuss the night with the other players! Continue when you are ready to vote.";
            }
            while (!ready) {
                await GameCommands.broadcastAndAwaitDecision({body: statement, responses: [{icon: 'check', name: 'Ready', response: 1, teamId: TeamIDs.VILLAGE}], isTemporary: true});
                statement = "Continue when you are REALLY ready to vote.";
                ready = await GameCommands.broadcastAndAwaitDecision({body: "Are you sure you're ready to vote?", responses: [{icon: 'x', name: 'Cancel', response: 0, teamId: TeamIDs.WOLFSDEN}, {icon: 'check', name: 'Ready', response: 1, teamId: TeamIDs.VILLAGE}], isTemporary: true});
            }
            GameCommands.broadcast("You confirm you're ready to vote.");
        }
    },

    [ActionIDs.GENERAL$VOTE]: {
        id: ActionIDs.GENERAL$VOTE,
        description: "Each player votes for one player. Unless all players receive one vote, the player(s) with the most votes will die.",
        continuityType: ContinuityTypes.IS_OWN_PHASE,
        do: async function(game) {
            const player = await GameCommands.playerChoosePlayer({
                prompt: `Vote for the player you want to execute.`,
                predicate: PlayerPredicates.ANY,
                promptIsTemporary: true
            });
            await GameCommands.voteFor(player);
        }
    }
};

export default Actions;
export { ActionIDs, ContinuityTypes };