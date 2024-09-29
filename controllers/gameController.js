const gameModel = require('../models/gameModel');
const characterModel = require('../models/characterModel');

// Renderiza la vista principal del juego, mostrando el personaje seleccionado
exports.view = (req, res) => {
    // Retrieve the selected character from the session
    const selectedCharacter = req.session.selectedCharacter;
    
    // If no character is selected, redirect to the home page
    if (!selectedCharacter) {
        console.log("No character selected, redirecting to home.");
        return res.redirect('/'); // Redirect if no character is selected
    }

    // Render the game view with the selected character
    res.render('game/game', { character: selectedCharacter, title: `Game - ${selectedCharacter.name}` });
};


// Renderiza la vista de la página de inicio
exports.home = (req, res) => {
    res.render('index', { title: 'Landing page' });
};

// Renderiza la vista para seleccionar un personaje
exports.select = (req, res) => {
    characterModel.getAllCharacters((err, characters) => {
        if (err) return handleError(err, res);

        if (!characters || characters.length === 0) {
            return res.render('error', { message: 'No characters available', title: 'Error' });
        }

        // Solo debe renderizarse una vez
        res.render('characters/select', { characters, title: 'Select Character' });
    });
};


exports.chooseCharacter = (req, res) => {
    const characterId = req.body.characterId;

    // Find the character using the provided ID
    characterModel.findCharacterById(characterId, (err, character) => {
        if (err) {
            console.error("Error finding character:", err);
            return res.status(500).json({ error: 'Character not found' });
        }

        // If character is not found
        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        // Store the character in the session
        req.session.selectedCharacter = character;
        console.log("Selected character stored in session:", req.session.selectedCharacter);

        // Send a successful response
        res.status(200).json({ character });
    });
};



// Actualiza el nivel del personaje seleccionado en función de su experiencia
exports.updateLevel = (req, res) => {
    const gameState = gameModel.getGameState();
    const character = characterModel.findCharacterById(gameState.characterId);

    if (!character) {
        return res.status(404).json({ message: 'Character not found' });
    }

    // Comprueba si el personaje ha acumulado suficiente experiencia para subir de nivel
    if (character.currentEXP >= character.characterEXP) {
        character.characterLevel += 1; // Aumenta el nivel del personaje
        character.Hp = Math.floor(character.Hp * 1.05); // Mejora los atributos
        character.Damage += 3;
        character.Stamina += 2;

        // Ajusta la experiencia para el siguiente nivel y reinicia la experiencia actual
        character.characterEXP = Math.floor(character.characterEXP * 1.2);
        character.currentEXP = 0;

        // Guarda el estado actualizado del personaje
        characterModel.saveCharacter(character);
    }

    // Devuelve el nivel y atributos actualizados del personaje
    res.json({
        characterLevel: character.characterLevel,
        Hp: character.Hp,
        Damage: character.Damage,
        Stamina: character.Stamina,
        characterEXP: character.characterEXP
    });
};

// controllers/gameController.js

exports.performAction = (req, res) => {
    const character = req.session.selectedCharacter; // Usamos el personaje de la sesión

    if (!character) {
        return res.status(404).json({ message: 'Character not found' });
    }

    // Lógica para realizar la acción (atacar, moverse, etc.)
    const action = req.body.action; // Acción enviada desde el cliente

    // Actualiza la posición del personaje según la acción
    switch (action) {
        case 'moveUp':
            character.y -= 1; // Mover hacia arriba
            break;
        case 'moveDown':
            character.y += 1; // Mover hacia abajo
            break;
        case 'moveLeft':
            character.x -= 1; // Mover hacia la izquierda
            break;
        case 'moveRight':
            character.x += 1; // Mover hacia la derecha
            break;
        default:
            return res.status(400).json({ message: 'Invalid action' });
    }

    // Responder con la nueva posición del personaje
    res.json({ character });
};


// Inicia la regeneración de stamina después de una acción
exports.regenerateStamina = (req, res) => {
    const gameState = gameModel.getGameState();
    const character = characterModel.findCharacterById(gameState.characterId);

    if (!character) {
        return res.status(404).json({ message: 'Character not found' });
    }

    // Aumenta la stamina hasta su valor máximo
    const regenerationRate = 2;
    character.Stamina = Math.min(character.Stamina + regenerationRate, character.maxStamina);

    // Guarda el estado actualizado del personaje
    characterModel.saveCharacter(character);

    res.json({
        message: 'Stamina regenerated',
        Stamina: character.Stamina
    });
};
