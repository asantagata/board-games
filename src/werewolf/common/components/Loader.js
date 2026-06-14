import Artifact from "./Artifact.js";
import { TeamIDs } from "@/data/Teams.js";

const artifacts = [
    {icon: '🐺', teamId: TeamIDs.WOLFSDEN},
    {icon: '🧍', teamId: TeamIDs.VILLAGE}
];

function nextStep() {
    if (!document.getElementById('loader')) {
        return window.clearInterval(this.state.intervalId);
    }
    if (!this.state.faceUp) {
        this.state.artifactId = (this.state.artifactId + 1) % artifacts.length;
        this.state.faceUp = true;
    } else {
        this.state.faceUp = false;
    }
    this.rerender();
}

export default function Loader() {
    return {
        state() {
            return {
                faceUp: false, artifactId: artifacts.length - 1, intervalId: window.setInterval(nextStep.bind(this), 750)
            };
        },
        render() {
            return Artifact({...artifacts[this.state.artifactId], faceUp: this.state.faceUp}, {id: 'loader'});            
        },
        memo: () => false 
    };
}