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


// CRUD
/**
 * TODO: Create function for creating a new entry in the database
 * Add the entry to this DB
 * Communicate with other servers to add the entry to their DBs
**/
const createEntry = (entry) => {
  const AppID = entry.AppID;
  const Name = entry.Name;
  const Release_date = entry.Release_date;
  const Estimated_owners = entry.Estimated_owners;
  const Peak_CCU = entry.Peak_CCU;
  const Required_age = entry.Required_age;
  const Price = entry.Price;
  const DiscountDLC_count = entry.DiscountDLC_count;
  const About_the_game = entry.About_the_game;
  const Supported_languages = entry.Supported_languages;
  const Full_audio_languages = entry.Full_audio_languages;
  const Reviews = entry.Reviews;
  const Header_image = entry.Header_image;
  const Website = entry.Website;
  const Support_url = entry.Support_url;
  const Support_email = entry.Support_email;
  const Windows = entry.Windows;
  const Mac = entry.Mac;
  const Linux = entry.Linux;
  const Metacritic_score = entry.Metacritic_score;
  const Metacritic_url = entry.Metacritic_url;
  const User_score = entry.User_score;
  const Positive = entry.Positive;
  const Negative = entry.Negative;
  const Score_rank = entry.Score_rank;
  const Achievements = entry.Achievements;
  const Recommendations = entry.Recommendations;
  const Notes = entry.Notes;
  const Average_playtime_forever = entry.Average_playtime_forever;
  const Average_playtime_two_weeks = entry.Average_playtime_two_weeks;
  const Median_playtime_forever = entry.Median_playtime_forever;
  const Median_playtime_two_weeks = entry.Median_playtime_two_weeks;
  const Developers = entry.Developers;
  const Publishers = entry.Publishers;
  const Categories = entry.Categories;
  const Genres = entry.Genres;
  const Tags = entry.Tags;
  const Screenshots = entry.Screenshots;
  const Movies = entry.Movies;

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

  connection.query('INSERT INTO your_table (AppID, Name, Release_date, Estimated_owners, Peak_CCU, Required_age, Price, DiscountDLC_count, About_the_game, Supported_languages, Full_audio_languages, Reviews, Header_image, Website, Support_url, Support_email, Windows, Mac, Linux, Metacritic_score, Metacritic_url, User_score, Positive, Negative, Score_rank, Achievements, Recommendations, Notes, Average_playtime_forever, Average_playtime_two_weeks, Median_playtime_forever, Median_playtime_two_weeks, Developers, Publishers, Categories, Genres, Tags, Screenshots, Movies) VALUES (?,'
    + AppID + ',' + Name + ',' + Release_date + ',' + Estimated_owners + ',' + Peak_CCU + ',' + Required_age + ',' + Price + ',' + DiscountDLC_count + ',' + About_the_game + ',' + Supported_languages + ',' + Full_audio_languages + ',' + Reviews + ',' + Header_image + ',' + Website + ',' + Support_url + ',' + Support_email + ',' + Windows + ',' + Mac + ',' + Linux + ',' + Metacritic_score + ',' + Metacritic_url + ',' + User_score + ',' + Positive + ',' + Negative + ',' + Score_rank + ',' + Achievements + ',' + Recommendations + ',' + Notes + ',' + Average_playtime_forever + ',' + Average_playtime_two_weeks + ',' + Median_playtime_forever + ',' + Median_playtime_two_weeks + ',' + Developers + ',' + Publishers + ',' + Categories + ',' + Genres + ',' + Tags + ',' + Screenshots + ',' + Movies + ')', (err, results) => {
      if (err) {
        console.error('Error executing query:', err.message);
        return;
      }
      console.log('Query results:', results);
    });


  connection.end();

  // Send the log to other servers
};

/**
 * TODO: Create function for reading an entry from the database
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
      return;
    }
    console.log('Connected to the MySQL database!');
  });

  connection.query('SELECT * FROM your_table WHERE AppID = ?', [AppID], (err, results) => {
    if (err) {
      console.error('Error executing query:', err.message);
      return;
    }
    console.log('Query results:', results);
  });

  connection.end();
};


/**
 * TODO: Create function for updating an entry in the database
 * Update the entry in this DB
 * Communicate with other servers to update the entry in their DBs
 */
const updateEntry = (entry) => {
  // Add your update logic here
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
      return;
    }
    console.log('Connected to the MySQL database!');
  });

  connection.query('DELETE FROM your_table WHERE AppID = ?', [AppID], (err, results) => {
    if (err) {
      console.error('Error executing query:', err.message);
      return;
    }
    console.log('Query results:', results);
  });

  connection.end();

  // Send the log to other servers

}
