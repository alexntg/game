// controllers/characterController.js
const characterModel = require('../models/characterModel');
const validator = require('validator'); // Importa el validador

// Función para manejar errores
const handleError = (err, res) => {
    console.error(err); // Registra el error en la consola
    res.status(500).render('error', { message: 'An error occurred', title: 'Error' });
};

exports.index = async (req, res) => {
    try {
        const users = await getAllUsers();
        const onlineUsers = users.filter(user => user.isOnline);
        const offlineUsers = users.filter(user => !user.isOnline);

        const populatedOnlineUsers = await Promise.all(onlineUsers.map(async user => {
            const characters = await characterModel.getAllCharactersByUserId(user._id);
            return { ...user.toObject(), characters };
        }));

        const populatedOfflineUsers = await Promise.all(offlineUsers.map(async user => {
            const characters = await characterModel.getAllCharactersByUserId(user._id);
            return { ...user.toObject(), characters };
        }));

        res.render('characters/index', {
            onlineUsers: populatedOnlineUsers,
            offlineUsers: populatedOfflineUsers,
            title: 'All Characters'
        });
    } catch (err) {
        handleError(err, res);
    }
};

exports.getAllUsers = async () => {
    try {
        return await User.find().select('username isOnline');
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
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
        const userId = req.session.userId;

        if (!userId) {
            return res.status(403).render('error', { message: 'You must be logged in to view your characters.', title: 'Access Denied' });
        }

        const characters = await characterModel.getAllCharactersByUserId(userId);

        if (!characters || characters.length === 0) {
            return res.render('error', { message: 'No characters available', title: 'Error' });
        }

        res.render('characters/select', { characters, title: 'Select Character' });
    } catch (err) {
        handleError(err, res);
    }
};


exports.store = async (req, res) => {
    console.log('Request Body:', req.body); 

    try {
        const newCharacter = {
            name: validator.escape(req.body.name), 
            class: req.body.class ? validator.escape(req.body.class) : 'Unknown', 
            level: parseInt(req.body.level, 10) || 1,
            user: req.session.userId, 
        };

        if (!newCharacter.user) {
            return res.status(403).render('error', { message: 'User is not logged in', title: 'Error' });
        }

        await characterModel.createCharacter(newCharacter); 
        res.redirect('/characters/select'); 
    } catch (err) {
        handleError(err, res);
    }
};


exports.edit = async (req, res) => {
    const characterId = req.params.id;

    try {
        const character = await characterModel.findCharacterById(characterId);

        if (!character) {
            return res.status(404).render('error', { message: 'Character not found', title: 'Error' });
        }

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

        character.name = validator.escape(req.body.name); // Sanitiza la entrada
        character.class = validator.escape(req.body.class); // Sanitiza la clase
        character.level = parseInt(req.body.level, 10) || character.level; // Solo actualiza si se proporciona un nuevo nivel

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
