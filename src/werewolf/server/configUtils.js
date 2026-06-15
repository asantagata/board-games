import context from "@/context.js";
import { ArtifactIDs } from "@/data/Artifacts.js"; 
import { RoleIDs } from "@/data/Roles.js";
import { RippleIDs } from "@/data/Ripples.js";
/** @import { Config } from "@/types.js" */

/** @returns {Config} */
export function ConfigObject() {
    this.roleCounts = {...Object.fromEntries(Object.values(RoleIDs).map(k => [k, 0])),
        [RoleIDs.WEREWOLF]: 1,
        [RoleIDs.SEER]: 1,
        [RoleIDs.ROBBER]: 1,
        [RoleIDs.TROUBLEMAKER]: 1,
        [RoleIDs.INSOMNIAC]: 1,
        [RoleIDs.VILLAGER]: 1,
    };
    this.ripples = Object.fromEntries(Object.values(RippleIDs).map(k => [k, false]));
    this.artifacts = {...Object.fromEntries(Object.values(ArtifactIDs).map(k => [k, false])),
        [ArtifactIDs.MASK_OF_MUTING]: true,
        [ArtifactIDs.CUDGEL_OF_TANNER]: true,
        [ArtifactIDs.SHROUD_OF_SHAME]: true
    };
    this.allMembersSameCount = false;
    this.centerCount = 3;
    this.members = [];

    // this.testingRoleIds = [RoleIDs.VILLAGER, RoleIDs.VILLAGER, RoleIDs.VILLAGER, RoleIDs.ALPHA_WOLF, RoleIDs.WEREWOLF, RoleIDs.DREAM_WOLF];
}

/**
 * Determines config validity. Returns error message if invalid.
 * @param {Config} config 
 * @returns {false | string}
 */
export function isConfigInvalid(config = context.config) {
    if (config.members.length < 2)
        return "More players required.";
    const cardCount = config.members.reduce((acc, cur) => acc += cur.cardCount, 0) + config.centerCount + +config.roleCounts[RoleIDs.ALPHA_WOLF];
    const roleCount = Object.values(config.roleCounts).reduce((acc, cur) => acc += cur, 0);
    if (cardCount !== roleCount) return `${cardCount} cards does not match ${roleCount} roles.`;
    const minimumArtifacts = (config.roleCounts[RoleIDs.CURATOR] + config.roleCounts[RoleIDs.DOPPELGANGER]) * (1 + config.ripples[RippleIDs.TIME_LOOP]);
    if (config.roleCounts[RoleIDs.CURATOR] && Object.values(config.artifacts).filter(s => s).length < minimumArtifacts)
        return `Curator requires at least ${minimumArtifacts} artifact${minimumArtifacts > 1 ? 's' : ''}.`
    if (config.roleCounts[RoleIDs.ALPHA_WOLF] && !config.roleCounts[RoleIDs.WEREWOLF])
        return "Alpha Wolf requires a Werewolf.";
    return false;
}