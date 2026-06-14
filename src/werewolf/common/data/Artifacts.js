import Teams, { TeamIDs } from "./Teams.js";
import { evaluatePlayerCardsWin } from "@/utils/win.js";
/** @import { Artifact } from "@/types.js" */

/**
* This file contains definitions for all Artifacts.
* To introduce a new artifact, add a new unique entry to ArtifactIDs and the Artifacts object.
* Add new artifacts to the end of the list.
*/

let artifactId = 1;
const ArtifactIDs = {
    MASK_OF_MUTING: artifactId++,
    SHROUD_OF_SHAME: artifactId++,
    CLAW_OF_WEREWOLF: artifactId++,
    CUDGEL_OF_TANNER: artifactId++,
    BRAND_OF_VILLAGER: artifactId++,
    VOID_OF_NOTHINGNESS: artifactId++,
    DAGGER_OF_TRAITOR: artifactId++
}

/** @type {Object.<number, Artifact>} */
const Artifacts = {
    [ArtifactIDs.MASK_OF_MUTING]: {
        id: ArtifactIDs.MASK_OF_MUTING,
        name: "Mask of Muting",
        icon: "😶",
        description: "You cannot speak this round!",
    },
    [ArtifactIDs.SHROUD_OF_SHAME]: {
        id: ArtifactIDs.SHROUD_OF_SHAME,
        name: "Shroud of Shame",
        icon: "🥺",
        description: "You must avert your gaze this round!",
    },
    [ArtifactIDs.CLAW_OF_WEREWOLF]: {
        id: ArtifactIDs.CLAW_OF_WEREWOLF,
        name: "Claw of the Werewolf",
        icon: "🐾",
        teamId: TeamIDs.WOLFSDEN,
        description: ["You are now on the ", Teams[TeamIDs.WOLFSDEN], " team!"],
        didPlayerWin: (player) => Teams[TeamIDs.WOLFSDEN].didPlayerWin(player)
    },
    [ArtifactIDs.CUDGEL_OF_TANNER]: {
        id: ArtifactIDs.CUDGEL_OF_TANNER,
        name: "Cudgel of the Tanner",
        icon: '🔨',
        teamId: TeamIDs.TANNER,
        description: ["You are now on the ", Teams[TeamIDs.TANNER], " team!"],
        didPlayerWin: (player) => Teams[TeamIDs.TANNER].didPlayerWin(player)
    },
    [ArtifactIDs.BRAND_OF_VILLAGER]: {
        id: ArtifactIDs.BRAND_OF_VILLAGER,
        name: "Brand of the Villager",
        icon: '🧹',
        teamId: TeamIDs.VILLAGE,
        description: ["You are now on the ", Teams[TeamIDs.VILLAGE], " team!"],
        didPlayerWin: (player) => Teams[TeamIDs.VILLAGE].didPlayerWin(player)
    },
    [ArtifactIDs.VOID_OF_NOTHINGNESS]: {
        id: ArtifactIDs.VOID_OF_NOTHINGNESS,
        name: "Void of Nothingness",
        description: "Nothing happens to you!",
        icon: '🌌'
    },
    [ArtifactIDs.DAGGER_OF_TRAITOR]: {
        id: ArtifactIDs.DAGGER_OF_TRAITOR,
        name: "Dagger of the Traitor",
        description: "Your win condition is inverted!",
        icon: '🗡️',
        didPlayerWin: (player) => !evaluatePlayerCardsWin(player)
    },
}

export { ArtifactIDs };
export default Artifacts;