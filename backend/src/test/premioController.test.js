const request = require('supertest');
const express = require('express');
const premioController = require('../controllers/premiosController');

// Mock de modelo Sequelize
jest.mock('../models/associations', () => ({
    Premio: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn(),
    },
}));

jest.mock('../config/database', () => ({
    transaction: jest.fn().mockResolvedValue({
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue()
    })
}));

const { Premio } = require('../models/associations');

const app = express();
app.use(express.json());
app.get('/premios', premioController.list);
app.get('/premios/:id', premioController.get);
app.post('/premios', premioController.create);

describe('Controlador de Premios', () => {
    beforeEach(() => jest.clearAllMocks());

    test('Listar premios devuelve 200 y un arreglo', async () => {
        Premio.findAll.mockResolvedValue([{ id: 1, nombre: 'Descuento 10%' }]);
        const res = await request(app).get('/premios');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ id: 1, nombre: 'Descuento 10%' }]);
    });

    test('Listar premios con error devuelve 500', async () => {
        Premio.findAll.mockRejectedValue(new Error('DB error'));
        const res = await request(app).get('/premios');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Error al listar premios');
    });

    test('Obtener premio existente', async () => {
        Premio.findByPk.mockResolvedValue({ id: 1, nombre: 'Premio X' });
        const res = await request(app).get('/premios/1');
        expect(res.status).toBe(200);
        expect(res.body.nombre).toBe('Premio X');
    });

    test('Obtener premio inexistente', async () => {
        Premio.findByPk.mockResolvedValue(null);
        const res = await request(app).get('/premios/999');
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Premio no encontrado');
    });

    test('Crear premio válido', async () => {
        Premio.create.mockResolvedValue({ id: 1, nombre: 'Descuento 10%' });
        const body = {
            nombre: 'Descuento 10%',
            cantidad_a_descontar: 10,
            cantidad_minima: 50
        };
        const res = await request(app).post('/premios').send(body);
        expect(res.status).toBe(201);
        expect(res.body.nombre).toBe('Descuento 10%');
    });

    test('Crear premio sin nombre devuelve 400', async () => {
        const res = await request(app).post('/premios').send({
            cantidad_a_descontar: 10,
            cantidad_minima: 50
        });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('nombre requerido');
    });
});
