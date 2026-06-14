import Teams, { TeamIDs } from "@/data/Teams.js";
import { openModal } from "./Modal.js";
/** @import { Role, Artifact, Team } from "@/types.js" */

/** @param {"HOME" | "ROLES" | "ACTIONS" | "TEAMS" | "ARTIFACTS" | "RIPPLES"} article @param {string} text */
export function ArticleLink(article, text) {
    return {
        tag: 'u', 
        class: 'article-link', 
        on: {click() { openModal(article) }},
        children: text
    };
}

/** @param {Role} role */
export function RoleLink(role) {
    return {
        tag: 'u', 
        class: 'role-link', 
        style: {color: `var(--tx-team-${role.team.name})`}, 
        key: `role-${role.id}`,
        on: {click() { openModal("ROLES", role.id) }},
        children: role.name
    };
}

/** @param {Artifact} artifact */
export function ArtifactLink(artifact) {
    return {
        tag: 'u', 
        class: 'artifact-link', 
        key: `artifact-${artifact.id}`,
        style: {color: `var(--tx-team-${Teams[artifact.teamId ?? TeamIDs.VILLAGE].name})`}, 
        on: {click() { openModal("ARTIFACTS", artifact.id) }},
        children: artifact.name
    };
}

/** @param {Team} team */
export function TeamLink(team) {
    return {
        tag: 'u', 
        class: 'team-link', 
        key: `team-${team.id}`,
        style: {color: `var(--tx-team-${team.name})`}, 
        on: {click() { openModal("TEAMS", team.id) }},
        children: team.name
    };
}