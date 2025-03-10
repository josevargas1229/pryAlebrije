const { Marca } = require('../models/associations');

exports.getMarcas = async (req, res) => {
    try {
        const marcas = await Marca.findAll();
        res.json(marcas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createMarca = async (req, res) => {
    try {
        const { nombre } = req.body;
        const nuevaMarca = await Marca.create({ nombre });
        res.status(201).json(nuevaMarca);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateMarca = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const marcaExistente = await Marca.findByPk(id);
        if (!marcaExistente) {
            return res.status(404).json({ message: 'Marca no encontrada' });
        }
        await marcaExistente.update({ nombre });
        res.json(marcaExistente);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};