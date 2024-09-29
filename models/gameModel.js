const fs = require('fs');
const path = require('path');

// Ruta al archivo JSON que contiene el estado del juego
const gameStatePath = path.join(__dirname, '../data/gameState.json');

// Función para leer el estado del juego desde el archivo JSON
exports.getGameState = () => {
    try {
        const data = fs.readFileSync(gameStatePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading game state:', err);
        return { characterId: null }; // Devuelve un estado predeterminado si hay un error
    }
};

// Función para guardar el estado del juego en el archivo JSON
exports.saveGameState = (gameState) => {
    try {
        fs.writeFileSync(gameStatePath, JSON.stringify(gameState, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving game state:', err);
    }
};
