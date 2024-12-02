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
const PORT = 5000;
const main_server = 'http://localhost:4000';

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST endpoint
app.post('/getTopEntries', async (req, res) => {
    const response = await fetch(`${main_server}/getTopEntries`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        res.status(500).json({ message: 'Failed to fetch data from main server' });
        return;
    } else {
        const rows = await response.json();
        res.json(rows);
    }
});

app.post('/getCount', async (req, res) => {
    const response = await fetch(`${main_server}/getCount`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        res.status(500).json({ message: 'Failed to fetch data from main server' });
        return;
    } else {
        const rows = await response.json();
        res.json(rows);
    }
});

app.post('/deleteEntry', async (req, res) => {
    const response = await fetch(`${main_server}/deleteEntry`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
    });

    if (!response.ok) {
        res.status(500).json({ message: 'Failed to delete entry from main server' });
        return;
    } else {
        const rows = await response.json();
        res.json(rows);
    }
});


app.post('/getSingleGame', async (req, res) => {
    const response = await fetch(`${main_server}/getSingleGame`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
    });

    if (!response.ok) {
        res.status(500).json({ message: 'Failed to fetch data from main server' });
        return;
    } else {
        const rows = await response.json();
        res.json(rows);
    }
});

app.post('/updateEntry', async (req, res) => {
    const response = await fetch(`${main_server}/updateEntry`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
    });

    if (!response.ok) {
        res.status(500).json({ message: 'Failed to update entry from main server' });
        return;
    } else {
        const rows = await response.json();
        res.json(rows);
    }
});

app.post('/search', async (req, res) => {
    const response = await fetch(`${main_server}/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
    });

    if (!response.ok) {
        res.status(500).json({ message: 'Failed to fetch data from main server' });
        return;
    } else {
        const rows = await response.json();
        res.json(rows);
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

