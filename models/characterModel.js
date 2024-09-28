const fs = require('fs');
const path = require('path');

const characterDataPath = path.join(__dirname, '../data/characters.json');

exports.getAllCharacters = () => {
    const characters = JSON.parse(fs.readFileSync(characterDataPath, 'utf8'));
    return characters;
};

exports.saveCharacters = (characters) => {
    fs.writeFileSync(characterDataPath, JSON.stringify(characters, null, 2));
};

exports.findCharacterById = (id) => {
    const characters = this.getAllCharacters();
    return characters.find(c => c.id === id);
};
