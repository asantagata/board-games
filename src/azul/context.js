const context = {
    gameStarted: false,
    players: [
        {id: 0, name: '', color: 1},
        {id: 1, name: '', color: 2},
    ],
    factories: {},
    actingPlayerId: -1,
    selectedFactoryAndTile: null,
    nextRoundStartPlayerId: null,
    gameOver: false,
    winningPlayerIds: new Set(),
};

export default context;