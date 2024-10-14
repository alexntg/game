const bcrypt = require('bcrypt');
const User = require('../models/userModel'); // Asegúrate de que la ruta sea correcta

// Maneja el registro de nuevos usuarios
exports.register = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Verifica si el nombre de usuario ya existe
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('register', { error: 'El nombre de usuario ya está en uso.', title: 'Registro' });
        }

        // Hashea la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crea un nuevo usuario
        const newUser = new User({
            username,
            password: hashedPassword,
        });

        // Guarda el usuario en la base de datos
        await newUser.save();
        
        // Redirige al login o envía una respuesta de éxito
        res.redirect('/login');
    } catch (error) {
        console.error("Error en el registro:", error);
        res.render('register', { error: 'Error al registrarse. Intente de nuevo.', title: 'Registro' });
    }
};

// Maneja el inicio de sesión
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Busca el usuario por nombre de usuario
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('login', { title: 'Login', error: 'Credenciales inválidas' });
        }

        // Verifica la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.render('login', { title: 'Login', error: 'Credenciales inválidas' });
        }

        // Almacena la información de sesión
        req.session.isAuthenticated = true;
        req.session.username = user.username;
        res.redirect('/');
    } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        res.render('login', { title: 'Login', error: 'Error al iniciar sesión. Intente de nuevo.' });
    }
};

// Maneja el cierre de sesión
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};
