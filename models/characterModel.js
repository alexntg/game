// models/characterModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Definición del esquema de personajes
const characterSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    class: {
        type: String,
        required: true,
    },
    level: {
        type: Number,
        required: true,
        default: 1, // Nivel por defecto
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

// Exporta el modelo de personaje
const Character = mongoose.model('Character', characterSchema);

// Funciones para manejar operaciones de personajes
exports.getAllCharacters = async () => {
    return await Character.find().populate('user', 'username'); // Obtiene todos los personajes y su usuario
};

exports.createCharacter = async (characterData) => {
    const character = new Character(characterData);
    return await character.save(); // Guarda el nuevo personaje en la base de datos
};

exports.findCharacterById = async (characterId) => {
    return await Character.findById(characterId).populate('user', 'username'); // Busca un personaje por ID
};

exports.saveCharacter = async (character) => {
    return await character.save(); // Guarda los cambios de un personaje
};

exports.deleteCharacter = async (characterId) => {
    return await Character.findByIdAndDelete(characterId); // Elimina un personaje por ID
};
