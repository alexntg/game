const characterModel = require('../models/characterModel');

exports.index = (req, res) => {
    const characters = characterModel.getAllCharacters();
    res.render('characters/index', { characters });
};

exports.create = (req, res) => {
    res.render('characters/create');
};

exports.store = (req,res) => {
	const characters = characterModel.getAllCharacters();
	const newCharacter = {
		id: characters.length + 1,
		name: req.body.name,
		characterLevel: 1,
		Hp: 100;
		Damage: 10,
		Stamina: 10
	};
	characters.push(newCharacters);
	characterModel.saveCharacters(characters);
	red.redirect('/characters');
}

exports.edit = (req,res) => {
	const character = characterModel.findcharacterById(parseInt(req.params.id));
	res.render('characters/edit', { character });
}

exports.update = (req, res) => {
    let characters = characterModel.getAllCharacters();
    const characterIndex = characters.findIndex(c => c.id === parseInt(req.params.id));
    if (characterIndex >= 0) {
        characters[characterIndex] = { ...characters[characterIndex], ...req.body };
        characterModel.saveCharacters(characters);
    }
    res.redirect('/characters');
};

exports.delete = (req, res) => {
    let characters = characterModel.getAllCharacters();
    characters = characters.filter(c => c.id !== parseInt(req.params.id));
    characterModel.saveCharacters(characters);
    res.redirect('/characters');
};