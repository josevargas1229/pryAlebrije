const sequelize = require('../config/database');
const { Venta, DetalleVenta, User, Product, Talla, ColorProducto, TipoProducto, ProductoTallaColor, ImagenProducto } = require('../models/associations');
const { Op } = require('sequelize');

/**
 * Crear una nueva venta con detalles
 */
exports.createVenta = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
      const { usuario_id, total, productos, recogerEnTienda, direccion_id } = req.body;

      if (!productos || productos.length === 0) {
          return res.status(400).json({ message: "No se pueden procesar ventas sin productos." });
      }

      const nuevaVenta = await Venta.create({
          usuario_id,
          total,
          recoger_en_tienda: recogerEnTienda,
          estado: 'Pendiente',
          direccion_id: direccion_id || null,
          created_at: new Date()
      }, { transaction });

      for (const item of productos) {
          const { producto_id, talla_id, color_id, cantidad, precio_unitario } = item;

          if (!talla_id || !color_id) {
              await transaction.rollback();
              return res.status(400).json({ message: "Los productos deben tener talla y color." });
          }

          const productoTallaColor = await ProductoTallaColor.findOne({
              where: { producto_id, talla_id, color_id }
          });

          if (!productoTallaColor) {
              await transaction.rollback();
              return res.status(404).json({ message: 'Combinación de producto, talla y color no encontrada.' });
          }

          if (productoTallaColor.stock < cantidad) {
              await transaction.rollback();
              return res.status(400).json({ message: 'No hay suficiente stock disponible.' });
          }

          // Resta el stock
          productoTallaColor.stock -= cantidad;
          await productoTallaColor.save({ transaction });

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
      console.error('Error en `createVenta`:', error);
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
                as: 'detalles',
                include: [
                    {
                        model: Product,
                        as: 'producto',
                        attributes: ['id', 'precio'],
                        include: [
                            {
                                model: TipoProducto,
                                as: 'tipoProducto',
                                attributes: ['nombre']
                            },
                            {
                                model: ImagenProducto,
                                as: 'imagenes', // Alias correcto para ImagenProducto
                                attributes: ['imagen_url']
                            }
                        ]
                    },
                    {
                        model: Talla,
                        as: 'talla',  // Cambié de 'Talla' a 'talla' para que coincida con tus asociaciones.
                        attributes: ['talla']
                    },
                    {
                        model: ColorProducto,
                        as: 'color', // Cambié de 'ColorProducto' a 'color' para que coincida con tus asociaciones.
                        attributes: ['color', 'colorHex']
                    }
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
                  as: 'detalles', // Asegúrate de usar el alias 'detalles' aquí
                  include: [
                      {
                          model: Product,
                          as: 'producto',
                          attributes: ['id', 'precio'],
                          include: [
                              {
                                  model: TipoProducto,
                                  as: 'tipoProducto',
                                  attributes: ['nombre']
                              },
                              {
                                  model: ImagenProducto,
                                  as: 'imagenes',
                                  attributes: ['imagen_url']
                              }
                          ]
                      },
                      {
                          model: Talla,
                          as: 'talla',
                          attributes: ['talla']
                      },
                      {
                          model: ColorProducto,
                          as: 'color',
                          attributes: ['color', 'colorHex']
                      }
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

