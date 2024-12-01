const WebSocket = require('ws');
const fs = require('fs');
const mysql = require('mysql2');
const { syncFragment, syncCentral } = require('./syncs');

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


// CRUD
/**
 * TODO: Create a function to read top 10 entries from the database
 * Read the entries from this DB
 */
const readTopEntries = () => {
  // returns 0 if there is an error, returns results if successful

  const connection = mysql.createConnection({
    host: 'localhost', // Replace with your host
    user: 'root', // Replace with your MySQL username
    password: 'password', // Replace with your MySQL password
    database: 'central', // Replace with your database name
  });

  // Connect to the database
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err.message);
      return 0;
    }
    console.log('Connected to the MySQL database!');
  });

  connection.query('SELECT AppID, Name, Release_date FROM steamgames ORDER BY Release_date DESC LIMIT 10', (err, results) => {
    if (err) {
      console.error('Error executing query:', err.message);
      return 0;
    }
    return results;
  });

  connection.end();
};

/**
 * TODO: Search for an entry in the database
 * Read the entry from this DB
 */
const readEntry = (entry) => {
  const AppID = entry.AppID;

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
      return 0;
    }
    console.log('Connected to the MySQL database!');
  });

  connection.query('SELECT * FROM your_table WHERE AppID = ?', [AppID], (err, results) => {
    if (err) {
      console.error('Error executing query:', err.message);
      return 0;
    }
    return results;
  });

  connection.end();
};


/**
 * TODO: Create function for updating an entry in the database
 * Update the entry in this DB
 * Communicate with other servers to update the entry in their DBs
 */
const updateEntry = (sanitizedParam) => {
  // Add your update logic here
  const AppID = entry.AppID;
  const sql = `UPDATE steamgames
            SET \`Name\` = ?, 
            \`Release_date\` = ?, 
            \`Estimated_owners\` = ?, 
            \`Peak_CCU\` = ?, 
            \`Required_age\` = ?, 
            \`Price\` = ?, 
            \`DiscountDLC_count\` = ?, 
            \`About_the_game\` = ?, 
            \`Supported_languages\` = ?, 
            \`Full_audio_languages\` = ?, 
            \`Reviews\` = ?, 
            \`Header_image\` = ?, 
            \`Website\` = ?, 
            \`Support_url\` = ?, 
            \`Support_email\` = ?, 
            \`Metacritic_score\` = ?, 
            \`Metacritic_url\` = ?, 
            \`User_score\` = ?, 
            \`Positive\` = ?, 
            \`Negative\` = ?, 
            \`Score_rank\` = ?, 
            \`Achievements\` = ?, 
            \`Recommendations\` = ?, 
            \`Notes\` = ?, 
            \`Average_playtime_forever\` = ?, 
            \`Average_playtime_two_weeks\` = ?, 
            \`Median_playtime_forever\` = ?, 
            \`Median_playtime_two_weeks\` = ?, 
            \`Developers\` = ?, 
            \`Publishers\` = ?, 
            \`Categories\` = ?, 
            \`Genres\` = ?, 
            \`Tags\` = ?, 
            \`Screenshots\` = ?, 
            \`Movies\` = ?
            WHERE \`AppID\` = ?;
        `;

  const qparam = [
    sanitizedParam.Name,
    sanitizedParam.Release_date,
    sanitizedParam.Estimated_owners,
    sanitizedParam.Peak_CCU,
    sanitizedParam.Required_age,
    sanitizedParam.Price,
    sanitizedParam.DiscountDLC_count,
    sanitizedParam.About_the_game,
    sanitizedParam.Supported_languages,
    sanitizedParam.Full_audio_languages,
    sanitizedParam.Reviews,
    sanitizedParam.Header_image,
    sanitizedParam.Website,
    sanitizedParam.Support_url,
    sanitizedParam.Support_email,
    sanitizedParam.Metacritic_score,
    sanitizedParam.Metacritic_url,
    sanitizedParam.User_score,
    sanitizedParam.Positive,
    sanitizedParam.Negative,
    sanitizedParam.Score_rank,
    sanitizedParam.Achievements,
    sanitizedParam.Recommendations,
    sanitizedParam.Notes,
    sanitizedParam.Average_playtime_forever,
    sanitizedParam.Average_playtime_two_weeks,
    sanitizedParam.Median_playtime_forever,
    sanitizedParam.Median_playtime_two_weeks,
    sanitizedParam.Developers,
    sanitizedParam.Publishers,
    sanitizedParam.Categories,
    sanitizedParam.Genres,
    sanitizedParam.Tags,
    sanitizedParam.Screenshots,
    sanitizedParam.Movies,
    id
  ];



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
      return 0;
    }
    console.log('Connected to the MySQL database!');
  });

  connection.query(sql, qparam, (err, results) => {
    if (err) {
      console.error('Error executing query:', err.message);
      return 0;
    }
    console.log('Query results:', results);
  });
  connection.end();
};


/**
 * TODO: Create function for deleting an entry from the database
 * Delete the entry from this DB
 * Communicate with other servers to delete the entry from their DBs
 */
const deleteEntry = (entry) => {
  const AppID = entry.AppID;

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
      return 0;
    }
    console.log('Connected to the MySQL database!');
  });

  connection.query('DELETE FROM your_table WHERE AppID = ?', [AppID], (err, results) => {
    if (err) {
      console.error('Error executing query:', err.message);
      return 0;
    }
    console.log('Query results:', results);
  });

  connection.end();

  // Send the log to other servers
}



// start express server
const express = require('express');
const app = express();
const PORT = 4000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST endpoint
app.post('/getTopEntries', (req, res) => {
  const results = readTopEntries();
  res.json(results);
});

app.post('/getEntry', (req, res) => {
  const entry = req.body;
  const results = readEntry(entry);
  res.json(results);
});

app.post('/updateEntry', (req, res) => {
  const entry = req.body;
  const results = updateEntry(entry);
  res.json(results);
});

app.post('/deleteEntry', (req, res) => {
  const entry = req.body;
  const results = deleteEntry(entry);
  res.json(results);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

