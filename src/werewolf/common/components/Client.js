import context from "@/context.js";
import connection, { Statuses, MessageTypes } from "@/connection.js";
import Loader from "./Loader.js";
import Game from "./Game.js";
import Header from "./Header.js";
import TextInput from "./inputs/TextInput.js";
import Modal from "./Modal.js";

const colors = ["player-rd", "player-br", "player-or", "player-yw", "player-lm", "player-gr", "player-cy", "player-bl", "player-in", "player-pu", "player-mg", "player-wh"];

function JoinModal() {
    if (context.misc.playerColor === undefined)
        context.misc.playerColor = colors[Math.floor(Math.random() * colors.length)];
    if (context.misc.channelName === undefined)
        context.misc.channelName = location.hash.slice(1)
    return {
        class: 'back padded rounded col center gap minheight0',
        children: [
            TextInput(
                () => context.misc.channelName ?? location.hash.slice(1), 
                v => context.misc.channelName = v.toUpperCase(),
                {label: 'Room code', placeholder: 'WXYZ', onInput() {
                    this.target.value = this.target.value.toUpperCase();
                }}
            ),
            TextInput(
                () => context.misc.playerName ?? '', 
                v => context.misc.playerName = v,
                {label: 'Name', placeholder: 'No-name Nelly', inputProps: {
                    style: {color: `var(--${context.misc.playerColor})`}}}
            ),
            {tag: 'label', class: 'fullwidth', children: 'Color'},
            {
                class: 'flex gap flex-wrap', id: 'player-colors', children: colors.map(color => ({
                    class: {swatch: true, 'selected-swatch': context.misc.playerColor === color},
                    style: {'--color': `var(--${color})`},
                    on: {click() { context.misc.playerColor = color; context.rerender(); }}
                }))
            },
            {tag: 'button', children: 'Join', on: {click: async function() {
                connection.channelName = context.misc.channelName;
                let name = context.misc.playerName ?? 'No-name Nelly';
                let color = context.misc.playerColor ?? colors[0]
                await connection.subscribe();
                context.rerender();
                await connection.sendMessage(MessageTypes.JOIN_ROOM, name, color);
                context.rerender();
            }, 
            mount() {if (new URL(location).searchParams.get('instant')) this.target.click()}
            }}
        ]
    };
}

export default function Client() {
    return {
        state() {
            context.rerender = () => this.rerender();
            return {};
        },
        render() {
            return {
                id: 'client', class: 'fullwidth fullheight col minheight0', children: [
                    Header(), ...(context.misc.showModal ? [Modal()] : []), {
                    tag: 'main', 
                    class: 'fullwidth fullheight grow center col minheight0', 
                    key: context.game ? 'game' : connection.status === Statuses.ADMITTED ? 'admitted' : connection.status === Statuses.CONNECTED ? 'connected' : 'loading', 
                    children: (() => {
                        switch (connection.status) {
                            case Statuses.NOT_CONNECTED:
                                return [
                                    Loader(),
                                    {tag: 'i', class: 'hftx', children: "Connecting to game..."}
                                ];
                            case Statuses.CONNECTED:
                                return JoinModal();
                            case Statuses.ATTEMPTING_SUBSCRIBE:
                            case Statuses.SUBSCRIBED:
                            case Statuses.ATTEMPTING_JOIN:
                                return [
                                    Loader(),
                                    {tag: 'i', class: 'hftx', children: "Connecting to room..."}
                                ];
                            case Statuses.ADMITTED:
                                if (context.game) return {...Game(), key: 'game'}
                                return [
                                    Loader(),
                                    {tag: 'i', class: 'hftx', children: `You are in room ${connection.channelName}!`},
                                    {tag: 'i', class: 'hftx', children: "Please wait for the host to configure the game."},
                                ];
                        }
                    })()
                }]
            };
        }
    }
}