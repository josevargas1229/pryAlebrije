const controller = require('../controllers/ruletaSpinController');
const { Op } = require('sequelize');

// 🧱 Mocks de modelos y dependencias
jest.mock('../models/associations', () => ({
    Ruleta: { findByPk: jest.fn(), findOne: jest.fn() },
    RuletaPremio: { findAll: jest.fn() },
    Premio: { findOne: jest.fn() },
    Participacion: { create: jest.fn() },
    CuponUsuario: { create: jest.fn() },
    IntentoUsuario: { findOne: jest.fn() }
}));

jest.mock('../config/database', () => ({
    transaction: jest.fn(() => ({
        commit: jest.fn(),
        rollback: jest.fn(),
        LOCK: { UPDATE: 'UPDATE' },
        finished: false
    })),
    col: jest.fn(),
}));

jest.mock('../utils/coupons', () => ({
    generateCouponCode: jest.fn(() => 'ABC123XYZ')
}));

jest.mock('../config/logger', () => ({
    errorLogger: { error: jest.fn() }
}));

const {
    Ruleta,
    RuletaPremio,
    Premio,
    Participacion,
    CuponUsuario,
    IntentoUsuario
} = require('../models/associations');

const sequelize = require('../config/database');
const { generateCouponCode } = require('../utils/coupons');
const { errorLogger } = require('../config/logger');

// 🔧 Helper para res
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('ruletaSpinController.spin', () => {
    beforeEach(() => jest.clearAllMocks());

    it('retorna 401 si no hay usuario autenticado', async () => {
        const req = { user: null, params: { ruletaId: 1 } };
        const res = mockRes();
        const t = await sequelize.transaction();

        await controller.spin(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No autenticado' });
        expect(t.rollback).toHaveBeenCalled();
    });

    it('retorna 403 si no tiene intentos disponibles', async () => {
        const req = { user: { userId: 1 }, params: { ruletaId: 1 } };
        const res = mockRes();
        const t = await sequelize.transaction();

        IntentoUsuario.findOne.mockResolvedValue(null);

        await controller.spin(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'No tienes intentos disponibles.'
        }));
        expect(t.rollback).toHaveBeenCalled();
    });

    it('retorna 404 si no hay ruleta activa', async () => {
        const req = { user: { userId: 1 }, params: { ruletaId: 1 } };
        const res = mockRes();
        const t = await sequelize.transaction();

        IntentoUsuario.findOne.mockResolvedValue({ intentos_consumidos: 0 });
        Ruleta.findByPk.mockResolvedValue(null);

        await controller.spin(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'No hay ruleta activa.' });
        expect(t.rollback).toHaveBeenCalled();
    });

    it('retorna 409 si ruleta no tiene segmentos', async () => {
        const req = { user: { userId: 1 }, params: { ruletaId: 1 } };
        const res = mockRes();
        const t = await sequelize.transaction();

        IntentoUsuario.findOne.mockResolvedValue({ intentos_consumidos: 0, save: jest.fn() });
        Ruleta.findByPk.mockResolvedValue({ id: 1 });
        RuletaPremio.findAll.mockResolvedValue([]);

        await controller.spin(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ error: 'Ruleta sin segmentos activos.' });
        expect(t.rollback).toHaveBeenCalled();
    });

    it('retorna 500 si probabilidades superan 100%', async () => {
        const req = { user: { userId: 1 }, params: { ruletaId: 1 } };
        const res = mockRes();
        const t = await sequelize.transaction();

        IntentoUsuario.findOne.mockResolvedValue({ intentos_consumidos: 0, save: jest.fn() });
        Ruleta.findByPk.mockResolvedValue({ id: 1 });
        RuletaPremio.findAll.mockResolvedValue([
            { probabilidad_pct: 80, activo: true, premio: { activo: true } },
            { probabilidad_pct: 50, activo: true, premio: { activo: true } }
        ]);

        await controller.spin(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Probabilidades inválidas.' });
    });

    it('maneja caso sin premio y busca "Sin Premio"', async () => {
        const req = { user: { userId: 1 }, params: { ruletaId: 1 } };
        const res = mockRes();
        const t = await sequelize.transaction();

        const intento = { intentos_consumidos: 0, save: jest.fn() };
        IntentoUsuario.findOne.mockResolvedValue(intento);
        Ruleta.findByPk.mockResolvedValue({ id: 1 });
        RuletaPremio.findAll.mockResolvedValue([
            { probabilidad_pct: 50, activo: true, premio: null }
        ]);
        Premio.findOne.mockResolvedValue({ id: 9, nombre: 'Sin Premio', activo: true });
        Participacion.create.mockResolvedValue({ id: 11 });

        await controller.spin(req, res);

        expect(Premio.findOne).toHaveBeenCalledWith(expect.objectContaining({
            where: { nombre: 'Sin Premio', activo: true }
        }));
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            exito: true,
            resultado: 'sin_premio'
        }));
        expect(t.commit).toHaveBeenCalled();
    });

    it('genera cupón cuando el premio tiene descuento', async () => {
        const req = { user: { userId: 5 }, params: { ruletaId: 2 } };
        const res = mockRes();
        const t = await sequelize.transaction();

        const premioGanado = {
            id: 3,
            nombre: 'Descuento 20%',
            activo: true,
            cantidad_a_descontar: 20,
            cantidad_minima: 100,
            increment: jest.fn()
        };

        const intento = { intentos_consumidos: 0, save: jest.fn() };
        IntentoUsuario.findOne.mockResolvedValue(intento);
        Ruleta.findByPk.mockResolvedValue({ id: 2, imagen_ruleta: 'ruleta.png' });
        RuletaPremio.findAll.mockResolvedValue([
            { probabilidad_pct: 100, premio: premioGanado }
        ]);
        Participacion.create.mockResolvedValue({ id: 99, save: jest.fn() });
        CuponUsuario.create.mockResolvedValue({
            id: 77,
            codigo: 'ABC123XYZ',
            vence_el: new Date(),
            estado: 'emitido'
        });

        await controller.spin(req, res);

        expect(CuponUsuario.create).toHaveBeenCalled();
        expect(generateCouponCode).toHaveBeenCalled();
        expect(premioGanado.increment).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            exito: true,
            premio: expect.objectContaining({ nombre: 'Descuento 20%' }),
            cupon: expect.objectContaining({ codigo: 'ABC123XYZ' })
        }));
    });

    it('maneja errores y los registra', async () => {
        const req = { user: { userId: 10 }, params: { ruletaId: 1 } };
        const res = mockRes();
        const t = await sequelize.transaction();
        IntentoUsuario.findOne.mockRejectedValue(new Error('falló DB'));

        await controller.spin(req, res);

        expect(errorLogger.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al girar ruleta'
        }));
    });
});
