const mysql = require('mysql2');
const { syncFragment, syncCentral } = require('./syncs');
const Queue = require('./queue');

const dbQuery = async (sql, qparam) => {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: 'localhost', // Replace with your host
      user: 'root', //
      password: 'password', // Replace with your MySQL password
      database: 'central', // Replace with your database name
    });

    // Connect to the database
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to the database:', err.message);
        reject(0);
      }
    });

    connection.query(sql, qparam, (err, results) => {
      if (err) {
        console.error('Error executing query:', err.message);
        reject(0);
      }
      connection.end();
      resolve(results);
    });
  });
};

const readTopEntries = async () => {
  // returns 0 if there is an error, returns results if successful
  return new Promise((resolve, reject) => {
    dbQuery('SELECT AppID, Name, Release_date FROM steamgames ORDER BY Release_date DESC LIMIT 10;', []).then((results) => {
      resolve(results);
    }).catch((err) => {
      console.error(err);
      reject(0);
    }
    );
  });
};

const readGame = async (entry) => {
  const AppID = entry.AppID;
  return new Promise((resolve, reject) => {
    dbQuery('SELECT * FROM steamgames WHERE AppID = ?;', [AppID]).then((results) => {
      resolve(results);
    }).catch((err) => {
      console.error(err);
      reject(0);
    });
  });
};

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

const deleteEntry = async (entry) => {
  const AppID = entry.AppID;
  return new Promise((resolve, reject) => {
    dbQuery('DELETE FROM steamgames WHERE AppID = ?;', [AppID]).then((results) => {
      syncFragment(1);
      syncFragment(2);
      resolve(results);
    }).catch((err) => {
      console.error(err);
      reject(0);
    });
  });
}

const readCount = async () => {
  return new Promise((resolve, reject) => {
    dbQuery('SELECT COUNT(*) FROM steamgames;', []).then((results) => {
      resolve(results);
    }).catch((err) => {
      console.error(err);
      reject(0);
    });
  });
};



// !SERVER
const express = require('express');
const app = express();
const PORT = 4000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Create queue for processing jobs
const queue = new Queue();

// POST endpoint
app.post('/getTopEntries', (req, res) => {
  queue.add(async () => {
    try {
      const results = await readTopEntries();
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  });
});

app.post('/getCount', (req, res) => {
  queue.add(async () => {
    try {
      const results = await readCount();
      await syncFragment(1);
      await syncFragment(2);
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  });
});

app.post('/deleteEntry', (req, res) => {
  queue.add(async () => {
    try {
      const entry = req.body;
      const results = await deleteEntry(entry);
      await syncFragment(1);
      await syncFragment(2);
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  });
});


app.post('/getSingleGame', (req, res) => {
  queue.add(async () => {
    try {
      const entry = req.body;
      const results = await readGame(entry);
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  });
});

app.post('/updateEntry', (req, res) => {
  queue.add(async () => {
    try {
      const { sql, qparam } = req.body;
      const results = await dbQuery(sql, qparam);
      await syncFragment(1);
      await syncFragment(2);
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  });
});

app.post('/search', (req, res) => {
  queue.add(async () => {
    try {
      const { query } = req.body;
      const search = query.slice(0, -1).replace("+", " ");
      const results = await dbQuery(`SELECT AppID, Name, Release_date FROM steamgames WHERE Name LIKE '%${search}%' OR AppID='${search}';`, []);
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

