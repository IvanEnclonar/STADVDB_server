const mysql = require('mysql2');
const { syncFragment, syncCentral } = require('./syncs');
const Queue = require('./queue');

const dbQuery = async (sql, qparam) => {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection({
            host: 'localhost', // Replace with your host
            port: 3306, // Replace with your port
            user: 'username', //
            password: 'password', // Replace with your MySQL password
            database: 'fragment1', // Replace with your database name
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
    await syncFragment(1)
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

const insertEntry = (sanitizedParam) => {
    const sql = `INSERT INTO steamgames (
                        \`AppID\`,
                        \`Name\`,
                        \`Release_date\`,
                        \`Estimated_owners\`,
                        \`Peak_CCU\`,
                        \`Required_age\`,
                        \`Price\`,
                        \`DiscountDLC_count\`,
                        \`About_the_game\`,
                        \`Supported_languages\`,
                        \`Full_audio_languages\`,
                        \`Reviews\`,
                        \`Header_image\`,
                        \`Website\`,
                        \`Support_url\`,
                        \`Support_email\`,
                        \`Metacritic_score\`,
                        \`Metacritic_url\`,
                        \`User_score\`,
                        \`Positive\`,
                        \`Negative\`,
                        \`Score_rank\`,
                        \`Achievements\`,
                        \`Recommendations\`,
                        \`Notes\`,
                        \`Average_playtime_forever\`,
                        \`Average_playtime_two_weeks\`,
                        \`Median_playtime_forever\`,
                        \`Median_playtime_two_weeks\`,
                        \`Developers\`,
                        \`Publishers\`,
                        \`Categories\`,
                        \`Genres\`,
                        \`Tags\`,
                        \`Screenshots\`,
                        \`Movies\`
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    );`

    const qparam = [
        sanitizedParam.AppID,
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
    ];
    return new Promise((resolve, reject) => {
        dbQuery(sql, qparam).then((results) => {
            resolve(results);
        }).catch((err) => {
            console.error(err);
            reject(0);
        });
    });
}

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
    console.log(AppID)

    return new Promise((resolve, reject) => {
        dbQuery('DELETE FROM steamgames WHERE AppID = ?;', [AppID]).then((results) => {
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
const main_server = '10.2.0.225';
const fragment_1 = '10.2.0.226'
const fragment_2 = '10.2.0.227'


// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST endpoint

app.post('/sync', async (req, res) => {
    const response = await syncCentral();

    if (response == 1) {
        return res.status(200).json({ success: true });
    }
    else {
        return res.status(200).json({ success: false });
    }


})

app.post('/manualGetTopEntries', async (req, res) => {

    console.log('\n/manualGetTopEntries')
    try {
        const results = await readTopEntries();
        return res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }


})

app.post('/getTopEntries', async (req, res) => {

    console.log("\n/getTopEntries")

    // Attempt main server
    try {
        console.log("Attempting main server...")
        const response = await fetch(`${main_server}/getTopEntries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Main server request failed")
        } else {
            console.log("Main server success")
            const rows = await response.json();
            return res.json(rows);
        }
    } catch (err) {
        console.log("Error: Main server request failed")
        // if central node is down, get top entries from fragment 2
    }

    // Attempt fragment2 server
    try {
        console.log("Attempting fragment2 server...")
        const response = await fetch(`${fragment_2}/manualGetTopEntries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Fragment 2 request failed")
        } else {
            console.log("Fragment 2 success")
            const rows = await response.json();
            return res.json(rows);
        }
    } catch (err) {
        console.log("Error: Fragment 2 request failed")
    }

    // Attempt fragment1 server

    try {
        console.log("Attempting fragment1 server...")
        const results = await readTopEntries();
        console.log("Fragment 1 success")
        return res.json(results);
    } catch (err) {
        console.log("Error: Fragment 1 request failed")
        res.status(500).json({ message: err.message });
    }
});

app.post('/manualGetCount', async (req, res) => {

    try {
        const results = await readCount()
        return res.json(results);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
})

app.post('/getCount', async (req, res) => {

    console.log("\n/getCount")
    // Attempt main server
    try {
        console.log("Attempting main server...")
        const response = await fetch(`${main_server}/getCount`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Main server request failed")
        } else {
            const rows = await response.json();
            return res.json(rows);
        }
    } catch (err) {
        console.log("Error: Main server request failed")
    }

    let fragment1_count, fragment2_count

    // Attempt fragment 1 server
    try {
        console.log("Attempting fragment1 server...")
        const results = await readCount();
        fragment1_count = results
    } catch (err) {
        console.log(`Error: fragment1 request failed`)
    }

    // Attempt fragment 2 server

    try {
        console.log("Attempting fragment2 server...")
        const response = await fetch(`${fragment_2}/manualGetCount`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const results = await response.json();
        fragment2_count = results
    } catch (err) {
        console.log("Error: Fragment 2 request failed")
        console.error(err)
    }

    let final_count
    if (fragment1_count && fragment2_count) {
        final_count = fragment1_count[0]['COUNT(*)'] + fragment2_count[0]['COUNT(*)']
    }
    else
        final_count = fragment1_count ? fragment1_count[0]['COUNT(*)'] : fragment2_count[0]['COUNT(*)']



    return res.json([{ 'COUNT(*)': final_count }])
});


app.post('/deleteEntry', async (req, res) => {

    console.log("\n/deleteEntry")

    try {
        // Try Central Node
        console.log("Attempting main server...")
        const response = await fetch(`${main_server}/deleteEntry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });
        const rows = await response.json();
        return res.json(rows);
    } catch (err) {
        // If central node is down
        console.log("Error: Main server request failed")
        console.error(err.message)
    }

    try {
        console.log("Deleting from fragment 1")
        await deleteEntry(req.body)
        console.log("Deleting from fragment 2")
        const response = await fetch(`${fragment_2}/manualDeleteEntry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });
        console.log("Success")
        return res.json(response)
    } catch (err) {
        console.error(err.message)
        return res.status(500).json({ message: err.message });
    }
});


app.post('/getSingleGame', async (req, res) => {
    console.log("\n/getSingleGame");

    // Attempt main server
    try {
        console.log("Attempting main server...");
        const response = await fetch(`${main_server}/getSingleGame`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            throw new Error("Main server request failed");
        }

        const rows = await response.json();
        console.log("Main server response successful");
        return res.json(rows); // End response here
    } catch (err) {
        console.log("Main server failed, trying fragment1...");
    }

    // Attempt fragment1 server
    try {
        const entry = req.body;
        const results = await readGame(entry);

        if (results.length > 0) {
            console.log("Fragment1 server response successful");
            return res.json(results); // End response here
        }

        console.log("Game not found in fragment1");
        throw new Error("Game not found on fragment1");
    } catch (err) {
        console.log("Fragment1 failed, trying fragment2...");
    }

    // Attempt fragment2 server
    try {
        const response = await fetch(`${fragment_2}/getSingleGame`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            throw new Error("Fragment2 server request failed");
        }

        const rows = await response.json();
        console.log("Fragment2 server response successful");
        return res.json(rows); // End response here
    } catch (err) {
        console.log("Fragment2 failed");
        return res.status(500).json({ message: "Failed to fetch data from all servers" });
    }
});

app.post('/insertEntry', async (req, res) => {

    console.log("\n/insertEntry")

    try {
        const results = await insertEntry(req.body)
        return res.json(results)
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
})

app.post('/manualDeleteEntry', async (req, res) => {
    console.log("\n/manualDeleteEntry")
    try {
        const results = await deleteEntry(req.body)
        return res.json(results)
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
})

app.post('/updateEntry', async (req, res) => {


    console.log("\n/updateEntry")
    try {
        console.log("Attempting main server...")
        const response = await fetch(`${main_server}/updateEntry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            return res.status(500).json({ message: 'Failed to update entry from main server' });
            return;
        } else {
            const rows = await response.json();
            return res.json(rows);
        }
    } catch (err) {
        console.log("Error: Main server request failed")
    }

    try {
        const { sanitizedParam, id } = req.body;
        sanitizedParam['AppID'] = id

        const new_year = (new Date(sanitizedParam.Release_date)).getFullYear()

        // Delete from fragment 1
        console.log("Deleting from fragment 1")
        await dbQuery(`DELETE FROM steamgames WHERE AppID = ?`, id)
        // Delete from fragment 2
        console.log("Deleting from fragment 2")
        await fetch(`${fragment_2}/manualDeleteEntry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sanitizedParam),
        });

        if (new_year < 2020) {
            // Insert into fragment 1
            console.log("Inserting to fragment1")
            await insertEntry(sanitizedParam)
        }
        else {
            // Insert into fragment 2
            console.log("Inserting to fragment2")
            await fetch(`${fragment_2}/insertEntry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sanitizedParam),
            });
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
});

app.post('/manualSearch', async (req, res) => {
    console.log("\n/manualSearch")

    try {
        const { query } = req.body;
        const results = await dbQuery(`SELECT AppID, Name, Release_date FROM steamgames WHERE Name LIKE ? OR AppID = ?';`, [query, query]);
        return res.json(results);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
});

app.post('/search', async (req, res) => {

    console.log("\n/search")

    try {
        console.log("Attempting main server...")
        const response = await fetch(`${main_server}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            throw new Error("Main server request failed")
        } else {
            const rows = await response.json();
            return res.json(rows);
        }

    } catch (err) {
        console.log("Error: Main server is down")
    }

    try {
        const { query } = req.body;
        console.log(query)
        console.log("Searching fragment 1")
        const fragment_1_results = await dbQuery(`SELECT AppID, Name, Release_date FROM steamgames WHERE Name LIKE ? OR AppID = ?;`, [query, query]);
        console.log(fragment_1_results)
        console.log("Searching fragment 2")
        const response = await fetch(`${fragment_2}/manualSearch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });
        fragment_2_results = await response.json()
        console.log(fragment_2_results)


        return res.json(fragment_1_results.concat(fragment_2_results));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

