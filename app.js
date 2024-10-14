const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const characterController = require('./controllers/characterController');
const gameController = require('./controllers/gameController');
const authController = require('./controllers/authController'); // Controlador de autenticación
const mongoose = require('mongoose'); // Asegúrate de requerir mongoose si no lo has hecho
const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB
const mongoURI = 'mongodb://localhost:27017/tuNombreDeBaseDeDatos'; // Cambia esto por tu URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Conexión a MongoDB exitosa');
    })
    .catch(err => {
        console.error('Error en la conexión a MongoDB:', err);
    });

// Configurar la sesión
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

// Middleware para definir variables globales en todas las vistas
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated || false;
    res.locals.username = req.session.username || null;
    next();
});

// Ruta de Login
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login', error: null }); // Siempre pasamos 'error' como null
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Simular autenticación básica
    if (username === 'chosenUndead' && password === 'bonfire') {
        req.session.isAuthenticated = true;
        req.session.username = username;
        res.redirect('/');
    } else {
        res.render('login', { title: 'Login', error: 'Invalid credentials' });
    }
});

// Ruta de Logout
app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Ruta principal
app.get('/', (req, res) => {
    res.render('index', { title: 'Landing Page' });
});

// Rutas de registro
app.get('/register', (req, res) => {
    res.render('register', { title: 'Registro', error: null });
});

app.post('/register', authController.register); // Llama al controlador de registro

// Rutas de personajes
app.get('/characters/select', characterController.select);
app.get('/characters/create', characterController.create);
app.get('/characters', characterController.index);
app.get('/characters/new', characterController.create);
app.get('/characters/:id/edit', characterController.edit);
app.post('/characters/store', characterController.store);
app.post('/characters/:id/update', characterController.update);
app.post('/characters/:id/delete', characterController.delete);

app.get('/keybinds', characterController.keybinds);

// Rutas de juego
app.get('/game', gameController.view);
app.post('/game/select', gameController.chooseCharacter);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
