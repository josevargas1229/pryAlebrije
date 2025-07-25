/* This code snippet is setting up CORS (Cross-Origin Resource Sharing) configuration for a Node.js
application using the `cors` package. Here's a breakdown of what the code is doing: */
const cors = require('cors');
require('dotenv').config();
const corsOptions = {
    origin: function (origin, callback) {
        const whitelist = process.env.CORS_WHITELIST ? process.env.CORS_WHITELIST.split(',') : ['*'];
        console.log('Origin recibido:', origin); // Depuración
    console.log('Whitelist:', whitelist);
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization','x-csrf-token'],
    credentials: true,
    optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);