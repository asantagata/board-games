const SVGs = {
    gem(type) {
        if (type === undefined) return '';
        if (type === 'rainbow') return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="var(--text)">
        <defs>
            <linearGradient id="Gradient2" x1="0" x2="1" y1="0" y2="1" >
                <stop offset="0%" stop-color="var(--y)" />
                <stop offset="30%" stop-color="var(--y)" />
                <stop offset="43%" stop-color="var(--g)" />
                <stop offset="57%" stop-color="var(--b)" />
                <stop offset="70%" stop-color="var(--p)" />
                <stop offset="100%" stop-color="var(--p)" />
            </linearGradient>
        </defs>
        <path d="M11.264 2.205A4 4 0 0 0 6.42 4.211l-4 8a4 4 0 0 0 1.359 5.117l6 4a4 4 0 0 0 4.438 0l6-4a4 4 0 0 0 1.576-4.592l-2-6a4 4 0 0 0-2.53-2.53z" fill="url(#Gradient2)"/><path d="M11.99 22 14 12l7.822 3.184" fill="none"/><path d="M14 12 8.47 2.302"/></svg>`;
        return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="color-mix(in oklab, var(--${type}) 100%, white 80%)" stroke="var(--${type})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.264 2.205A4 4 0 0 0 6.42 4.211l-4 8a4 4 0 0 0 1.359 5.117l6 4a4 4 0 0 0 4.438 0l6-4a4 4 0 0 0 1.576-4.592l-2-6a4 4 0 0 0-2.53-2.53z"/><path d="M11.99 22 14 12l7.822 3.184"/><path d="M14 12 8.47 2.302"/></svg>`;
    },
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
    chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`
}

export default SVGs;