const fs = require('fs');
const path = require('path');

class LogsController {
    static async obtenerLogs(req, res) {
        const logFilePath = path.join(__dirname, '../../logs/error.log');

        try {
            const logsData = fs.readFileSync(logFilePath, 'utf-8');
            const logs = logsData.split('\n').filter(Boolean).map(line => JSON.parse(line));

            return res.status(200).json({ logs });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al obtener los logs' });
        }
    }
}

module.exports = LogsController;
