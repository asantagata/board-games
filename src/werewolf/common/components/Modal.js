import context from "@/context.js";
import IconButton from "./IconButton.js";
import Icons from "./Icons.js";
import Checkbox from "./inputs/Checkbox.js";
import Roles, { RoleIDs, RolePacks } from "@/data/Roles.js";
import Teams, { TeamIDs } from "@/data/Teams.js";
import ActionIDs from "@/data/ActionIDs.js";
import Ripples from "@/data/Ripples.js";
import Artifacts from "@/data/Artifacts.js";
import Actions, { ContinuityTypes } from "@/data/Actions.js";
import { RoleLink, ArticleLink, TeamLink } from "./Links.js";
import markdownToFRUIT from "@/utils/markdown.js"
import { getSaves, saveToSlot, getDateTimeStr, deleteSave, loadSave } from "@server/persistence.js";
import TextInput from "./inputs/TextInput.js";
/** @import { Role, Action, Team, Artifact, Ripple } from "@/types.js" */

/** @typedef {"HOME" | "ROLES" | "ACTIONS" | "TEAMS" | "ARTIFACTS" | "RIPPLES" | "SAVES"} Article */

const HomeBody = {
    tag: 'article', class: 'gap col', children: [
        {tag: 'p', children: [{tag: 'i', children: "One Night Ultimate Werewolf"}, " is a social-deduction game for 3 or more players. This is an engine for a variant of ", {tag: 'i', children: "ONUW"}, " with several notable differences, namely allowing multiple roles per player."]},
        {tag: 'p', children: ["To start ", {tag: 'i', children: "ONUW"}, ", players agree upon a selection of ", ArticleLink("ROLES", "roles"), ". The corresponding cards are shuffled and dealt to players and the center."]},
        {tag: 'p', children: ["When assigned to a player, each role has its own set of ", ArticleLink("ACTIONS", "actions"), ", which are to be completed secretly over the 'night phase.' These actions generally involve learning about other players' cards or swapping cards between players."]},
        {tag: 'p', children: ["Some roles' actions allow them to interact with other elements. Notably, the ", RoleLink(Roles[RoleIDs.SENTINEL]), " can ", {tag: 'i', children: "shield"}, " cards, which prevents that card from being viewed or displaced, & the ", RoleLink(Roles[RoleIDs.CURATOR]), " role can assign players ", ArticleLink("ARTIFACTS", "artifacts"), ", which can influence their owners' abilities or win conditions."]},
        {tag: 'p', children: ["Some versions of the game include ", ArticleLink("RIPPLES", "ripples"), " which add random extra actions to the end of the night phase."]},
        {tag: 'p', children: ["After the night phase, all players open their eyes and discuss what went on overnight. At this point, some players' cards will have changed, and they may not know it. ", {tag: 'i', children: "A player's role(s), as of this point, are considered to be whatever card(s) they currently possess"}, ", which they will likely not know for certain! It's in everyone's best interest to deduce their new role(s) by talking with the other players, and offering what information they have — or, as an ", {tag: 'i', children: "evil"}, " role, by lying and ambiguating to protect themself."]},
        {tag: 'p', children: ["At the end of the game, all players cast one vote, and the player(s) sharing the most votes die.", {tag: 'sup', children: '1'}, " Each role belongs to a ", ArticleLink("TEAMS", "team"), " which determines the win condition of the player holding it. (For multi-role play, certain teams take priority over others.)"]},
        {tag: 'p', class: 'hftx', children: [{tag: 'sup', children: '1'}, {tag: 'i', children: " If all players receive exactly one vote (for instance, all players voted for themselves), then no players die."}]}
    ]
};

function RolesBody() {
    /** @type {Role[]} */
    let roles = Object.values(Roles);
    let cardCounts = {};
    if (context.game) {
        for (const card of context.game.cards) {
            if (cardCounts[card.role.id]) cardCounts[card.role.id]++
            else cardCounts[card.role.id] = 1;
        }
        if (context.misc.modalFilter) roles = roles.filter(r => cardCounts[r.id]);
    } else if (context.config) {
        cardCounts = context.config.roleCounts;
        if (context.misc.modalFilter) roles = roles.filter(r => context.config.roleCounts[r.id]);
    }
    let packs = Object.values(RolePacks)
        .map(p => ({...p, roles: roles.filter(r => r.rolePack === p)})).filter(p => p.roles.length);
    return {tag: 'article', class: 'gap col', children: [
        {key: 'intro', children: [{tag: 'i', children: "Roles"}, " decide players' ", ArticleLink("ACTIONS", "overnight actions"), " & ", ArticleLink("TEAMS", "team alignment"), ". At the start of the game, a selection of roles are shuffled and distributed to players & the center."]},
        ...packs.map(pack => ({
        key: pack.name, children: [
            {tag: 'h4', class: 'line-after', children: pack.name},
            {class: 'padded-left', children: pack.roles.map(r => ({
                key: r.id, id: `article-entry-${r.id}`, children: [
                    {
                        tag: 'p', children: [
                            {tag: 'b', children: `${r.icon} ${r.name}`},
                            ...(cardCounts[r.id] ? [{tag: 'span', class: 'hftx', children: ` (${cardCounts[r.id]})`}] : []),
                            {tag: 'span', class: 'hftx', children: ' • '},
                            TeamLink(r.team),
                        ]
                    },
                    ...((r.displayActionIds ?? r.actionIds).length ? (r.displayActionIds ?? r.actionIds).filter(aId => !context.misc.modalFilter || !Actions[aId].filterEntryFromModal || !Actions[aId].filterEntryFromModal?.(roles)).map(aId => ({
                        tag: 'p', class: 'hftx indented', children: [
                            {tag: 'u', children: `#${aId}`, on: {click() { openModal("ACTIONS", aId); }}}, 
                            ` — `, 
                            ...markdownToFRUIT(Actions[aId]?.getDescriptionFromRoles?.(roles) ?? Actions[aId]?.description ?? "We don't know what this does.")
                        ]
                    })) : [
                        {tag: 'p', class: 'hftx indented', children: {tag: 'i', children: `(No actions.)`}}
                    ])
                ]
            }))}
        ]}))
    ]
    } 
}

function ActionsBody() {
    /** @type {Role[]} */
    let roles = Object.values(Roles);
    let cardCounts = {};
    if (context.game) {
        for (const card of context.game.cards) {
            if (cardCounts[card.role.id]) cardCounts[card.role.id]++
            else cardCounts[card.role.id] = 1;
        }
        if (context.misc.modalFilter) roles = roles.filter(r => cardCounts[r.id]);
    } else if (context.config) {
        cardCounts = context.config.roleCounts;
        if (context.misc.modalFilter) roles = roles.filter(r => context.config.roleCounts[r.id]);
    }
    let actions = Object.values(Actions);
    const actionIdRoles = {};
    for (const role of roles) {
        for (const actionId of role.displayActionIds ?? role.actionIds) {
            if (!actionIdRoles[actionId])
                actionIdRoles[actionId] = [role];
            else if (!actionIdRoles[actionId].includes(role))
                actionIdRoles[actionId].push(role);
        }
    }
    if (context.misc.modalFilter && (context.game || context.config))
        actions = actions.filter(a => {
            if (a.filterEntryFromModal) return !a.filterEntryFromModal(roles);
            if (actionIdRoles[a.id]) return true;
            if (a.id === ActionIDs.GENERAL$NOTIFY_RIPPLE) 
                return context.game?.rippleIds.length || Object.values(context.config?.ripples || {}).some(v => v);
            return a.continuityType === ContinuityTypes.IS_OWN_PHASE
        });
    return {tag: 'article', class: 'gap col', children: [
        {key: 'intro', children: [{tag: 'i', children: "Actions"}, " are the individual tasks players complete in secret during the game. These are decided by players' assigned ", ArticleLink("ROLES", "roles"), ". Night actions take place in the following order:"]},
        ...actions.map(action => ({
        tag: 'p', key: `${action.id}`, id: `article-entry-${action.id}`, children: [
            {tag: 'span', class: 'hftx', children: `#${action.id} — `},
            ...(actionIdRoles[action.id] ? [
                {tag: 'span', children: markdownToFRUIT(actionIdRoles[action.id], true)},
                {tag: 'span', class: 'hftx', children: ": "},
            ] : []),
            {tag: 'span', children: markdownToFRUIT(action.getDescriptionFromRoles?.(roles) ?? action.description ?? "We don't know what this does.")}
        ]
    }))]};
}

function TeamsBody() {
    let teams = Object.values(Teams);
    if (context.game && context.misc.modalFilter)
        teams = teams.filter(t => context.game.cards.some(c => c.role.team === t));
    else if (context.config && context.misc.modalFilter)
        teams = teams.filter(t => Object.values(Roles).some(r => r.team === t && context.config.roleCounts[r.id]));
    return {tag: 'article', class: 'gap col', children: [
        {key: 'intro', children: [{tag: 'i', children: "Teams"}, " are groups of players with a common win condition. These are decided by players' assigned ", ArticleLink("ROLES", "roles"), ". In games with multiple cards per player, the ", {tag: 'i', children: "last"}, " team on this list takes priority for each player. In games with ", ArticleLink("ARTIFACTS", "artifacts"), ", an artifact might have override over a role-based team alignment."]},
        ...teams.map(team => ({
        key: `${team.id}`, id: `article-entry-${team.id}`,
        children: [
            {tag: 'p', children: {tag: 'b', style: {color: `var(--tx-team-${team.name})`}, children: team.name}},
            {tag: 'p', class: 'padded-left indented', children: markdownToFRUIT(team.description)}
        ]
    }))]};
}

function RipplesBody() {
    /** @type {Ripple[]} */
    let ripples = Object.values(Ripples);
    if (context.game && context.misc.modalFilter)
        ripples = ripples.filter(r => context.game.rippleIds.includes(r.id));
    else if (context.config && context.misc.modalFilter)
        ripples = ripples.filter(r => context.config.ripples[r.id]);
    return {tag: 'article', class: 'gap col', children: [
        {key: 'intro', children: [{tag: 'i', children: "Ripples"}, " are a selection of random bonus actions that can take place at the end of the night phase."]},
        ...ripples.map(ripple => ({
            key: `${ripple.id}`, id: `article-entry-${ripple.id}`,
            children: [
                {tag: 'p', children: `${ripple.icon} ${ripple.name}`},
                {tag: 'p', class: 'padded-left indented hftx', children: markdownToFRUIT(ripple.description)}
            ]
        }))
    ]};
}

function ArtifactsBody() {
    /** @type {Artifact[]} */
    let artifacts = Object.values(Artifacts);
    if (context.game && context.misc.modalFilter) {
        artifacts = artifacts.filter(a => 
            context.game.center.artifacts.some(ca => ca.id === a.id)
            || context.game.players.some(p => p.artifact?.id === a.id)
        );
    }
    else if (context.config && context.misc.modalFilter && context.config.roleCounts[RoleIDs.CURATOR])
        artifacts = artifacts.filter(a => context.config.artifacts[a.id]);
    return {tag: 'article', class: 'gap col', children: [
        {key: 'intro', children: [{tag: 'i', children: "Artifacts"}, " are special tokens distributed to players by the ", RoleLink(Roles[RoleIDs.CURATOR]), ". These can affect players' abilities or override their ", ArticleLink("TEAMS", "team alignment"), "."]},
        ...artifacts.map(artifact => ({
            key: `${artifact.id}`, id: `article-entry-${artifact.id}`,
            children: [
                {tag: 'p', children: `${artifact.icon} ${artifact.name}`},
                {tag: 'p', class: 'padded-left indented hftx', children: markdownToFRUIT(artifact.description)}
            ]
        }))
    ]};
}

function SavesBody() {
    if (!context.permamisc.saves) context.permamisc.saves = getSaves();
    if (context.permamisc.naming) return [
        {
            key: 'name', class: 'flex center col gap', children: [
                TextInput(
                    () => context.permamisc.saveName ?? location.hash.slice(1), 
                    v => context.permamisc.saveName = v,
                    {label: 'Name', placeholder: 'Untitled configuration'}
                ),
                {
                    tag: 'button', children: 'Save', on: {click() {
                        context.permamisc.resolveName(context.permamisc.saveName);
                    }}
                }
            ]
        }
    ];
    const nowDate = new Date();
    return {
        key: 'list', children: [
            {
                class: 'flex center gap col', children: [
                    {
                        class: 'flex center gap', key: 'buttons',
                        children: [
                            ...(Object.keys(context.permamisc.saves).length < 20 ? [
                                {tag: 'button', key: 'new', children: 'Save configuration to new slot', on: {click: async () => {
                                    const slot = Array.from({length: 20}, (_, i) => i + 1).find(i => !context.permamisc.saves[i]);
                                    const name = await getNewSaveName();
                                    if (name === null) return;
                                    saveToSlot({ config: context.config, name, slot });
                                    context.rerender();
                                }}},
                                {tag: 'span', class: 'hftx', children: '•'}
                            ] : []),
                            {tag: 'i', class: 'hftx', children: `${Object.keys(context.permamisc.saves).length} / 20 slots used`}
                        ]
                    },
                    ...Object.keys(context.permamisc.saves).length ? Object.values(context.permamisc.saves).map(save => SaveRow(save, nowDate)) : [{tag: 'i', class: 'hftx', children: 'No saved configurations'}]
                ]
            }
        ]
    };
}

function SaveRow(save, nowDate) {
    const rolesStr = Object.entries(save.config.roleCounts).map(([rId, count]) => Roles[rId].icon.repeat(count)).join('');
    const artifactsStr = Object.entries(save.config.artifacts).map(([aId, whether]) => Artifacts[aId].icon.repeat(+whether)).join('');
    const ripplesStr = Object.entries(save.config.ripples).map(([rId, whether]) => Ripples[rId].icon.repeat(+whether)).join('');
    return {
        class: 'save flex col', key: `${save.slot}`, children: [
            {tag: 'h3', class: 'line-after', children: [save.name.trim() || {tag: 'i', class: 'hftx', children: 'Untitled configuration'}, {tag: 'span', class: 'hftx', children: ` • ${getDateTimeStr(save.datetime, nowDate)}`}]},
            {
                class: 'flex gap flex-between', children: [
                    {
                        class: 'flex col padded-left', children: [
                            {children: [{tag: 'i', class: 'hftx', children: rolesStr ? 'Roles: ': 'No roles'}, rolesStr]},
                            {children: [{tag: 'i', class: 'hftx', children: artifactsStr ? 'Artifacts: ': 'No artifacts'}, artifactsStr]},
                            {children: [{tag: 'i', class: 'hftx', children: ripplesStr ? 'Ripples: ': 'No ripples'}, ripplesStr]},
                        ]
                    },
                    {
                        class: 'flex center',
                        children: [
                            IconButton({children: Icons.open, title: 'Open', on: {click() {
                                loadSave(save);
                                closeModal();
                            }}}),
                            IconButton({children: Icons.save, title: 'Save over', on: {click: async () => {
                                const name = await getNewSaveName(save.name.trim());
                                if (name === null) return;
                                saveToSlot({ config: context.config, name, slot: save.slot });
                                context.rerender();
                            }}}),
                            IconButton({children: Icons.x, style: {color: 'var(--tx-team-Wolfsden)', '--text': 'var(--tx-team-Wolfsden)'}, title: 'Delete', on: {click() {
                                deleteSave(save);
                            }}}),
                        ]
                    }
                ]
            }
        ]
    };
}

async function getNewSaveName(givenName = '') {
    context.permamisc.naming = true;
    context.permamisc.saveName = givenName;
    return await new Promise(resolve => {
        context.permamisc.resolveName = (n) => {
            resolve(n);
            context.permamisc.naming = false;
            context.permamisc.resolveName = null;
            context.rerender();
        };
        context.rerender();
    })
}

function ModalBody() {
    switch (context.misc.modalArticle) {
        case null: case undefined: case "HOME": return HomeBody;
        case "ROLES": return RolesBody();
        case "ACTIONS": return ActionsBody();
        case "TEAMS": return TeamsBody();
        case "RIPPLES": return RipplesBody();
        case "ARTIFACTS": return ArtifactsBody();
        case "SAVES": return SavesBody();
        default:
            return {tag: 'p', children: context.misc.modalArticle}
    }
}

function ModalComponent() {
    return {
        render() {
            return {
                id: 'modal', class: 'back padded rounded gap col maxsize-100', children: [
                    {class: 'flex-between gap', key: 'buttons', children: [
                        ...(context.misc.modalArticle === "SAVES" ? (
                            context.permamisc.naming ? [IconButton({key: 'naming', 
                                children: Icons.left,
                                on: {click() {
                                if (context.permamisc.resolveName) 
                                    context.permamisc.resolveName(null);
                            }}})] : [{key: 'not-naming'}]
                        ) : 
                            [IconButton({children: Icons.home, on: {click() {
                                openModal("HOME");
                            }}})]
                        ),
                        IconButton({children: Icons.x, on: {click() { closeModal(); }}})
                    ]},
                    ...((context.game || context.config) && context.misc.modalArticle && context.misc.modalArticle !== "HOME" && context.misc.modalArticle !== "SAVES" ? [{key: 'filter', class: 'flex gap', children: [
                        {class: 'line-after hftx', children: "Only show items in this game?"},
                        Checkbox(
                            () => context.misc.modalFilter ?? false,
                            v => context.misc.modalFilter = v
                        )
                    ]}] : []),
                    {class: 'maxsize-100 overflow-auto', key: `${context.misc.modalArticle}`, children: ModalBody()}
                ]
            };
        },
        memo() {
            if (context.misc.modalArticle === "SAVES") {
                context.misc.saveSwitch = !context.misc.saveSwitch;
                return context.misc.saveSwitch;   
            }
            return {
                showModal: context.misc.showModal,
                modalArticle: context.misc.modalArticle,
                modalFilter: context.misc.modalFilter,
                inGame: !!context.game
            }
        }
    };
}

export default function Modal() {
    return {key: 'modal', id: 'modal-wrapper', class: 'center padded', on: {click(e) {
        if (e.target === this.target) closeModal();
    }}, children: ModalComponent()};
}

/**
 * @param {Article?} article
 * @param {number?} sectionId
 */
export function openModal(article, sectionId) {
    context.permamisc.naming = false;
    context.misc.showModal = true;
    if (context.misc.modalArticle === "SAVES") context.misc.modalArticle = "HOME";
    if (article) context.misc.modalArticle = article;
    context.rerender();
    if (sectionId !== undefined) 
        document.getElementById(`article-entry-${sectionId}`)?.scrollIntoView({behavior: "smooth", block: "center"});
}

function closeModal() {
    context.misc.showModal = false; context.rerender();
    if (context.permamisc.resolveName) context.permamisc.resolveName(null);
}