const user_service = require('../services/user.js');
const bcrypt = require('bcrypt');

// async function hent_template_data() {
//     let data = {};
//     data.alle_kategorier = [];

//     data.butik = {
//         "butik_id": 0
//         , "butik_titel": ""
//         , "butik_adresse": ""
//         , "butik_by": ""
//         , "butik_telefon": 0
//         , "butik_email": ""
//     }

//     return data;
// }

module.exports = (app) => {
    //login
    app.get('/login', (req, res) => {
        (async () => {
            try {
                // let data = await hent_template_data();

                let user = {
                    "user_id": 0
                    , "user_mail": ""
                    , "user_password": ""
                    , "user_firstname": ""
                    , "user_lastname": ""
                    , "user_created": ""
                    , "user_verified": ""
                    , "user_rank": 0
                };

                res.render('pages/register', {
                    "titel": "Index"
                    , "page": "Forsiden"
                    , "user": user
                    , "error": ""
                    , "session": req.session
                    // , "kategorier": data.alle_kategorier
                });

            } catch (error) {
                console.log(error);
            }
        })();
    });

    app.post('/login/signup', (req, res) => {
        let error_msg = [];

        let mail = req.body.user_mail;
        if (mail == undefined || mail == '') {
            error_msg.push('mail needed');
        }

        let password = req.body.user_password;
        if (password == undefined || password == '') {
            error_msg.push('password needed');
        }

        if (error_msg.length > 0) {
            (async () => {
                try {
                    // let data = await hent_template_data();

                    let user = {
                        "user_id": 0
                        , "user_mail": ""
                        , "user_password": ""
                        , "user_firstname": ""
                        , "user_lastname": ""
                        , "user_created": ""
                        , "user_verified": ""
                        , "user_rank": 0
                    };

                    res.render('pages/register', {
                        "titel": "Index"
                        , "page": "Forsiden"
                        , "error": error_msg
                        , "user": user
                        , "session": req.session
                        // , "kategorier": data.alle_kategorier
                    });

                } catch (error) {
                    console.log(error);
                }
            })();
        } else {
            let hashed_password = bcrypt.compareSync(password, hashed_password);

            user_service.create_login(mail, hashed_password, firstname, lastname)
                .then(result => {
                    res.redirect('/login')
                })
                .catch(err => {
                    console.log(err);
                    // res.redirect('/')
                });
        }
    });

    //create login
    app.get('/login/signup', (req, res) => {
        (async () => {
            try {
                // let data = await hent_template_data();

                let user = {
                    "user_id": 0
                    , "user_mail": ""
                    , "user_password": ""
                    , "user_firstname": ""
                    , "user_lastname": ""
                    , "user_created": ""
                    , "user_verified": ""
                    , "user_rank": 0
                };

                res.render('pages/register', {
                    "titel": "Index"
                    , "page": "Forsiden"
                    , "kategoriNav": ""
                    , "user": user

                    , "session": req.session
                    // , "kategorier": data.alle_kategorier
                });

            } catch (error) {
                console.log(error);
            }
        })();
    });

    app.post('/login/signup', (req, res) => {
        let error_msg = [];

        let mail = req.body.user_mail;
        if (mail == undefined || mail == '') {
            error_msg.push('mail needed');
        }

        let password = req.body.user_password;
        if (password == undefined || password == '') {
            error_msg.push('password needed');
        }

        let firstname = req.body.user_firstname;
        if (firstname == undefined || firstname == '') {
            error_msg.push('firstname needed');
        }

        let lastname = req.body.user_lastname;
        if (lastname == undefined || lastname == '') {
            error_msg.push('lastname needed');
        }

        if (error_msg.length > 0) {
            (async () => {
                try {
                    // let data = await hent_template_data();

                    let user = {
                        "user_id": 0
                        , "user_mail": ""
                        , "user_password": ""
                        , "user_firstname": ""
                        , "user_lastname": ""
                        , "user_created": ""
                        , "user_verified": ""
                        , "user_rank": 0
                    };

                    res.render('pages/register', {
                        "titel": "Index"
                        , "page": "Forsiden"
                        , "error": error_msg
                        , "user": user

                        , "fejlbesked": ""
                        , "email": ""
                        , "session": req.session

                        // , "kategorier": data.alle_kategorier

                    });

                } catch (error) {
                    console.log(error);
                }
            })();
        } else {
            let hashed_password = bcrypt.hashSync(password, 10);

            user_service.create_login(mail, hashed_password, firstname, lastname)
                .then(result => {
                    res.redirect('/login')
                })
                .catch(err => {
                    console.log(err);
                    // res.redirect('/')
                });
        }
    });

}