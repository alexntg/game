const express = require('express');
const path = require('path');

const characterController = require('./controllers/characterController');
const gameController = require('./controllers/gameController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));   

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,   
 'views'));

// Basic routes
app.get('/', (req, res) => {
    res.send('Welcome to the Game!');
});

// Use character and game controllers (example routes)
app.use('/characters', characterController);
app.use('/game', gameController);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});