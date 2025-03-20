const { Temporada } = require('../models/associations');

exports.getTemporadas = async (req, res) => {
    try {
        const temporadas = await Temporada.findAll();
        res.json(temporadas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createTemporada = async (req, res) => {
    try {
        const { temporada } = req.body;
        const nuevaTemporada = await Temporada.create({ temporada });
        res.status(201).json(nuevaTemporada);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateTemporada = async (req, res) => {
    try {
        const { id } = req.params;
        const { temporada } = req.body;
        const temporadaExistente = await Temporada.findByPk(id);
        if (!temporadaExistente) {
            return res.status(404).json({ message: 'Temporada no encontrada' });
        }
        await temporadaExistente.update({ temporada });
        res.json(temporadaExistente);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};