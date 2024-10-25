// controllers/companyProfileController.js
const cloudinary = require('cloudinary').v2;
const PerfilEmpresa = require('../models/PerfilEmpresa');

// Configura Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Obtener el perfil de la empresa
exports.getCompanyProfile = async (req, res) => {
    try {
        const profile = await PerfilEmpresa.findOne();
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar el perfil de la empresa
exports.updateCompanyProfile = async (req, res) => {
    try {
        const { nombre, slogan, direccion, telefono, email, redSocial } = req.body;
        let logoUrl;

        // Si hay un nuevo logo, súbelo a Cloudinary
        if (req.file) {
            logoUrl = await uploadImageToCloudinary(req.file);
        }

        // Actualiza el perfil
        await PerfilEmpresa.update(
            {
                nombre,
                slogan,
                direccion,
                telefono,
                email,
                redSocial, // Actualiza red social
                logo: logoUrl || undefined // Guarda la URL solo si existe
            },
            {
                where: { id: 1 } // Asumiendo que solo hay un perfil
            }
        );

        res.json({ message: 'Perfil actualizado exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Función para subir la imagen a Cloudinary y retornar la URL
const uploadImageToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
            if (error) {
                return reject(new Error('Error al subir el archivo a Cloudinary: ' + error.message));
            }
            resolve(result.secure_url);
        }).end(file.buffer);
    });
};
