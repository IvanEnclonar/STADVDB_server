const mysql = require('mysql2/promise')

const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    namedPlaceholders: true,
    waitForConnections: true,
    connectionLimit: 10, // Adjust based on traffic
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0
});

const pool2 = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME_2,
    namedPlaceholders: true,
    waitForConnections: true,
    connectionLimit: 10, // Adjust based on traffic
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0
});

const pool3 = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME_3,
    namedPlaceholders: true,
    waitForConnections: true,
    connectionLimit: 10, // Adjust based on traffic
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0
});


module.exports = { pool, pool2, pool3 } 