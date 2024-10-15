const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');

const characterController = require('./controllers/characterController');
const gameController = require('./controllers/gameController');
const authController = require('./controllers/authController'); 
const adminController = require('./controllers/adminController'); 

const app = express();
const server = http.createServer(app); 
const io = socketio(server); 

const PORT = process.env.PORT || 3000;

const mongoURI = 'mongodb://localhost:27017/tuNombreDeBaseDeDatos'; 
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Conexión a MongoDB exitosa');
    })
    .catch(err => {
        console.error('Error en la conexión a MongoDB:', err);
    });
    
app.use(session({
    secret: 'clave_Secreta',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.get('/admin/edit', adminController.adminEdit);


exports.adminEdit = (req, res) => {
    if (!req.session.isAdmin) {
        return res.render('error404', { title: 'Página no encontrada' });
    }
    res.render('admin/edit', { title: 'Editar' });
};


app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/layout');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated || false;
    res.locals.username = req.session.username || null;
    next();
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login', error: null });
});

app.post('/login', authController.login);


app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get('/', (req, res) => {
    res.render('index', { title: 'Landing Page' });
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'Registro', error: null });
});

app.post('/register', authController.register); 

app.get('/check-users', async (req, res) => {
    try {
        const users = await User.find(); 
        if (users.length > 0) {
            res.send(users); 
        } else {
            res.send('No se encontraron usuarios en la base de datos.');
        }
    } catch (error) {
        console.error('Error consultando usuarios:', error);
        res.status(500).send('Error al consultar la base de datos.');
    }
});

const Character = require('./models/characterModel'); 

app.get('/check-characters', async (req, res) => {
    try {
        const characters = await Character.find().populate('user');
        if (characters.length > 0) {
            res.send(characters); 
        } else {
            res.send('No se encontraron personajes en la base de datos.');
        }
    } catch (error) {
        console.error('Error consultando personajes:', error);
        res.status(500).send('Error al consultar la base de datos.');
    }
});


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

// Rutas del juego
app.get('/game', gameController.view);
app.post('/game/select', gameController.chooseCharacter);

// Escuchar en el puerto configurado
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
