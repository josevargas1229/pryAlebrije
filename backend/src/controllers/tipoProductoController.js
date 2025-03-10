const { TipoProducto } = require('../models/associations');

exports.getTiposProducto = async (req, res) => {
    try {
        const tipos = await TipoProducto.findAll();
        res.json(tipos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createTipoProducto = async (req, res) => {
    try {
        const { nombre } = req.body;
        const nuevoTipo = await TipoProducto.create({ nombre });
        res.status(201).json(nuevoTipo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateTipoProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const tipoExistente = await TipoProducto.findByPk(id);
        if (!tipoExistente) {
            return res.status(404).json({ message: 'Tipo de producto no encontrado' });
        }
        await tipoExistente.update({ nombre });
        res.json(tipoExistente);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};