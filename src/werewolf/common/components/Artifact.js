import context from "@/context.js";
import Teams, { TeamIDs } from "@/data/Teams.js";
import { openModal } from "./Modal.js";
/** @import { Artifact } from "@/types.js" */

/**
 * An artifact
 * @param {Artifact} artifact
 * @param {Object?} artifactProps
 */
export default function Artifact(artifact, artifactProps = {}) {
    return {
        class: {artifact: true, 'face-up': context.misc.showAll || artifact.faceUp}, children: [
            ArtifactFace(artifact, {on: {contextmenu(e) { 
                e.preventDefault();
                if (this.target.closest('#loader')) return;
                openModal("ARTIFACTS", artifact.id); }}}),
            ArtifactFace("BACK")
        ], ...artifactProps
    }
}

/**
 * A face of an artifact
 * @param {Artifact | "BACK"} artifact 
 * @param {Object?} faceProps
 */
export function ArtifactFace(artifact, faceProps = {}) {
    if (artifact === "BACK") return { class: 'artifact-face artifact-back-face', children: '?' };
    const {class: faceClass = {}, style: faceStyle = {}, ...usableFaceProps} = faceProps;
    const color = Teams[artifact.teamId]?.name ?? Teams[TeamIDs.VILLAGE].name;
    return {
        class: {'artifact-face': true, 'artifact-front-face': artifact !== "BACK", ...faceClass},
        style: {'--bg': `var(--bg-team-${color})`, '--tx': `var(--tx-team-${color})`, ...faceStyle},
        children: {class: 'face-icon', children: artifact.icon},
        ...usableFaceProps
    };
}