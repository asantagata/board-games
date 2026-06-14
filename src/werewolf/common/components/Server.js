import context from "@/context.js";
import connection, { Statuses } from "@/connection.js";
import Loader from "./Loader.js";
import ConfigComponent from "./Config.js";
import Header from "./Header.js";
import Modal from "./Modal.js";
import markdownToFRUIT from "@/utils/markdown.js";
import Game from "./Game.js";

export default function Server() {
    return {
        state() {
            context.rerender = () => this.rerender();
            return {};
        },
        render() {
            return {
                id: 'server', class: 'fullwidth fullheight col', children: [
                    Header(), ...(context.misc.showModal ? [Modal()] : []), {
                    tag: 'main', 
                    class: 'fullwidth fullheight center col grow minheight0', 
                    key: context.game ? 'game' : `${connection.status === Statuses.SUBSCRIBED}`, 
                    children: (() => {
                        switch (connection.status) {
                            case Statuses.NOT_CONNECTED:
                                return [
                                    Loader(),
                                    {tag: 'i', class: 'hftx', children: "Connecting to game..."}
                                ];
                            case Statuses.CONNECTED:
                            case Statuses.ATTEMPTING_SUBSCRIBE:
                                return [
                                    Loader(),
                                    {tag: 'i', class: 'hftx', children: "Connecting to room..."}
                                ];
                            case Statuses.SUBSCRIBED:
                                if (context.game)
                                    return ServerDuringGame();
                                return ConfigComponent();
                        }
                    })()
                }]
            };
        }
    }
}

function ServerDuringGame() {
    if (context.misc.showingGame) return {...Game(), key: 'game'};
    if (!context.misc.displayRipple) 
        return [
            {...Loader(), key: 'loader'}, 
            {tag: 'i', class: 'hftx', children: "Night phase in progress...", key: 'progress'}
        ]; 
    return [
        {...Loader(), key: 'loader'}, 
        {tag: 'i', class: 'hftx', children: "A ripple occurs!", key: 'ripple'},
        {tag: 'h2', children: `${context.game.ripple.icon} ${context.game.ripple.name}`, key: 'name'},
        {tag: 'h3', children: markdownToFRUIT(context.game.ripple.announcement), key: 'announcement'}
    ];
    
}