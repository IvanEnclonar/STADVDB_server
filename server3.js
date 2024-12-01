const WebSocket = require('ws');
const fs = require('fs');
const mysql = require('mysql2');

// Define WebSocket server ports for each server
const serverPort = 3000;  // Port for Server 1 (change for other servers)
const serverUrls = [
    'ws://localhost:3000',  // Server 1 itself
    'ws://localhost:3001',  // Server 2
    'ws://localhost:3002'   // Server 3
];

// Create a WebSocket server that listens for incoming messages
const wss = new WebSocket.Server({ port: serverPort });

wss.on('connection', (ws) => {
    console.log(`New connection established on Server ${serverPort}`);

    // Handle incoming log messages
    ws.on('message', (message) => {
        console.log(`Received log on Server ${serverPort}: ${message}`);
        // Store logs in a file (this can be replaced with a database)
        fs.appendFileSync('logs1.txt', `${message}\n`);
    });
});

// Function to send log message to other servers
const sendLogToOtherServers = (logMessage) => {
    serverUrls.forEach((url) => {
        const ws = new WebSocket(url);

        ws.on('open', () => {
            ws.send(logMessage);
            console.log(`Sent log to ${url}: ${logMessage}`);
            ws.close();
        });

        ws.on('error', (err) => {
            console.error(`Error sending log to ${url}:`, err);
        });
    });
};

const connection = mysql.createConnection({
    host: 'localhost', // Replace with your host
    user: 'your_username', // Replace with your MySQL username
    password: 'your_password', // Replace with your MySQL password
    database: 'my_database', // Replace with your database name
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the MySQL database!');
});

// Close the connection
connection.end();


// CRUD
/**
 * TODO: Create function for creating a new entry in the database
 * Add the entry to this DB
 * Communicate with other servers to add the entry to their DBs
**/
connection.query('SELECT * FROM your_table', (err, results) => {
    if (err) {
        console.error('Error executing query:', err.message);
        return;
    }
    console.log('Query results:', results);
});

// Close the connection
connection.end();

/**
 * TODO: Create function for reading an entry from the database
 * Read the entry from this DB
 */

/**
 * TODO: Create function for updating an entry in the database
 * Update the entry in this DB
 * Communicate with other servers to update the entry in their DBs
 */

/**
 * TODO: Create function for deleting an entry from the database
 * Delete the entry from this DB
 * Communicate with other servers to delete the entry from their DBs
 */
