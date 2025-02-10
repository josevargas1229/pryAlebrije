const { User, EmailType } = require('../models/associations');

exports.getAllTypes = async (req, res) => {
    try {
        const types = await EmailType.findAll({
            include: [
                { model: User, as: 'creador', attributes: ['nombre', 'email'] }
            ]
        });
        const typesData = types.map(type => {
            let variables = type.variables_requeridas;

            // Si `variables_requeridas` es una cadena (JSON.stringify'd array), conviértelo a array
            if (typeof variables === 'string') {
                try {
                    variables = JSON.parse(variables); // Intentar parsear la cadena a array
                } catch (error) {
                    console.error('Error al parsear variables_requeridas:', error);
                    variables = []; // Si falla el parseo, asigna un array vacío como fallback
                }
            }
            return {
                ...type.get(),
                variables_requeridas: Array.isArray(variables)
                    ? variables.join(', ')
                    : variables
            };
        });
        res.json({ data: typesData });
    } catch (error) {
        console.error('Error al obtener tipos de email:', error);
        res.status(500).json({ error: 'Error al obtener los tipos de email' });
    }
};

exports.getTypeById = async (req, res) => {
    try {
        const type = await EmailType.findByPk(req.params.id, {
            include: [
                { model: User, as: 'creador', attributes: ['nombre', 'email'] }
            ]
        });
        
        if (!type) {
            return res.status(404).json({ error: 'Tipo de email no encontrado' });
        }
        const typeData = {
            ...type.get(),
            variables_requeridas: Array.isArray(type.variables_requeridas) 
                ? type.variables_requeridas.join(', ') 
                : type.variables_requeridas
        };
        res.json({ data: typeData });
    } catch (error) {
        console.error('Error al obtener tipo de email:', error);
        res.status(500).json({ error: 'Error al obtener el tipo de email' });
    }
};

exports.createType = async (req, res) => {
    const { codigo, nombre, descripcion, variables_requeridas } = req.body;

    // Validaciones básicas
    if (!codigo || !nombre || !variables_requeridas) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
        let variables = Array.isArray(variables_requeridas)
            ? variables_requeridas
            : variables_requeridas.split(',').map(v => v.trim());

        const type = await EmailType.create({
            codigo,
            nombre,
            descripcion,
            variables_requeridas: variables,
            creado_por: req.user.userId
        });

        res.status(201).json({ message: 'Tipo de email creado correctamente', data: type });
    } catch (error) {
        console.error('Error al crear tipo de email:', error);
        res.status(500).json({ error: 'Error al crear el tipo de email' });
    }
};


exports.updateType = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, variables_requeridas, activo } = req.body;

    // Validaciones básicas
    if (!nombre && !descripcion && !variables_requeridas && activo === undefined) {
        return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    try {
        const type = await EmailType.findByPk(id);
        
        if (!type) {
            return res.status(404).json({ error: 'Tipo de email no encontrado' });
        }
        let variables = Array.isArray(variables_requeridas)
        ? variables_requeridas
        : variables_requeridas.split(',').map(v => v.trim());
        await type.update({
            nombre,
            descripcion,
            variables_requeridas:variables,
            activo
        });

        res.json({ message: 'Tipo de email actualizado correctamente', data: type });
    } catch (error) {
        console.error('Error al actualizar tipo de email:', error);
        res.status(500).json({ error: 'Error al actualizar el tipo de email' });
    }
};

exports.deleteType = async (req, res) => {
    try {
        const type = await EmailType.findByPk(req.params.id);
        
        if (!type) {
            return res.status(404).json({ error: 'Tipo de email no encontrado' });
        }

        await type.destroy();
        res.json({ message: 'Tipo de email eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar tipo de email:', error);
        res.status(500).json({ error: 'Error al eliminar el tipo de email' });
    }
};
