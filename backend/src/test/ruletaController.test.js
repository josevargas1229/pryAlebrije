const express = require('express');
const request = require('supertest');
const { validationResult } = require('express-validator');

// Mock de dependencias
jest.mock('../config/cloudinaryConfig', () => ({
    uploadImageToCloudinary: jest.fn(),
}));

jest.mock('../config/logger', () => ({
    errorLogger: { error: jest.fn() },
}));

jest.mock('../models/associations', () => ({
    Ruleta: { create: jest.fn(), findAll: jest.fn(), findByPk: jest.fn() },
    RuletaHistorial: { create: jest.fn(), findByPk: jest.fn() },
    RuletaPremio: { findAll: jest.fn() },
    Participacion: { findAndCountAll: jest.fn() },
    Premio: {},
    CuponUsuario: {}
}));

const { uploadImageToCloudinary } = require('../config/cloudinaryConfig');
const { Ruleta, RuletaHistorial, RuletaPremio, Participacion } = require('../models/associations');
const ruletaController = require('../controllers/ruletaController');

const app = express();
app.use(express.json());
app.post('/ruleta', ruletaController.createRuleta);
app.get('/ruletas', ruletaController.getAllRuletas);
app.get('/ruletas/:id', ruletaController.getRuletaById);

describe('RuletaController', () => {
    beforeEach(() => jest.clearAllMocks());

    test('Error si faltan imágenes', async () => {
        const res = await request(app).post('/ruleta').send({ activo: true });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Se requieren imagen_ruleta e imagen_background');
    });

    // --- getAllRuletas ---
    test('Devuelve lista de ruletas', async () => {
        Ruleta.findAll.mockResolvedValue([{ id: 1, activo: true }]);
        const res = await request(app).get('/ruletas');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ id: 1, activo: true }]);
    });

    test('Error al obtener ruletas', async () => {
        Ruleta.findAll.mockRejectedValue(new Error('DB fail'));
        const res = await request(app).get('/ruletas');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Error al obtener ruletas');
    });

    // --- getRuletaById ---
    test('Obtiene ruleta existente', async () => {
        const mockRuleta = { id: 1, imagen_ruleta: 'img1', segmentos: [] };
        Ruleta.findByPk.mockResolvedValue(mockRuleta);
        const res = await request(app).get('/ruletas/1');
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(1);
    });

    test('Ruleta inexistente devuelve 404', async () => {
        Ruleta.findByPk.mockResolvedValue(null);
        const res = await request(app).get('/ruletas/99');
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Ruleta no encontrada');
    });

    // --- validateProbabilities ---
    test('ValidateProbabilities no lanza error si total <= 100', async () => {
        RuletaPremio.findAll.mockResolvedValue([
            { probabilidad_pct: 40 },
            { probabilidad_pct: 60 },
        ]);
        await expect(ruletaController.validateProbabilities(1)).resolves.not.toThrow();
    });

    test('ValidateProbabilities lanza error si total > 100', async () => {
        RuletaPremio.findAll.mockResolvedValue([
            { probabilidad_pct: 70 },
            { probabilidad_pct: 50 },
        ]);
        await expect(ruletaController.validateProbabilities(1)).rejects.toThrow(
            'La suma de probabilidades excede el 100%'
        );
    });
});
