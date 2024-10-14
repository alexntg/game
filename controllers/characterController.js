// controllers/characterController.js
const characterModel = require('../models/characterModel');

// Función para manejar errores
const handleError = (err, res) => {
    console.error(err); // Registra el error en la consola
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
            name: req.body.name.replace(/<[^>]*>?/g, ''), // Sanitiza la entrada del usuario
            class: req.body.class.replace(/<[^>]*>?/g, ''), // Sanitiza la clase
            level: req.body.level || 1, // Asigna nivel 1 si no se proporciona otro
            user: req.session.userId, // Se asume que el ID del usuario está guardado en la sesión
        };

        await characterModel.createCharacter(newCharacter); // Guarda el nuevo personaje en MongoDB
        res.redirect('/characters');
    } catch (err) {
        handleError(err, res);
    }
};

exports.edit = async (req, res) => {
    const characterId = req.params.id;

    try {
        const character = await characterModel.findCharacterById(characterId);
        
        // Si no se encuentra el personaje, retorna un error 404
        if (!character) {
            return res.status(404).render('error', { message: 'Character not found', title: 'Error' });
        }

        // Renderiza correctamente la página de edición con los datos del personaje
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

        // Actualiza las propiedades del personaje
        character.name = req.body.name.replace(/<[^>]*>?/g, ''); // Sanitiza la entrada
        character.class = req.body.class.replace(/<[^>]*>?/g, ''); // Sanitiza la clase
        character.level = req.body.level || character.level; // Solo actualiza si se proporciona un nuevo nivel

        await characterModel.saveCharacter(character); // Guarda el personaje actualizado
        res.redirect('/characters');
    } catch (err) {
        handleError(err, res);
    }
};

exports.delete = async (req, res) => {
    const characterId = req.params.id;

    try {
        await characterModel.deleteCharacter(characterId); // Elimina el personaje de MongoDB
        res.redirect('/characters'); // Redirige después de la eliminación
    } catch (err) {
        handleError(err, res);
    }
};
