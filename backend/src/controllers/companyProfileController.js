// controllers/companyProfileController.js
const { PerfilEmpresa } = require('../models/associations');
const { uploadImageToCloudinary } = require('../config/cloudinaryConfig');

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
                redSocial,
                logo: logoUrl || undefined
            },
            {
                where: { id: 1 }
            }
        );

        res.json({ message: 'Perfil actualizado exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};