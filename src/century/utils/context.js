const context = {
    gameStarted: false,
    players: [
        {name: '', color: 'y', playerId: 0},
        {name: '', color: 'g', playerId: 1}
    ],
    merchantRow: [],
    golemRow: [],
    merchantDeck: [],
    golemDeck: [],
    golemThreshold: 5,
    standing: {},
    quitModalOpen: false,
    cardModalOpen: false,
};

export default context;