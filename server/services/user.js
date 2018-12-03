const mysql = require('../config/mysql.js');

let sql = ` SELECT 
                user_id
                , user_mail
                , user_firstname
                , user_lastname
                , user_created
                , user_verified
                , user_rank_id
                , user_rank_name
            FROM
                users
            INNER JOIN user_ranks ON fk_user_rank_id = user_rank_id `;


module.exports = {
    get_login: (id) => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(sql + `WHERE user_id = ?`, [id], (err, rows) => {
                if (err) {
                    console.log(err.message);
                    reject(err.message);
                } else {
                    if (rows.length == 1) {
                        resolve(rows[0]);
                    } else {
                        reject('forkert kodeord eller mail');
                    }
                }
            });
            db.end();
        });
    },

    create_login: (mail, password, firstname, lastname) => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(`INSERT INTO
                            users
                        SET
                            user_mail = ?
                            , user_password = ?
                            , user_firstname = ?
                            , user_lastname = ?
                            , user_created = NOW ()
                            , user_verified = 1
                            , fk_user_rank_id = 1`, [mail, password, firstname, lastname], (err, rows) => {
                    if (err) {
                        reject('sql fejl! ' + err.message);
                    } else {
                        resolve(rows);
                    }
                })
        })
    },


}