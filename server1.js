const mysql = require('mysql2');
const { syncFragment, syncCentral } = require('./syncs');
const Queue = require('./queue');

const dbQuery = async (sql, qparam) => {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: 'localhost', // Replace with your host
      user: 'root', //
      password: '12345', // Replace with your MySQL password
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

const manualSync = async () => {
  await syncCentral()
} 

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

app.post('/sync', async (req, res) => {
  await manualSync()
  res.status(200)
})


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
  syncCentral()
  console.log(`Server running on http://localhost:${PORT}`);
});

