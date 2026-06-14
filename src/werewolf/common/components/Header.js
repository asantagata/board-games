import context from "@/context.js";
import connection, { Statuses } from "@/connection.js";
import Icons from "./Icons.js";
import IconButton from "./IconButton.js";
import { startGame } from "@server/serverUtils.js";
import { isConfigInvalid } from "@server/configUtils.js";
import { openModal } from "./Modal.js";
import { MessageTypes } from "@/connection.js";

function RoomCode() {
    return [
        {class: 'padded rounded dark', children: connection.channelName, key: 'channel'},
        IconButton({key: 'curl', children: Icons.copy, on: {click(e) {
            let url = location.href.replace(/\/host\/?/, `/room/${e.ctrlKey ? '?instant=true' : ''}#${connection.channelName}`);
            if (e.ctrlKey) {
                const a = document.createElement('a');
                a.target = '_blank';
                a.href = url;
                a.click();
            } else navigator.clipboard.writeText(url);
        }}}),
    ];
}

function ErrorOrButton() {
    const error = isConfigInvalid();
    if (error)
        return {
            key: 'error', style: {color: 'var(--tx-team-Wolfsden)'}, children: error
        };
    return {
        tag: 'button', key: 'startend', class: 'nowrap',
        children: context.game ? 'End game' : 'Start game',
        on: {click: async function() {
            if (context.game) {
                connection.sendMessage(MessageTypes.END_GAME);
                context.game = null;
                context.misc = {};
                context.rerender();
            } else {
                startGame();
            }
        }} 
    };
}

export default function Header() {
    return {
        id: 'header', key: 'header', class: 'padded gap flex-between', children: [
            {
                class: 'flex gap center',
                children: [
                    {
                        tag: 'a', href: '../', children: IconButton({children: Icons.home})
                    },
                    ...(context.side === "SERVER" && !context.game ? [IconButton({children: Icons.list, on: {click() {
                        openModal("SAVES");
                    }}})] : [])
                ]
            },
            {
                class: 'flex gap center',
                children: [
                    IconButton({children: Icons.book, key: 'book', on: {click() {
                        openModal();
                    }}}),
                    ...(context.side !== "HOME" && connection.status === Statuses.SUBSCRIBED ? RoomCode() : []),
                    ...(context.side === "SERVER" && connection.status === Statuses.SUBSCRIBED ? [ErrorOrButton()] : [])
                ]
            }
        ]
    }
}