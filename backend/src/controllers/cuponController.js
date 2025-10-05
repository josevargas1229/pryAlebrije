const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { CuponUsuario, Premio, Carrito, DetalleCarrito, Product } = require('../models/associations');

/** Calcular total actual del carrito del usuario */
const calcularTotalCarrito = async (usuario_id, transaction) => {
  const carrito = await Carrito.findOne({ where: { usuario_id }, transaction });
  if (!carrito) return 0;

  const detalles = await DetalleCarrito.findAll({
    where: { carrito_id: carrito.id },
    include: [{ model: Product, attributes: ['precio'] }],
    transaction
  });

  let total = 0;
  for (const d of detalles) {
    const cantidad = d.cantidad || 1;
    const precio = Number(d.Product?.precio || 0);
    total += cantidad * precio;
  }
  return total;
};

/** Validar cupón y devolver información */
exports.validarCupon = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { userId: usuario_id } = req.user || {};
    const { codigo } = req.body;

    if (!usuario_id) { await transaction.rollback(); return res.status(401).json({ message: 'No autenticado.' }); }
    if (!codigo) { await transaction.rollback(); return res.status(400).json({ message: 'Código de cupón requerido.' }); }

    const totalCarrito = await calcularTotalCarrito(usuario_id, transaction);
    const ahora = new Date();

    // Buscar cupón válido
    const cupon = await CuponUsuario.findOne({
      where: { usuario_id, codigo, estado: 'emitido', vence_el: { [Op.gt]: ahora } },
      include: [{ model: Premio, as: 'premio' }],
      transaction,
    });

    if (!cupon) {
      await transaction.rollback();
      return res.status(400).json({ message: 'El cupón no existe, está vencido o ya fue usado.' });
    }

    // Validar monto mínimo
    const premio = cupon.premio;
    if (!premio) {
      await transaction.rollback();
      return res.status(400).json({ message: 'El premio asociado al cupón no es válido.' });
    }

    if (Number(totalCarrito) < Number(premio.cantidad_minima || 0)) {
      await transaction.rollback();
      return res.status(400).json({
        message: `El monto mínimo para usar este cupón es ${premio.cantidad_minima}.`,
        totalActual: totalCarrito
      });
    }

    const descuento = Number(premio.cantidad_a_descontar || 0);
    const totalConDescuento = Math.max(0, totalCarrito - descuento);

    await transaction.commit();
    return res.status(200).json({
      message: 'Cupón válido.',
      codigo: cupon.codigo,
      descuento,
      total_original: totalCarrito,
      total_con_descuento: totalConDescuento,
      vence_el: cupon.vence_el
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al validar cupón:', error);
    res.status(500).json({ message: 'Error al validar cupón', error: error.message });
  }
};

/** Aplicar y marcar el cupón como usado */
exports.aplicarCupon = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { userId: usuario_id } = req.user || {};
    const { codigo } = req.body;

    if (!usuario_id) { await transaction.rollback(); return res.status(401).json({ message: 'No autenticado.' }); }
    if (!codigo) { await transaction.rollback(); return res.status(400).json({ message: 'Código de cupón requerido.' }); }

    const totalCarrito = await calcularTotalCarrito(usuario_id, transaction);
    const ahora = new Date();

    const cupon = await CuponUsuario.findOne({
      where: { usuario_id, codigo, estado: 'emitido', vence_el: { [Op.gt]: ahora } },
      include: [{ model: Premio, as: 'premio' }],
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!cupon) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Cupón inválido, vencido o ya usado.' });
    }

    const premio = cupon.premio;
    if (Number(totalCarrito) < Number(premio.cantidad_minima || 0)) {
      await transaction.rollback();
      return res.status(400).json({
        message: `El monto mínimo para usar este cupón es ${premio.cantidad_minima}.`
      });
    }

    const descuento = Number(premio.cantidad_a_descontar || 0);
    const totalFinal = Math.max(0, totalCarrito - descuento);

    // Marcar cupón como usado
    await cupon.update(
      { estado: 'usado', usado_en: new Date() },
      { transaction }
    );

    await transaction.commit();
    return res.status(200).json({
      message: 'Cupón aplicado correctamente.',
      total_original: totalCarrito,
      descuento,
      total_final: totalFinal
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al aplicar cupón:', error);
    res.status(500).json({ message: 'Error al aplicar cupón', error: error.message });
  }
};
