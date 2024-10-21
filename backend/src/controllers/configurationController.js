const ConfiguracionSistema = require("../models/Configuration");


// Obtener la configuración del sistema
exports.getConfiguration = async (req, res) => {
    try {
        const configuracion = await ConfiguracionSistema.findOne();
        if (!configuracion) {
            return res.status(404).json({ error: 'Configuración no encontrada' });
        }
        res.json(configuracion);
    } catch (error) {
        console.error('Error al obtener la configuración:', error);
        res.status(500).json({ error: 'Error al obtener la configuración' });
    }
};

// Actualizar la configuración del sistema
exports.updateConfiguration = async (req, res) => {
    const { max_intentos_login, tiempo_bloqueo_minutos } = req.body;

    // Validaciones de entrada
    if (max_intentos_login < 3 || tiempo_bloqueo_minutos < 1) {
        return res.status(400).json({ error: 'Valores inválidos' });
    }

    try {
        const configuracion = await ConfiguracionSistema.findOne();
        
        if (!configuracion) {
            return res.status(404).json({ error: 'Configuración no encontrada' });
        }

        // Actualizar los valores de la configuración
        await configuracion.update({
            max_intentos_login,
            tiempo_bloqueo_minutos
        });

        res.json({ message: 'Configuración actualizada correctamente', data: configuracion });
    } catch (error) {
        console.error('Error al actualizar la configuración:', error);
        res.status(500).json({ error: 'Error al actualizar la configuración' });
    }
};
