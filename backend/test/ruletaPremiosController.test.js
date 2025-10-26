const { UniqueConstraintError } = require('sequelize');
const controller = require('../controllers/ruletaPremiosController');

// 🔧 Mock de dependencias
jest.mock('../models/associations', () => ({
    Ruleta: { findByPk: jest.fn() },
    Premio: { findByPk: jest.fn() },
    RuletaPremio: {
        findAll: jest.fn(),
        create: jest.fn(),
        findOne: jest.fn()
    }
}));

jest.mock('../config/database', () => ({
    transaction: jest.fn(() => ({
        commit: jest.fn(),
        rollback: jest.fn(),
        LOCK: { UPDATE: 'UPDATE' }
    })),
    query: jest.fn()
}));

const { Ruleta, Premio, RuletaPremio } = require('../models/associations');
const sequelize = require('../config/database');

// Helper para simular req/res
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.end = jest.fn().mockReturnValue(res);
    return res;
};

describe('ruletaPremiosController', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ────────────────────────────────
    describe('listByRuleta', () => {
        it('debe listar los segmentos de una ruleta', async () => {
            const req = { params: { ruletaId: 1 } };
            const res = mockRes();

            RuletaPremio.findAll.mockResolvedValue([
                {
                    id: 1, ruleta_id: 1, premio_id: 5, probabilidad_pct: '30.00', activo: 1,
                    premio: { id: 5, nombre: 'Premio A' }
                }
            ]);

            await controller.listByRuleta(req, res);

            expect(RuletaPremio.findAll).toHaveBeenCalledWith({
                where: { ruleta_id: 1 },
                include: [{ model: expect.anything(), as: 'premio' }],
                order: [['id', 'ASC']]
            });
            expect(res.json).toHaveBeenCalledWith([
                {
                    id: 1, ruleta_id: 1, premio_id: 5, probabilidad_pct: 30, activo: true,
                    premio: { id: 5, nombre: 'Premio A' }
                }
            ]);
        });

        it('maneja errores internos', async () => {
            const req = { params: { ruletaId: 1 } };
            const res = mockRes();
            RuletaPremio.findAll.mockRejectedValue(new Error('DB error'));

            await controller.listByRuleta(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Error al listar segmentos'
            }));
        });
    });

    // ────────────────────────────────
    describe('addSegmento', () => {
        it('crea un nuevo segmento correctamente', async () => {
            const req = {
                params: { ruletaId: 1 },
                body: { premio_id: 10, probabilidad_pct: 25, activo: true }
            };
            const res = mockRes();

            const t = await sequelize.transaction();
            Ruleta.findByPk.mockResolvedValue({ id: 1 });
            Premio.findByPk.mockResolvedValue({ id: 10 });
            RuletaPremio.create.mockResolvedValue({ id: 99, ruleta_id: 1, premio_id: 10 });

            RuletaPremio.findAll.mockResolvedValue([{ probabilidad_pct: 25, activo: true }]);

            await controller.addSegmento(req, res);

            expect(RuletaPremio.create).toHaveBeenCalled();
            expect(t.commit).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 99 }));
        });

        it('retorna 404 si la ruleta no existe', async () => {
            const req = { params: { ruletaId: 1 }, body: { premio_id: 1, probabilidad_pct: 10 } };
            const res = mockRes();
            const t = await sequelize.transaction();
            Ruleta.findByPk.mockResolvedValue(null);

            await controller.addSegmento(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Ruleta no encontrada' });
            expect(t.rollback).toHaveBeenCalled();
        });

        it('retorna 409 si hay error de duplicado', async () => {
            const req = { params: { ruletaId: 1 }, body: { premio_id: 1, probabilidad_pct: 10 } };
            const res = mockRes();
            const t = await sequelize.transaction();
            Ruleta.findByPk.mockResolvedValue({ id: 1 });
            Premio.findByPk.mockResolvedValue({ id: 1 });
            RuletaPremio.create.mockRejectedValue(new UniqueConstraintError());

            await controller.addSegmento(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
        });

        it('retorna 400 si probabilidad fuera de rango', async () => {
            const req = { params: { ruletaId: 1 }, body: { premio_id: 1, probabilidad_pct: 150 } };
            const res = mockRes();

            await controller.addSegmento(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    // ────────────────────────────────
    describe('updateSegmento', () => {
        it('actualiza un segmento existente', async () => {
            const req = {
                params: { ruletaId: 1, id: 2 },
                body: { probabilidad_pct: 20, activo: true }
            };
            const res = mockRes();
            const t = await sequelize.transaction();
            const seg = { probabilidad_pct: 10, activo: false, save: jest.fn(), ruleta_id: 1 };
            RuletaPremio.findOne.mockResolvedValue(seg);
            RuletaPremio.findAll.mockResolvedValue([{ probabilidad_pct: 20, activo: true }]);

            await controller.updateSegmento(req, res);

            expect(seg.save).toHaveBeenCalled();
            expect(t.commit).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(seg);
        });

        it('retorna 404 si el segmento no existe', async () => {
            const req = { params: { ruletaId: 1, id: 2 }, body: {} };
            const res = mockRes();
            const t = await sequelize.transaction();
            RuletaPremio.findOne.mockResolvedValue(null);

            await controller.updateSegmento(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Segmento no encontrado' });
            expect(t.rollback).toHaveBeenCalled();
        });
    });

    // ────────────────────────────────
    describe('removeSegmento', () => {
        it('elimina correctamente un segmento', async () => {
            const req = { params: { ruletaId: 1, id: 2 } };
            const res = mockRes();
            const t = await sequelize.transaction();

            const seg = { destroy: jest.fn() };
            RuletaPremio.findOne.mockResolvedValue(seg);

            await controller.removeSegmento(req, res);

            expect(seg.destroy).toHaveBeenCalled();
            expect(t.commit).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(204);
        });

        it('retorna 404 si el segmento no existe', async () => {
            const req = { params: { ruletaId: 1, id: 2 } };
            const res = mockRes();
            const t = await sequelize.transaction();

            RuletaPremio.findOne.mockResolvedValue(null);

            await controller.removeSegmento(req, res);
            expect(t.rollback).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
