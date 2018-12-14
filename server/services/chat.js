const mysql = require('../config/mysql.js');

let sql = `SELECT
                chat_id
                , chat_date
                , chat_message
                , user_id
                , user_firstname
                , user_lastname
                , user_mail
                , fk_user_rank_id
            FROM 
                chat 
            INNER JOIN users ON fk_user_id = user_id `;

module.exports = {
    hent_alle: () => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(sql + `ORDER BY chat_date ASC`, [], (err, rows) => {
                if (err) {
                    reject('sql fejl! ' + err.message);
                } else {
                    resolve(rows);
                }
            });
            db.end();
        });
    },

    opret_en: (message, user_id) => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(`INSERT INTO
                            chat
                        SET
                            chat_date = NOW()
                            , chat_message = ?
                            , fk_user_id = ?`, [message, user_id], (err, rows) => {
                    if (err) {
                        reject('sql fejl! ' + err.message);
                    } else {
                        resolve(rows);
                    }
                })
        })
    }
}