const characterModel = require('../models/characterModel');

// Define the handleError function
const handleError = (err, res) => {
    console.error(err); // Log the error to the console
    res.status(500).render('error', { message: 'An error occurred', title: 'Error' });
};

exports.index = (req, res) => {
    characterModel.getAllCharacters((err, characters) => {
        if (err) return handleError(err, res);
        res.render('characters/index', { characters });
    });
};

exports.create = (req, res) => {
    res.render('characters/create');
};

exports.keybinds = (req, res) => {
    res.render('keybinds');
};

exports.select = (req, res) => {
    characterModel.getAllCharacters((err, characters) => {
        if (err) return handleError(err, res);

        if (!characters || characters.length === 0) {
            return res.render('error', { message: 'No characters available', title: 'Error' });
        }

        res.render('characters/select', { characters, title: 'Select Character' });
    });
};

exports.store = (req, res) => {
    characterModel.getAllCharacters((err, characters) => {
        if (err) return handleError(err, res);

        const newCharacter = {
            id: characters.length > 0 ? characters[characters.length - 1].id + 1 : 1,
            name: req.body.name.replace(/<[^>]*>?/g, ''), // Sanitize user input
            characterLevel: 1,
            Hp: 100,
            Damage: 10,
            Stamina: 10,
        };

        characters.push(newCharacter); // Add the new character to the array

        // Save the updated characters array to the JSON file
        characterModel.saveCharacters(characters, (err) => {
            if (err) return handleError(err, res);
            res.redirect('/characters');
        });
    });
};

exports.edit = (req, res) => {
    const characterId = parseInt(req.params.id);  // Get character ID from URL
    console.log("Character ID being requested:", characterId);

    // Ensure that the ID is a valid number
    if (isNaN(characterId)) {
        console.log("Invalid character ID");
        return res.status(400).render('error', { message: 'Invalid character ID', title: 'Error' });
    }

    characterModel.findCharacterById(characterId, (err, character) => {
        if (err) {
            console.error("Error finding character:", err);
            return handleError(err, res);
        }

        // If the character is not found, return a 404 error
        if (!character) {
            console.log("Character not found with ID:", characterId);
            return res.status(404).render('error', { message: 'Character not found', title: 'Error' });
        }

        // Correctly render the edit page with the character's data
        console.log("Found character:", character);
        res.render('characters/edit', { character });
    });
};
exports.update = (req, res) => {
    characterModel.getAllCharacters((err, characters) => {
        if (err) return handleError(err, res);
        const characterIndex = characters.findIndex(c => c.id === parseInt(req.params.id));
        if (characterIndex >= 0) {
            characters[characterIndex] = { ...characters[characterIndex], ...req.body };
            characterModel.saveCharacters(characters, (err) => {
                if (err) return handleError(err, res);
                res.redirect('/characters');
            });
        } else {
            res.render('error', { message: 'Character not found' });
        }
    });
};

exports.delete = (req, res) => {
    characterModel.getAllCharacters((err, characters) => {
        if (err) return handleError(err, res);
        // Filter out the character to delete
        const updatedCharacters = characters.filter(c => c.id !== parseInt(req.params.id));
        characterModel.saveCharacters(updatedCharacters, (err) => {
            if (err) return handleError(err, res);
            res.redirect('/characters'); // Redirect after deletion
        });
    });
};
