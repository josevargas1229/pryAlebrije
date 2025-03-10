const {Talla} = require('../models/associations');

exports.getTallas = async (req, res) => {
    try {
        const tallas = await Talla.findAll();
        res.json(tallas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createTalla = async (req, res) => {
    try {
        const { talla } = req.body;
        const nuevaTalla = await Talla.create({ talla });
        res.status(201).json(nuevaTalla);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateTalla = async (req, res) => {
    try {
        const { id } = req.params;
        const { talla } = req.body;
        const tallaExistente = await Talla.findByPk(id);
        if (!tallaExistente) {
            return res.status(404).json({ message: 'Talla no encontrada' });
        }
        await tallaExistente.update({ talla });
        res.json(tallaExistente);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};