const multer = require('multer');
const path = require('path');

// Configuración de Multer para imágenes
const upload = multer({
    storage: multer.memoryStorage(), // Almacenamiento en memoria
    limits: {
        fileSize: 8 * 1024 * 1024, // Límite de 8 MB por archivo individual
        files: 10, // Límite de 10 archivos por solicitud
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = /image\/jpeg|image\/png/;
        const isMimetypeValid = mimetype.test(file.mimetype);
        const isExtnameValid = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (isMimetypeValid && isExtnameValid) {
            return cb(null, true);
        }
        cb(new Error('Error: Solo se permiten imágenes .jpeg, .jpg o .png'));
    },
});

// Middleware para manejar errores
const imageUploadMiddleware = (req, res, next) => {
    upload.any()(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'Una o más imágenes exceden el tamaño máximo permitido (8 MB).' });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({ message: 'Se ha excedido el límite de 10 imágenes por solicitud.' });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

module.exports = imageUploadMiddleware;