const characterModel = require('../models/characterModel');

exports.index = (req, res) => {
    characterModel.getAllCharacters((err, characters) => {
        if (err) return handleError(err, res);
        res.render('characters/index', { characters });
    });
};

exports.create = (req, res) => {
    res.render('characters/create');
};

exports.store = (req, res) => {
    characterModel.getAllCharacters((err, characters) => {
        if (err) return handleError(err, res);
        const newCharacter = {
            id: characters.length + 1,
            name: req.body.name.replace(/<[^>]*>?/g, ''), // Sanitize user input (basic example)
            characterLevel: 1,
            Hp: 100,
            Damage: 10,
            Stamina: 10,
        };
        characters.push(newCharacter);
        characterModel.saveCharacters(characters, (err) => {
            if (err) return handleError(err, res);
            res.redirect('/characters');
        });
    });
};

exports.edit = (req, res) => {
    characterModel.findCharacterById(parseInt(req.params.id), (err, character) => {
        if (err) return handleError(err, res);
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
            // Handle case where character not found
            res.render('error', { message: 'Character not found' });
        }
    });
};

exports.delete = (req, res) => {
    characterModel.getAllCharacters((err, characters) => {
        if (err) return handleError(err, res);
        characters = characters.filter(c => c.id !== parseInt(req.params.id));
        characterModel.saveCharacters(characters, (err) => {
            if (err) return handleError(err, res);
            res.redirect('/characters');
        });
    });
};
