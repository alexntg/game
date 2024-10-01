const fs = require('fs');
const path = require('path');

const gameStatePath = path.join(__dirname, '../data/gameState.json');

exports.getGameState = () => {
    try {
        const data = fs.readFileSync(gameStatePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading game state:', err);
        return { characterId: null }; 
    }
};

exports.saveGameState = (gameState) => {
    try {
        fs.writeFileSync(gameStatePath, JSON.stringify(gameState, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving game state:', err);
    }
};
