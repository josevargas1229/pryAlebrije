const sequelize = require('../config/database');
const { Venta, DetalleVenta, User, Product, Talla, ColorProducto, TipoProducto } = require('../models/associations');
const { Op } = require('sequelize');

/**
 * Crear una nueva venta con detalles
 */
exports.createVenta = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
      const { usuario_id, total, productos, recogerEnTienda, direccion_id } = req.body; //  Agregamos direccion_id

      if (!productos || productos.length === 0) {
          return res.status(400).json({ message: "No se pueden procesar ventas sin productos." });
      }

      // Si no se envió una dirección, aseguramos que sea `NULL`
      const nuevaVenta = await Venta.create({
          usuario_id,
          total,
          recoger_en_tienda: recogerEnTienda,
          estado: 'Pendiente',
          direccion_id: direccion_id || null, //  Si no se envía, se establece en NULL
          created_at: new Date()
      }, { transaction });

      for (const item of productos) {
          const { producto_id, talla_id, color_id, cantidad, precio_unitario } = item;
          await DetalleVenta.create({
              venta_id: nuevaVenta.id,
              producto_id,
              talla_id,
              color_id,
              cantidad,
              precio_unitario,
              subtotal: precio_unitario * cantidad
          }, { transaction });
      }

      await transaction.commit();
      return res.status(201).json({ message: "Venta creada con éxito.", venta: nuevaVenta });

  } catch (error) {
      await transaction.rollback();
      console.error(' Error en `createVenta`:', error);
      return res.status(500).json({ message: "Error al procesar la venta.", error: error.message });
  }
};
/**
 * Obtener todas las ventas de un usuario específico
 */
exports.getVentasByUsuario = async (req, res) => {
  try {
      const { usuario_id } = req.params;

      const ventas = await Venta.findAll({
          where: { usuario_id: usuario_id },
          include: [
              {
                  model: DetalleVenta,
                  include: [
                      {
                          model: Product,
                          as: 'producto',  //  Alias corregido
                          attributes: ['id', 'precio'],
                          include: [
                              {
                                  model: TipoProducto,
                                  attributes: ['nombre'],
                              }
                          ]
                      },
                      { model: Talla, attributes: ['talla'] },
                      { model: ColorProducto, attributes: ['color', 'colorHex'] }
                  ]
              }
          ],
          order: [['fecha_venta', 'DESC']],
      });

      return res.status(200).json({ ventas });

  } catch (error) {
      console.error('Error al obtener ventas del usuario:', error);
      return res.status(500).json({ message: "Error al obtener las ventas.", error: error.message });
  }
};


/**
 * Obtener detalles de una venta específica
 */

exports.getVentaById = async (req, res) => {
  try {
      const { venta_id } = req.params;

      const venta = await Venta.findByPk(venta_id, {
          include: [
              { model: User, attributes: ['nombre', 'email'] },
              {
                  model: DetalleVenta,
                  include: [
                      { model: Product, as: 'producto', attributes: ['nombre', 'precio'] }, //  Alias corregido
                      { model: Talla, attributes: ['talla'] },
                      { model: ColorProducto, attributes: ['color', 'colorHex'] }
                  ]
              }
          ]
      });

      if (!venta) {
          return res.status(404).json({ message: "Venta no encontrada." });
      }

      return res.status(200).json({ venta });

  } catch (error) {
      console.error('Error al obtener la venta:', error);
      return res.status(500).json({ message: "Error al obtener la venta.", error: error.message });
  }
};

