const cloudinary = require('cloudinary').v2;

// Configura Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Función para subir imágenes a Cloudinary
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

module.exports = {
    cloudinary,
    uploadImageToCloudinary
};