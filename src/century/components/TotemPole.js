export default function TotemPole() {
    return {
        customMemo() { return false; },
        render() {
            return {        
                class: 'totem-pole',
                children: ['p', 'b', 'g', 'y'].map(c => ({
                    class: 'totem',
                    style: { '--color': `var(--${c})` }
                }))
            }
        }
    }
}