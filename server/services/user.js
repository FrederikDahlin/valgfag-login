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
    login: (mail) => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(`SELECT
                            user_id
                            , user_mail
                            , user_password
                            , user_firstname
                            , user_lastname
                            , fk_user_rank_id
                        FROM
                            users
                        WHERE user_mail = ?`, [mail], (err, rows) => {
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

    verify_user: (id) => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(`UPDATE 
                            users
                        SET 
                            user_verified = true
                        WHERE 
                            user_id = ?`, [id], (err, rows) => {
                    if (err) {
                        reject('sql fejl! ' + err.message);
                    } else {
                        resolve(rows);
                    }
                });
            db.end();
        });
    },

    register: (mail, password, firstname, lastname) => {
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
                            , user_verified = false
                            , fk_user_rank_id = 1`, [mail, password, firstname, lastname], (err, rows) => {
                    if (err) {
                        reject('sql fejl! ' + err.message);
                    } else {
                        resolve(rows.insertId);
                    }
                })
        })
    },

    register_get_key: (key) => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(`SELECT
                            user_verify_key
                            , user_verify_expires
                            , user_id
                            , user_verified
                        FROM
                            user_verify_keys
                        INNER JOIN users ON fk_user_id = user_id
                        WHERE 
                            user_verify_key = ?`, [key], (err, rows) => {
                    if (err) {
                        reject('sql fejl! ' + err.message);
                    } else {
                        if (rows.length == 1) {
                            resolve(rows[0]);
                        } else {
                            reject('forkert key');
                        }
                    }
                })
        })
    },

    register_create_key: (key, expires, user_id) => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(`INSERT INTO
                            user_verify_keys
                        SET
                            user_verify_key = ?
                            , user_verify_expires = ?
                            , fk_user_id = ?`, [key, expires, user_id], (err, rows) => {
                    if (err) {
                        reject('sql fejl! ' + err.message);
                    } else {
                        resolve(rows);
                    }
                })
        })
    },

    register_delete_key: (key) => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(`DELETE FROM 
                            user_verify_keys
                        WHERE 
                            user_verify_key = ?`,
                [key], (err, rows) => {
                    if (err) {
                        reject('sql fejl! ' + err.message);
                    } else {
                        resolve(rows)
                    }
                });
            db.end();
        });
    },

    reset_password: (password, user_id) => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(`UPDATE 
                            users
                        SET 
                            user_password = ?
                        WHERE 
                            user_id = ?`, [password, user_id], (err, rows) => {
                    if (err) {
                        reject('sql fejl! ' + err.message);
                    } else {
                        resolve(rows);
                    }
                });
            db.end();
        });
    },

    reset_password_get_key: (key) => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(`SELECT
                            user_password_key
                            , user_password_expires
                            , user_id
                            , user_verified
                        FROM
                            user_password_keys
                        INNER JOIN users ON fk_user_id = user_id
                        WHERE 
                            user_password_key = ?`, [key], (err, rows) => {
                    if (err) {
                        reject('sql fejl! ' + err.message);
                    } else {
                        if (rows.length == 1) {
                            resolve(rows[0]);
                        } else {
                            reject('Key finde ikke i db');
                        }
                    }
                })
        })
    },

    reset_password_create_key: (key, expires, user_id) => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(`INSERT INTO
                            user_password_keys
                        SET
                            user_password_key = ?
                            , user_password_expires = ?
                            , fk_user_id = ?`, [key, expires, user_id], (err, rows) => {
                    if (err) {
                        reject('sql fejl! ' + err.message);
                    } else {
                        resolve(rows);
                    }
                })
        })
    },

    reset_password_delete_key: (key) => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(`DELETE FROM 
                            user_password_keys
                        WHERE 
                            user_password_key = ?`,
                [key], (err, rows) => {
                    if (err) {
                        reject('sql fejl! ' + err.message);
                    } else {
                        resolve(rows)
                    }
                });
            db.end();
        });
    },
}