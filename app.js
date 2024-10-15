const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');

// Controladores
const characterController = require('./controllers/characterController');
const gameController = require('./controllers/gameController');
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');

// Modelos
const User = require('./models/userModel');
const { getAllCharacters } = require('./models/characterModel');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

// Almacena información sobre usuarios conectados
let connectedUsers = [];

// Conexión a MongoDB
const mongoURI = 'mongodb://localhost:27017/tuNombreDeBaseDeDatos';
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

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/layout');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para definir variables globales en todas las vistas
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated || false;
    res.locals.username = req.session.username || null;
    res.locals.isAdmin = req.session.isAdmin || false;
    next();
});

// Rutas de autenticación
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login', error: null });
});

app.post('/login', authController.login);
app.post('/logout', authController.logout);

// Ruta principal
app.get('/', (req, res) => {
    res.render('index', { title: 'Landing Page' });
});

// Rutas de registro
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

// Ruta para consultar todos los personajes
app.get('/check-characters', async (req, res) => {
    try {
        const characters = await getAllCharacters();
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
app.post('/logout', authController.logout);
app.post('/users/:id/delete', userController.delete);
app.get('/keybinds', characterController.keybinds);

// Ruta para mostrar usuarios conectados
app.get('/connected-users', (req, res) => {
    res.render('connectedUsers', { title: 'Usuarios Conectados', users: connectedUsers });
});

// Rutas del juego
app.get('/game', gameController.view);
app.post('/game/select', gameController.chooseCharacter);

// Rutas de administración
app.get('/admin/edit', async (req, res) => {
    if (!res.locals.isAuthenticated || !res.locals.isAdmin) {
        console.log('Acceso denegado. Auth:', res.locals.isAuthenticated, 'Admin:', res.locals.isAdmin);
        return res.status(403).send('Acceso denegado. Debes ser un administrador para acceder a esta página.');
    }

    try {
        const users = await User.find().lean();
        console.log('Usuarios encontrados:', users.length);

        const characters = await getAllCharacters();
        console.log('Personajes encontrados:', characters.length);

        const userCharacters = users.map(user => ({
            ...user,
            characters: characters.filter(char => char.user && char.user._id && char.user._id.toString() === user._id.toString())
        }));

        console.log('userCharacters:', JSON.stringify(userCharacters, null, 2));

        res.render('admin/edit', { 
            title: 'Admin Edit', 
            userCharacters 
        });
    } catch (error) {
        console.error('Error al obtener usuarios y personajes:', error);
        res.status(500).send('Error al cargar la página de administración');
    }
});

// Configuración de Socket.io
io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado:', socket.id);

    // Almacena el usuario conectado
    socket.on('registerUser', (username) => {
        if (!connectedUsers.includes(username)) {
            connectedUsers.push(username);
            socket.username = username; // Guardar el nombre de usuario en el socket
            io.emit('updateUserList', connectedUsers); // Notifica a todos los clientes sobre la lista actualizada
        }
    });

    // Maneja la desconexión del usuario
    socket.on('disconnect', () => {
        console.log('Un usuario se ha desconectado:', socket.id);
        // Elimina el usuario de la lista de conectados
        if (socket.username) {
            connectedUsers = connectedUsers.filter(user => user !== socket.username);
            io.emit('updateUserList', connectedUsers); // Notifica a todos los clientes sobre la lista actualizada
        }
    });
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
