const { Op, fn, col } = require('sequelize');
const { Account, IntentoFallido, HistorialBloqueos } = require('../models/associations');

// Controlador para manejar el historial de bloqueos
class BloqueosController {
    // Método para bloquear un usuario
    static async bloquearUsuario(req, res) {
        const { account_id } = req.body;
    
        try {
            // Obtener la cantidad de intentos fallidos para el usuario
            const intentosFallidos = await IntentoFallido.count({
                where: { account_id }
            });
    
            // Actualizar la cuenta para establecerla como bloqueada
            const [updatedCount, updatedAccounts] = await Account.update(
                {
                    bloqueada: true,
                    bloqueada_desde: new Date() // Establecer la fecha actual
                },
                {
                    where: { id: account_id },
                    returning: true // Devuelve los registros actualizados
                }
            );
    
            if (updatedCount === 0) {
                return res.status(404).json({ error: 'Cuenta no encontrada' });
            }
    
            // Crear un nuevo registro de bloqueo
            const nuevoBloqueo = await HistorialBloqueos.create({
                account_id,
                intentos: intentosFallidos // Guardar la cantidad de intentos fallidos
            });
    
            return res.status(201).json({ nuevoBloqueo, cuentaActualizada: updatedAccounts[0] });
        } catch (error) {
            console.error(error); // Agregar un log para mayor visibilidad en errores
            return res.status(500).json({ error: 'Error al bloquear el usuario' });
        }
    }
    

    // Método para obtener usuarios bloqueados
    static async obtenerUsuariosBloqueados(req, res) {
        const { periodo } = req.query; // Puede ser 'dia', 'semana' o 'mes'
        const date = new Date();
        let whereClause = {};
        console.log('periodo: ', periodo);

        if (periodo) {
            switch (periodo) {
                case 'dia':
                    date.setDate(date.getDate() - 1);
                    break;
                case 'semana':
                    date.setDate(date.getDate() - 7);
                    break;
                case 'mes':
                    date.setMonth(date.getMonth() - 1);
                    break;
                default:
                    return res.status(400).json({ error: 'Periodo no válido' });
            }
            whereClause.fechaBloqueo = {
                [Op.gte]: date,
            };
        }

        try {
            // Consultar el historial de bloqueos en el periodo especificado
            const bloqueos = await HistorialBloqueos.findAll({
                where: whereClause,
                include: [
                    {
                        model: Account,
                        as: 'cuenta',
                        attributes: ['nombre_usuario'],
                    },
                ],
                group: ['cuenta.id'],
                attributes: {
                    include: [[fn('COUNT', col('HistorialBloqueos.id')), 'totalBloqueos']],
                    exclude:['intentos']
                },
            });

            return res.status(200).json(bloqueos);
        } catch (error) {
            console.error(error); // Agrega esto para ver más detalles en la consola
            return res.status(500).json({ error: 'Error al obtener usuarios bloqueados' });
        }
    }



    // Método para consultar bloqueos realizados en los últimos N días
    static async obtenerBloqueosRecientes(req, res) {
        const { dias, cantidad } = req.query; // Recoge 'dias' y 'cantidad'
    
        const date = new Date();
        let whereClause = {}; // Condiciones de la consulta
    
        if (dias) {
            date.setDate(date.getDate() - dias);
            whereClause.fechaBloqueo = {
                [Op.gte]: date,
            };
        }
    
        try {
            const bloqueos = await HistorialBloqueos.findAll({
                where: whereClause,
                attributes: [
                    'account_id', // Asegúrate de tener el campo correcto que relaciona la cuenta
                    [fn('COUNT', col('account_id')), 'totalBloqueos'], // Cuenta de bloqueos por cuenta
                ],
                group: ['account_id'], // Agrupar por cuenta
                having: cantidad ? { totalBloqueos: { [Op.gte]: cantidad } } : {}, // Filtrar por cantidad si se proporciona
                include: [
                    {
                        model: Account,
                        as: 'cuenta',
                        attributes: ['id', 'nombre_usuario'],
                    },
                ],
            });
    
            return res.status(200).json(bloqueos);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al obtener bloqueos recientes' });
        }
    }
}

module.exports = BloqueosController;
