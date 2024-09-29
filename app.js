const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session'); // Importa express-session
const characterController = require('./controllers/characterController');
const gameController = require('./controllers/gameController'); 
const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
    secret: 'clave_Secreta',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/layout');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.render('index', { title: 'Landing Page' });
});

// Character routes
app.get('/characters/select', characterController.select);
app.get('/characters/create', characterController.create);
app.get('/characters', characterController.index);
app.get('/characters/new', characterController.create);
app.get('/characters/:id/edit', characterController.edit);
app.post('/characters/store', characterController.store);
app.post('/characters/:id/update', characterController.update);
app.post('/characters/:id/delete', characterController.delete);

// Game routes
app.get('/game', gameController.view);
app.post('/game/select', gameController.chooseCharacter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
