import context from "@/context.js";
import Header from "./Header.js";
import Modal from "./Modal.js";

export default function Home() {
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
                    class: 'fullwidth fullheight center col gap',
                    children: [
                        {tag: 'h2', children: "One Night Ultimate Werewolf"},
                        {tag: 'i', class: 'hftx', children: '(the game — but online)'},
                        {tag: 'a', href: '/host', children: {tag: 'button', children: 'Host game'}},
                        {tag: 'a', href: '/room', children: {tag: 'button', children: 'Join game'}},
                    ]
                }]
            }
        }
    };
}