// controllers/characterController.js
const characterModel = require('../models/characterModel');

// Define the handleError function
const handleError = (err, res) => {
    console.error(err); // Log the error to the console
    res.status(500).render('error', { message: 'An error occurred', title: 'Error' });
};

exports.index = async (req, res) => {
    try {
        const characters = await characterModel.getAllCharacters();
        res.render('characters/index', { characters });
    } catch (err) {
        handleError(err, res);
    }
};

exports.create = (req, res) => {
    res.render('characters/create');
};

exports.keybinds = (req, res) => {
    res.render('keybinds');
};

exports.select = async (req, res) => {
    try {
        const characters = await characterModel.getAllCharacters();

        if (!characters || characters.length === 0) {
            return res.render('error', { message: 'No characters available', title: 'Error' });
        }

        res.render('characters/select', { characters, title: 'Select Character' });
    } catch (err) {
        handleError(err, res);
    }
};

exports.store = async (req, res) => {
    try {
        const newCharacter = {
            name: req.body.name.replace(/<[^>]*>?/g, ''), // Sanitize user input
            characterLevel: 1,
            Hp: 100,
            Damage: 10,
            Stamina: 10,
        };

        await characterModel.createCharacter(newCharacter); // Save the new character to MongoDB
        res.redirect('/characters');
    } catch (err) {
        handleError(err, res);
    }
};

exports.edit = async (req, res) => {
    const characterId = req.params.id;

    try {
        const character = await characterModel.findCharacterById(characterId);
        
        // If the character is not found, return a 404 error
        if (!character) {
            return res.status(404).render('error', { message: 'Character not found', title: 'Error' });
        }

        // Correctly render the edit page with the character's data
        res.render('characters/edit', { character });
    } catch (err) {
        console.error("Error finding character:", err);
        return handleError(err, res);
    }
};

exports.update = async (req, res) => {
    const characterId = req.params.id;

    try {
        const character = await characterModel.findCharacterById(characterId);
        
        if (!character) {
            return res.status(404).render('error', { message: 'Character not found' });
        }

        // Update character properties
        Object.assign(character, req.body);
        await characterModel.saveCharacter(character); // Save the updated character
        res.redirect('/characters');
    } catch (err) {
        handleError(err, res);
    }
};

exports.delete = async (req, res) => {
    const characterId = req.params.id;

    try {
        await characterModel.deleteCharacter(characterId); // Delete character from MongoDB
        res.redirect('/characters'); // Redirect after deletion
    } catch (err) {
        handleError(err, res);
    }
};
