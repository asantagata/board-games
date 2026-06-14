import context from "@/context.js";
import connection, { MessageTypes } from "@/connection.js";
import Icons from "./Icons.js";
import IconButton from "./IconButton.js";
import NumberInput from "./inputs/NumberInput.js";
import Checkbox from "./inputs/Checkbox.js";
import Roles, { RoleIDs, RolePacks } from "@/data/Roles.js";
import Artifacts from "@/data/Artifacts.js";
import Ripples from "@/data/Ripples.js";
import { Face } from "./Card.js";
import { openModal } from "./Modal.js";
import { ArtifactFace } from "./Artifact.js";
import { ArticleLink } from "./Links.js";
import markdownToFRUIT from "@/utils/markdown.js";

function PlayerList() {
    const cardCount = context.config.members.reduce((acc, cur) => acc += cur.cardCount, 0) + context.config.centerCount + +context.config.roleCounts[RoleIDs.ALPHA_WOLF];
    return {
        class: 'padded col grow dkbk overflow-auto',
        children: [
            {class: 'gap center justify-content-start', children: [
                {tag: 'h3', class: 'line-after', children: 'Players & Cards'},
                {class: 'nowrap hftx', children: `${cardCount} card${cardCount !== 1 ? 's' : ''}`}
            ]},
            {tag: 'table', children: [
                ...(context.config.roleCounts[RoleIDs.ALPHA_WOLF]
                    ? [{tag: 'tr', key: 'alpha', children: [
                    {tag: 'td', class: 'small-td'},
                    {tag: 'td', children: {class: 'line-after table-pad-right', style: {color: 'var(--tx-team-Wolfsden)'}, children: 'Alpha'}},
                    {tag: 'td', class: 'small-td', children: NumberInput(
                        () => 1, () => {}, {inputProps: {disabled: true}}
                    )}
                ]}] : []),
                {tag: 'tr', key: 'center', children: [
                    {tag: 'td', class: 'small-td'},
                    {tag: 'td', children: {class: 'line-after table-pad-right', children: 'Center'}},
                    {tag: 'td', class: 'small-td', children: NumberInput(
                        () => context.config.centerCount, v => context.config.centerCount = v,
                        {inputProps: {min: 1, step: 1, max: 99}}
                    )}
                ]},
                ...context.config.members.map(member => ({
                    tag: 'tr', key: member.browserId, children: [
                        {tag: 'td', class: 'small-td', children: IconButton({children: Icons.x, on: {click() {
                            context.config.members = context.config.members.filter(m => m !== member);
                            connection.sendMessage(MessageTypes.KICK_PLAYER, member.browserId);
                            context.rerender();
                        }}})},
                        {tag: 'td', children: {class: 'line-after table-pad-right', children: member.name}, style: {color: `var(--${member.color})`}},
                        {tag: 'td', class: 'small-td', children: NumberInput(
                            () => member.cardCount, v => {
                                member.cardCount = v
                                if (context.config.allMembersSameCount) {
                                    context.config.members.forEach(m => m.cardCount = v);
                                }
                            },
                            {inputProps: {min: 1, step: 1, max: 99, class: 'member-input-count', disabled: 
                                context.config.allMembersSameCount
                                && context.config.members.indexOf(member) > 0
                                || undefined
                            }}
                        )},
                    ]
                })),
                ...(context.config.members.length > 1 ? [{tag: 'tr', key: 'same', children: [
                    {tag: 'td', class: 'small-td'},
                    {tag: 'td', children: {class: 'line-after table-pad-right', children: 'Same card count for all players?'}},
                    {tag: 'td', class: 'small-td', children: {class: 'center', children: Checkbox(
                        () => context.config.allMembersSameCount,
                        v => {
                            context.config.allMembersSameCount = v;
                            const count = context.config.members[0]?.cardCount;
                            if (v && count) context.config.members.forEach(m => m.cardCount = count);
                        }
                    )}}
                ]}] : [])
            ]}
        ]
    };
}

function RippleList() {
    return {
        class: 'padded col grow back overflow-auto',
        children: [
            {class: 'gap center justify-content-start', children: [
                {tag: 'h3', class: 'line-after', children: ArticleLink("RIPPLES", "Ripples")},
                Checkbox(
                    () => Object.values(context.config.ripples).some(r => r),
                    v => {
                        for (const i in context.config.ripples)
                            context.config.ripples[i] = v;
                    }
                )
            ]},
            {tag: 'table', children: Object.keys(context.config.ripples).map(rippleId => ({
                tag: 'tr', key: `${rippleId}`, children: [
                    {tag: 'td', children: [
                        {class: 'gap center', children: [
                            {tag: 'h4', class: 'line-after', children: `${Ripples[+rippleId].icon} ${Ripples[+rippleId].name}`},
                            Checkbox(
                                () => context.config.ripples[rippleId],
                                v => context.config.ripples[rippleId] = v
                            ),
                        ]},
                        {class: 'hftx', children: markdownToFRUIT(Ripples[+rippleId].description)}
                    ]},
                ]
            }))}
        ]
    };
}

function RoleList() {
    const roleCount = Object.values(context.config.roleCounts).reduce((acc, cur) => acc += cur, 0);
    return {
        class: 'padded col grow dark overflow-auto',
        children: [
            {class: 'gap center justify-content-start', children: [
                {tag: 'h3', class: 'line-after', children: ArticleLink("ROLES", "Roles")},
                {class: 'nowrap hftx', children: `${roleCount} role${roleCount !== 1 ? 's' : ''}`}
            ]},
            {
                children: Object.values(RolePacks).map(pack => ({
                    children: [
                        {tag: 'h4', class: 'line-after', children: pack.name},
                        {class: 'padded gap flex-wrap', children: Object.values(Roles).filter(r => r.rolePack === pack)
                            .flatMap(r => Array.from({length: r.maxCount ? Math.min(r.maxCount, context.config.roleCounts[r.id] + 1) : 1}, (_, ix) => Face(r, {
                                key: `${r.id}#${ix}`,
                                class: {'config-face': true, 'not-selected': ix >= context.config.roleCounts[r.id]},
                                on: {click() {
                                    if (ix < context.config.roleCounts[r.id]) {
                                        context.config.roleCounts[r.id]--;
                                    } else {
                                        context.config.roleCounts[r.id]++;
                                    }
                                    context.rerender();
                                }, contextmenu(e) {
                                    e.preventDefault();
                                    openModal("ROLES", r.id);
                                }}
                            })))}
                    ]
                }))
            }
        ]
    };
}

function ArtifactList() {
    const artifactCount = Object.values(context.config.artifacts).filter(a => a).length;
    return {
        class: 'padded col dkbk overflow-auto shrink-0',
        children: [
            {class: 'gap center justify-content-start', children: [
                {tag: 'h3', class: 'line-after', children: ArticleLink("ARTIFACTS", "Artifacts")},
                {class: 'nowrap hftx', children: `${artifactCount} artifact${artifactCount !== 1 ? 's' : ''}`}
            ]},
            {
                class: 'padded gap flex-wrap',
                children: Object.values(Artifacts).map(artifact => ArtifactFace(artifact, {
                    class: {'config-artifact': true, 'not-selected': !context.config.artifacts[artifact.id]},
                    on: {click() {
                        context.config.artifacts[artifact.id] = !context.config.artifacts[artifact.id];
                        context.rerender();
                    }, contextmenu(e) {
                        e.preventDefault();
                        openModal("ARTIFACTS", artifact.id);
                    }}
                }))
            }
        ]
    };
}

export default function ConfigComponent() {
    return {
        class: 'flex fullwidth fullheight minwidth0', children: [
            {
                class: 'grid2row shrink-0', id: 'config-sidebar',
                children: [ PlayerList(), RippleList() ]
            },
            {
                class: 'grow col minheight0',
                children: [ RoleList(), ...(context.config.roleCounts[RoleIDs.CURATOR] ? [ArtifactList()] : []) ]
            }
        ]
    };
}
