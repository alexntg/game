const User = require('../models/userModel');

exports.adminEdit = (req, res) => {
    if (!req.session.isAuthenticated || !req.session.isAdmin) {
        return res.render('error404', { title: 'Página no encontrada' });
    }
    res.render('admin/edit', { title: 'Editar' });
};
