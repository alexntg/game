const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../data/characters.json');

exports.getAllCharacters = (callback) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading character data:", err); // Log error
            return callback(err);
        }
        let characters = [];
        try {
            characters = JSON.parse(data);
        } catch (parseErr) {
            console.error("Error parsing character data:", parseErr);
            return callback(parseErr);
        }
        console.log("Retrieved characters:", characters);
        callback(null, characters);
    });
};

exports.findCharacterById = (id, callback) => {
    this.getAllCharacters((err, characters) => {
        if (err) {
            console.error("Error retrieving characters:", err);
            return callback(err);
        }
        
        const character = characters.find(c => c.id.toString() === id.toString());
        if (!character) {
            console.log("No character found with ID:", id);
        }

        callback(null, character);
    });
};

exports.saveCharacters = (characters, callback) => {
    const data = JSON.stringify(characters, null, 2);
    fs.writeFile(dataFilePath, data, 'utf8', (err) => {
        callback(err); 
    });
};
