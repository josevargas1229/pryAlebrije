const QRCode = require('qrcode');

/**
 * Genera un código QR a partir de datos proporcionados.
 * @param {Object} data - Datos a codificar en el QR (ej. { empleado_id: 1, tienda: 'Sucursal Principal' }).
 * @param {Object} options - Opciones opcionales para QRCode (ej. { width: 300 }).
 * @returns {Promise<string>} - Promesa que resuelve en una cadena base64 (data URL) del QR.
 */
async function generarQR(data, options = {}) {
    try {
        const defaultOptions = {
            errorCorrectionLevel: 'H', // Nivel alto de corrección de errores
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            ...options
        };
        const qrDataURL = await QRCode.toDataURL(JSON.stringify(data), defaultOptions);
        return qrDataURL; // Ejemplo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
    } catch (error) {
        throw new Error(`Error al generar QR: ${error.message}`);
    }
}

module.exports = { generarQR };