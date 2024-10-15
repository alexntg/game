const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        default: 1,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const Character = mongoose.model('Character', characterSchema);

exports.getAllCharactersByUserId = async (userId) => {
    return await Character.find({ user: userId }).populate('user', 'username');
};

exports.getAllCharacters = async () => {
    return await Character.find().populate('user', 'username');
};

exports.createCharacter = async (characterData) => {
    const character = new Character(characterData);
    return await character.save(); 
};

exports.findCharacterById = async (characterId) => {
    return await Character.findById(characterId).populate('user', 'username'); 
};

exports.saveCharacter = async (character) => {
    return await character.save(); 
};

exports.deleteCharacter = async (characterId) => {
    return await Character.findByIdAndDelete(characterId); 
};
