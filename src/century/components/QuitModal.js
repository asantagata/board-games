import context from "../utils/context.js";

export default function QuitModal() {
    return {
        class: 'modal-wrapper',
        id: 'quit-modal-wrapper',
        on: {click(event) {
            if (!event.target.closest('#quit-modal')) {
                context.quitModalOpen = false;
                context.rerender();
            }
        }},
        children: {
            class: 'modal',
            id: 'quit-modal',
            children: [
                {children: 'Are you sure you want to quit? This will end the current game.'},
                {class: 'button', children: 'Yes', on: {click() {
                    context.quitModalOpen = false;
                    context.gameStarted = false;
                    context.rerender();
                }}}
            ]
        }
    }
}