const mysql = require('../config/mysql.js');

let sql = `SELECT
                user_rank_id
                , user_rank_name
            FROM 
                users `;

module.exports = {
    hent_alle: () => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(sql + `ORDER BY user_rank_id ASC`, [], (err, rows) => {
                if (err) {
                    reject('sql fejl! ' + err.message);
                } else {
                    resolve(rows);
                }
            });
            db.end();
        });
    },

    opret_en: (name) => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(`INSERT INTO
                            users
                        SET
                            user_rank_name = ?`, [name], (err, rows) => {
                    if (err) {
                        reject('sql fejl! ' + err.message);
                    } else {
                        resolve(rows);
                    }
                })
        })
    },

    ret_en: (name, id) => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(`UPDATE 
                            users
                        SET 
                            user_rank_name = ?
                        WHERE 
                            user_rank_id = ?`, [name, id], (err, rows) => {
                    if (err) {
                        reject('sql fejl! ' + err.message);
                    } else {
                        resolve(rows);
                    }
                });
            db.end();
        });
    },

    slet_en: (id) => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(`DELETE FROM 
                            users
                        WHERE 
                            user_rank_id = ?`,
                [id], (err, rows) => {
                    if (err) {
                        reject('sql fejl! ' + err.message);
                    } else {
                        resolve(rows)
                    }
                });
            db.end();
        });
    }
}