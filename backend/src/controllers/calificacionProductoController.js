const CalificacionProducto = require('../models/CalificacionProducto');
const { Op } = require('sequelize');

// Obtener calificación promedio y total de calificaciones de un producto
exports.obtenerCalificacionProducto = async (req, res) => {
  try {
      const { producto_id } = req.params;

      const calificaciones = await CalificacionProducto.findAll({
          where: { producto_id }
      });

      if (calificaciones.length === 0) {
          return res.status(200).json({ promedio: 0, total: 0, detalle: [] }); //  Agregar detalle vacío
      }

      // Calcular promedio
      const sumaCalificaciones = calificaciones.reduce((total, c) => total + c.calificacion, 0);
      const promedio = sumaCalificaciones / calificaciones.length;

      // Obtener la cantidad de calificaciones por estrella (1-5)
      const detalleCalificaciones = [5, 4, 3, 2, 1].map(estrella => ({
          estrella,
          cantidad: calificaciones.filter(c => c.calificacion === estrella).length
      }));

      res.status(200).json({
          promedio: parseFloat(promedio.toFixed(1)), // Redondear a 1 decimal
          total: calificaciones.length,
          detalle: detalleCalificaciones //  Devolver la distribución de calificaciones
      });
  } catch (error) {
      res.status(500).json({ message: 'Error al obtener calificación del producto', error });
  }
};

// Agregar una nueva calificación
exports.agregarCalificacionProducto = async (req, res) => {
  try {
      const { producto_id, usuario_id, calificacion } = req.body;

      //  Verifica qué datos está recibiendo
      console.log(" Datos recibidos en Backend:", req.body);

      // Verifica si los datos están completos
      if (!producto_id || !usuario_id || !calificacion) {
          return res.status(400).json({ message: 'Todos los campos son obligatorios' });
      }

      if (calificacion < 1 || calificacion > 5) {
          return res.status(400).json({ message: 'La calificación debe estar entre 1 y 5' });
      }

      const nuevaCalificacion = await CalificacionProducto.create({
          producto_id,
          usuario_id,
          calificacion
      });

      res.status(201).json({ message: 'Calificación registrada', calificacion: nuevaCalificacion });
  } catch (error) {
      console.error(" Error al registrar calificación:", error);
      res.status(500).json({ message: 'Error al registrar calificación', error });
  }
};

