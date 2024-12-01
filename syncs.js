const mysql = require('mysql2');
const { pool, pool2, pool3 } = require('./syncs2');

class dbconnection {
    constructor(host, user, password, database) {
        this.host = host;
        this.user = user;
        this.password = password;
        this.database = database;

    }

    query(sql, qparam) {
        const connection = mysql.createConnection({
            host: this.host, // Replace with your host
            user: this.user, // Replace with your MySQL username
            password: this.password, // Replace with your MySQL password
            database: this.database, // Replace with your database name
        });

        // Connect to the database
        connection.connect((err) => {
            if (err) {
                console.error('Error connecting to the database:', err.message);
                return err;
            }
            console.log('Connected to the MySQL database!');
        });

        connection.query(sql, qparam, (err, results) => {
            if (err) {
                console.error('Error executing query:', err.message);
                return;
            }
            return results;
        });

        connection.end();
    }
}

const syncFragment = async (fragmentID) => {
    console.log(`\nSyncing Fragment ${fragmentID}:`)

    const central = await mysql.createPool({
        host: 'localhost', // Replace with your host
        user: 'root', //
        password: 'password', // Replace with your MySQL password
        port: 3306,
        database: 'central', // Replace with your database name
        namedPlaceholders: true,
        waitForConnections: true,
        connectionLimit: 10, // Adjust based on traffic
        maxIdle: 10,
        idleTimeout: 60000,
        queueLimit: 0
    });

    const fragment = await mysql.createPool({
        host: 'localhost', // Replace with your host
        user: 'root', //
        password: 'password', // Replace with your MySQL password
        port: 3306,
        database: 'fragment' + fragmentID, // Replace with your database name
        namedPlaceholders: true,
        waitForConnections: true,
        connectionLimit: 10, // Adjust based on traffic
        maxIdle: 10,
        idleTimeout: 60000,
        queueLimit: 0
    });

    const logsTable = fragmentID == 1 ? "logs_old_games" : "logs_new_games";

    try {
        const lastFragmentLog = await fragment.query(`SELECT * FROM ${logsTable} ORDER BY \`timestamp\` DESC LIMIT 1`)    // Get the latest log from the fragment node
        const timeOfLastFragmentLog = lastFragmentLog[0]?.timestamp ?? '1970-01-01 00:00:00'  // If no logs exist, default time to unix epoch
        const masterLogs = await central.query(`SELECT * FROM ${logsTable} WHERE \`timestamp\` > ?`, [timeOfLastFragmentLog])   // Collect all logs from master written AFTER last fragment record

        console.log(`Time of last fragment log: ${timeOfLastFragmentLog}`)

        // For each log that has not been synced to the fragment, execute log action
        for (const log of masterLogs) {
            console.log(`(${log.timestamp}, ${log.operation_type}, appID: ${log.AppID}, logID: ${log.log_id})`)
            if (log.operation_type == 'UPDATE') {
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
                        `
                const qparam = [
                    log.Name,
                    log.Release_date,
                    log.Estimated_owners,
                    log.Peak_CCU,
                    log.Required_age,
                    log.Price,
                    log.DiscountDLC_count,
                    log.About_the_game,
                    log.Supported_languages,
                    log.Full_audio_languages,
                    log.Reviews,
                    log.Header_image,
                    log.Website,
                    log.Support_url,
                    log.Support_email,
                    log.Metacritic_score,
                    log.Metacritic_url,
                    log.User_score,
                    log.Positive,
                    log.Negative,
                    log.Score_rank,
                    log.Achievements,
                    log.Recommendations,
                    log.Notes,
                    log.Average_playtime_forever,
                    log.Average_playtime_two_weeks,
                    log.Median_playtime_forever,
                    log.Median_playtime_two_weeks,
                    log.Developers,
                    log.Publishers,
                    log.Categories,
                    log.Genres,
                    log.Tags,
                    log.Screenshots,
                    log.Movies,
                    log.AppID
                ]
                await fragment.query(sql, qparam)
            }
            else if (log.operation_type == 'INSERT') {
                const sql = `
                    INSERT INTO steamgames (
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
                        \`Windows\`,
                        \`Mac\`,
                        \`Linux\`,
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
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    );
                        `
                const qparam = [
                    log.AppID,
                    log.Name,
                    log.Release_date,
                    log.Estimated_owners,
                    log.Peak_CCU,
                    log.Required_age,
                    log.Price,
                    log.DiscountDLC_count,
                    log.About_the_game,
                    log.Supported_languages,
                    log.Full_audio_languages,
                    log.Reviews,
                    log.Header_image,
                    log.Website,
                    log.Support_url,
                    log.Support_email,
                    log.Windows,
                    log.Mac,
                    log.Linux,
                    log.Metacritic_score,
                    log.Metacritic_url,
                    log.User_score,
                    log.Positive,
                    log.Negative,
                    log.Score_rank,
                    log.Achievements,
                    log.Recommendations,
                    log.Notes,
                    log.Average_playtime_forever,
                    log.Average_playtime_two_weeks,
                    log.Median_playtime_forever,
                    log.Median_playtime_two_weeks,
                    log.Developers,
                    log.Publishers,
                    log.Categories,
                    log.Genres,
                    log.Tags,
                    log.Screenshots,
                    log.Movies
                ]
                await fragment.query(sql, qparam)
            }
            else if (log.operation_type = 'DELETE') {
                const sql = `DELETE FROM steamgames WHERE \`AppID\` = ?;`;
                const qparam = [log.AppID]
                await fragment.query(sql, qparam)
            }
        }

        return 1;

    } catch (err) {
        console.log(err)
        return 0;
    }

}

const syncCentral = () => {
    // sync all the things
    return 1;
}

module.exports = {
    syncFragment,
    syncCentral
};
