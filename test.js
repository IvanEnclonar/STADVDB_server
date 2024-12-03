const mysql = require('mysql2');
const { syncFragment, syncCentral } = require('./syncs');


// delete on central
const connection = mysql.createConnection({
    host: 'ccscloud.dlsu.edu.ph', // Replace with
    port: 22262, // Replace with your port
    user: 'username', //
    password: 'password', // Replace with your MySQL password
    database: 'fragment1',
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the MySQL database!');
});

connection.query('select * from steamgames where AppID = 10;', (err, results) => {
    if (err) {
        console.error('Error executing query:', err.message);
        return;
    }
    console.log('Query results:', results);
});

connection.end();


