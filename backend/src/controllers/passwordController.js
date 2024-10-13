// controllers/passwordController.js
const fs = require('fs');
const path = require('path');

let passwordList = new Set();

// Cargar la lista de contraseñas al iniciar el controlador
fs.readFile(path.join(__dirname, '../100k-most-used-passwords-NCSC.txt'), 'utf8', (err, data) => {
    if (err) {
        console.error('Error al leer el archivo de contraseñas:', err);
        process.exit(1);
    }
    // Almacena las contraseñas en un Set para búsquedas rápidas
    passwordList = new Set(data.split('\n').map(password => password.trim()));
    console.log('Lista de contraseñas cargada correctamente');
});

// Controlador para verificar contraseñas
exports.checkPassword = (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Debe proporcionar una contraseña' });
    }

    const isCompromised = passwordList.has(password);
    if (isCompromised) {
        return res.json({ message: 'La contraseña ha sido filtrada. Por favor, elige una más segura.' });
    } else {
        return res.json({ message: 'La contraseña no se encuentra en la lista de contraseñas expuestas.' });
    }
};
