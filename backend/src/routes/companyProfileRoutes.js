const express = require('express');
const router = express.Router();
const companyProfileController = require('../controllers/companyProfileController');
const multer = require('multer');
const path = require('path');

// Configuración de Multer para el logo
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 8 * 1024 * 1024, // Límite de 8 MB para el logo
        files: 1, // Solo se permite 1 archivo (el logo)
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = /image\/jpeg|image\/png/;
        const isMimetypeValid = mimetype.test(file.mimetype);
        const isExtnameValid = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (isMimetypeValid && isExtnameValid) {
            return cb(null, true);
        }
        cb(new Error('Error: Solo se permiten imágenes .jpeg, .jpg o .png para el logo'));
    },
});

// Middleware para manejar errores de Multer
const logoUploadMiddleware = (req, res, next) => {
    upload.single('logo')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'El logo excede el tamaño máximo permitido (8 MB).' });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({ message: 'Solo se permite subir un logo.' });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

// Rutas
router.get('', companyProfileController.getCompanyProfile);
router.put('', logoUploadMiddleware, companyProfileController.updateCompanyProfile);

module.exports = router;