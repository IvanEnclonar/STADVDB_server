const mysql = require('mysql2/promise');

const syncFragment = async (fragmentID) => {
    console.log(`\nSyncing Fragment ${fragmentID}:`)

    const centralConfig = {
        host: 'localhost',
        user: 'root',
        password: 'password',
        port: 3306,
        database: 'central'
    }

    const fragmentConfig = {
        host: 'localhost',
        user: 'root',
        password: 'password',
        port: 3306,
        database: fragmentID === 1 ? 'fragment1' : 'fragment2'
    }
    let central, fragment;
    const logsTable = fragmentID == 1 ? "logs_old_games" : "logs_new_games";

    try {

        central = await mysql.createConnection(centralConfig);
        fragment = await mysql.createConnection(fragmentConfig);

        const [lastFragmentLog] = await fragment.query(`SELECT * FROM ${logsTable} ORDER BY \`timestamp\` DESC LIMIT 1`)    // Get the latest log from the fragment node
        const logIDOfLastFragmentLog = lastFragmentLog[0]?.log_id ?? 0  // If no logs exist, default to 0
        const [masterLogs] = await central.query(`SELECT * FROM ${logsTable} WHERE \`log_id\` > ? ORDER BY \`timestamp\` ASC`, [logIDOfLastFragmentLog])   // Collect all logs from master written AFTER last fragment record

        console.log(`Latest Fragment ${fragmentID} logs: ${logIDOfLastFragmentLog}`)
        console.log(`Logs to re-sync: ${masterLogs.length}`)

        // For each log that has not been synced to the fragment, execute log action
        for (const log of masterLogs) {
            console.log(`Executing ${log.operation_type} on ${log.AppID} (${log.log_id}, ${log.timestamp})`)
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
        console.log(`Failed to sync fragment ${fragmentID}`)
        return 0;
    } finally {
        if (central) await central.end();
        if (fragment) await fragment.end();
    }

}

const syncCentral = async () => {
    console.log(`\nSyncing Central:`)

    let central, fragment1, fragment2
    try {
        central = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password',
            port: 3306,
            database: 'central'
        });
        fragment1 = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password',
            port: 3306,
            database: 'fragment1'
        });
        fragment2 = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password',
            port: 3306,
            database: 'fragment2'
        });

        const fragments = [{ 'conn': fragment1, 'logsTable': 'logs_old_games' }, { 'conn': fragment2, 'logsTable': 'logs_new_games' }]

        let combinedLogs = []
        for (const fragment of fragments) {
            console.log(`Checking ${fragment.logsTable}...`)
            const [lastCentralLog] = await central.query(`SELECT * FROM ${fragment.logsTable} ORDER BY \`timestamp\` DESC LIMIT 1`)    // Get the latest log from the fragment node
            const logIDOfLastCentralLog = lastCentralLog[0]?.log_id ?? 0  // If no logs exist, default to 0
            const [fragmentLogs] = await fragment.conn.query(`SELECT * FROM ${fragment.logsTable} WHERE \`log_id\` > ?`, [logIDOfLastCentralLog])   // Collect all logs from master written AFTER last fragment record

            combinedLogs = combinedLogs.concat(fragmentLogs)
        }
        combinedLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

        console.log(`Logs to re-sync: ${combinedLogs.length}`)

        for (const log of combinedLogs) {
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
                await central.query(sql, qparam)
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
                await central.query(sql, qparam)
            }
            else if (log.operation_type = 'DELETE') {
                const sql = `DELETE FROM steamgames WHERE \`AppID\` = ?;`;
                const qparam = [log.AppID]
                await central.query(sql, qparam)
            }
        }
        return 1

    } catch (err) {
        console.log(`Failed to sync central`)
        return 0
    } finally {
        if (central) await central.end();
        if (fragment1) await fragment1.end();
        if (fragment2) await fragment2.end();

    }
}

module.exports = {
    syncFragment,
    syncCentral
};
