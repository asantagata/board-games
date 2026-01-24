import context from "../utils/context.js";
import PlayerMenu from "./PlayerMenu.js";
import Game from "./Game.js";
import QuitModal from "./QuitModal.js";
import CardModal from "./CardModal.js";

const App = {
    state() {
        context.rerender = () => this.rerender();
        return {};
    },
    render() {
        return {
            id: 'app',
            children: [
                context.gameStarted ? {
                    ...Game(), key: 'game'
                } : {
                    ...PlayerMenu(), key: 'player-menu'
                },
                ...(context.quitModalOpen ? [{...QuitModal(), key: 'quit-modal'}] : []),
                ...(context.cardModalOpen ? [{...CardModal(), key: 'card-modal'}] : [])
            ]
        };
    }
};

export default App;