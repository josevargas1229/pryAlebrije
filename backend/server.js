const app = require('./src/app');
const sequelize = require('./src/config/database');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');

        app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

startServer();
