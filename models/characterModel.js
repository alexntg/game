const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../data/characters.json');

// Function to get all characters from the JSON file
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
            console.error("Error parsing character data:", parseErr); // Log parsing error
            return callback(parseErr);
        }
        console.log("Retrieved characters:", characters); // Log retrieved characters
        callback(null, characters);
    });
};

exports.findCharacterById = (id, callback) => {
    this.getAllCharacters((err, characters) => {
        if (err) {
            console.error("Error retrieving characters:", err);
            return callback(err);
        }
        
        // Ensure both `id` and `character.id` are compared as strings
        const character = characters.find(c => c.id.toString() === id.toString());
        if (!character) {
            console.log("No character found with ID:", id);
        }

        callback(null, character);
    });
};

// Function to save characters to the JSON file
exports.saveCharacters = (characters, callback) => {
    const data = JSON.stringify(characters, null, 2); // Convert characters to JSON
    fs.writeFile(dataFilePath, data, 'utf8', (err) => {
        callback(err); // Pass any error to the callback
    });
};
