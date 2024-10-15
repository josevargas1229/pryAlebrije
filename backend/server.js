/**
 * The function `startServer` establishes a connection to the database, synchronizes models with the
 * database, and starts the server on a specified port.
 */
const app = require('./src/app');
const sequelize = require('./src/config/database');
const models = require('./src/models/associations');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Autenticar la conexión a la base de datos
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');

        // Sincronizar los modelos con la base de datos
        await sequelize.sync({ force: false });
        console.log('Modelos sincronizados con la base de datos.');

        // Iniciar el servidor
        app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
    }
}

startServer();