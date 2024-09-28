const characterModel = require('../models/characterModel');
const gameModel = require('../models/gameModel');

exports.select = (req, res) => {
    const characters = characterModel.getAllCharacters();
    res.render('characters/select', { characters });
};

exports.chooseCharacter = (req, res) => {
    const gameState = gameModel.getGameState();
    gameState.characterId = parseInt(req.body.characterId);
    gameModel.saveGameState(gameState);
    res.redirect('/game');
};

exports.view = (req, res) => {
    const gameState = gameModel.getGameState();
    const character = characterModel.findCharacterById(gameState.characterId);
    res.render('game', { character });
};

exports.updateLevel = (req, res) => {
    const gameState = gameModel.getGameState();
    const character = characterModel.findCharacterById(gameState.characterId);

    // Check if currentEXP is greater than or equal to characterEXP
    if (character.currentEXP >= character.characterEXP) {
        // Increase characterLevel
        character.characterLevel += 1;

        // Increase character attributes
        character.Hp = Math.floor(character.Hp * 1.05);
        character.Damage += 3;
        character.Stamina += 2;

        // Update characterEXP and currentEXP
        character.characterEXP = Math.floor(character.characterEXP * 1.2); // Increase characterEXP by 20%
        character.currentEXP = 0; //Reset current exp
    }

    // Save the updated character state
    characterModel.saveCharacter(character);

    // Respond with the updated character level and attributes
    res.json({
        characterLevel: character.characterLevel,
        Hp: character.Hp,
        Damage: character.Damage,
        Stamina: character.Stamina,
        characterEXP: character.characterEXP
    });
};

exports.performAction = (req, res) => {
    const gameState = gameModel.getGameState();
    const character = characterModel.findCharacterById(gameState.characterId);

    const actionCost = 1;

    if (character.Stamina >= actionCost) {
        character.Stamina -= actionCost; // Reduce stamina

        // Handle action logic here (e.g., hitting an enemy)

        // Save the updated character state
        characterModel.saveCharacter(character);

        res.json({
            message: 'Action performed successfully',
            Stamina: character.Stamina
        });
    } else {
        res.status(400).json({ message: 'Not enough stamina!' });
    }
};

let actionCooldown = false;

function performAction() {
    if (actionCooldown) return;

    actionCooldown = true;

    // Perform the action (e.g., hitting)
    fetch('/perform-action', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            // Update the UI with new stamina
            updateStaminaUI(data.Stamina);

            // Start stamina regeneration after action
            startStaminaRegeneration();
        })
        .finally(() => {
            actionCooldown = false;
        });
}

function startStaminaRegeneration() {
    setTimeout(() => {
        regenerateStamina();
    }, 1000); // Wait 1 second before starting regeneration
}

function regenerateStamina() {
    fetch('/regenerate-stamina', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            // Update the UI with new stamina
            updateStaminaUI(data.Stamina);
            if (data.Stamina < character.maxStamina) {
                // Continue regenerating if stamina is still below max
                regenerateStamina();
            }
        });
}

function updateStaminaUI(stamina) {
    const staminaBar = document.getElementById('stamina-bar');
    staminaBar.style.width = (stamina / character.maxStamina) * 100 + '%'; // Assuming maxStamina is defined
}