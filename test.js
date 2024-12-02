const WebSocket = require('ws');
const fs = require('fs');
const mysql = require('mysql2');
const { syncFragment, syncCentral } = require('./syncs');


// delete on central
const connection = mysql.createConnection({
    host: 'localhost', // Replace with
    user: 'root', // Replace with your MySQL username
    password: 'password', // Replace with your MySQL password
    database: 'central', // Replace with your database name
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the MySQL database!');
});

connection.query('DELETE FROM steamgames WHERE AppID = 80', (err, results) => {
    if (err) {
        console.error('Error executing query:', err.message);
        return;
    }
    console.log('Query results:', results);
});

connection.end();

// syncFragment('delete', 'central', '1');
syncFragment(1);


