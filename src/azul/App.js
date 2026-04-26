import context from "./context.js";
import PlayerMenu from "./PlayerMenu.js";
import Game from "./Game.js";

const App = {
    state() {
        context.rerender = () => this.rerender();
        return {};
    },
    render() {
        return {
            id: 'app',
            class: 'fullheight',
            children: [
                context.gameStarted ? {
                    ...Game(), key: 'game'
                } : {
                    ...PlayerMenu(), key: 'player-menu'
                }
            ]
        };
    }
};

export default App;