const bcrypt = require('bcrypt');
const User = require('../models/userModel'); 

exports.register = async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.render('register', { error: 'Todos los campos son obligatorios.', title: 'Registro' });
        }
        if (password.length < 6) {
            return res.render('register', { error: 'La contraseña debe tener al menos 6 caracteres.', title: 'Registro' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('register', { error: 'El nombre de usuario ya está en uso.', title: 'Registro' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
        });

        await newUser.save();
        
        res.redirect('/login');
    } catch (error) {
        console.error("Error en el registro:", error);
        res.render('register', { error: 'Error al registrarse. Intente de nuevo.', title: 'Registro' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.render('login', { title: 'Login', error: 'Todos los campos son obligatorios.' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.render('login', { title: 'Login', error: 'Credenciales inválidas.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.render('login', { title: 'Login', error: 'Credenciales inválidas.' });
        }

        req.session.isAuthenticated = true;
        req.session.username = user.username;
        req.session.userId = user._id;
        req.session.isAdmin = user.isAdmin || false; 

        res.redirect('/');
    } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        res.render('login', { title: 'Login', error: 'Error al iniciar sesión. Intente de nuevo.' });
    }
};


exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return res.redirect('/'); 
        }

        res.redirect('/');
    });
};
