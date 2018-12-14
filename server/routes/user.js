const user_service = require('../services/user.js');
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const date = require('date-and-time');
const sendmail = require('sendmail')({
    silent: true, // Lukker røven på console
    devPort: 2500, // Default: False
    devHost: 'localhost', // Default: localhost
    smtpPort: 2500, // Default: 25
    smtpHost: 'localhost' // Default: -1 - extra smtp host after resolveMX
})

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
    // get login
    app.get('/login', (req, res) => {
        res.render('pages/login', {
            "titel": "Login to your account"
            , "page": "Login"
            , "user_mail": ""
            , "session": req.session
            , "error": ""
            , "error_login": ""
        });
    });
    // post login, compare hashed passwords
    app.post('/login', (req, res) => {
        let error_msg = [];

        let mail = req.body.user_mail;
        if (mail == undefined || mail == '') {
            error_msg.push(' mail');
        }

        let password = req.body.user_password;
        if (password == undefined || password == '') {
            error_msg.push(' password');
        }

        if (error_msg.length > 0) {
            res.render('pages/login', {
                "titel": "Login"
                , "page": "Login"
                , "user_mail": mail
                , "session": req.session
                , "error": "Udfyld;" + error_msg.join(",")
            });
        } else {
            user_service.login(mail)
                .then(user => {
                    if (bcrypt.compareSync(password, user.user_password) === true) {
                        req.session.cookie.expire = false;

                        req.session.user_id = user.user_id;
                        req.session.user_mail = mail;
                        req.session.user_firstname = user.user_firstname;
                        req.session.user_lastname = user.user_lastname;
                        req.session.user_rank = user.fk_user_rank_id;
                        res.cookie('user_id', req.session.user_id ,{maxAge: 90000000,})
                        
                        res.redirect('/chat');
                        console.log(req.session);
                    } else {
                        res.render('pages/login', {
                            "titel": "Login"
                            , "page": "Login"
                            , "user_mail": mail
                            , "session": req.session
                            , "error": ""
                            , "error_login": "E-mail or password doesn't match"
                        });
                    }
                })
                .catch(err => {
                    res.render('pages/login', {
                        "titel": "Login"
                        , "page": "Login"
                        , "user_mail": mail
                        , "session": req.session
                        , "error": "Udfyld;" + error_msg.join(",")
                        , "error_login": "E-mail or password doesn't match"
                    });
                    console.log(err);
                    // res.redirect('/')
                });
        }
    });
    // get logout, sletter session
    app.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.log(err)
            }
            res.redirect('/');
        });
    });

    // get register
    app.get('/register', (req, res) => {
        res.render('pages/register', {
            "titel": "Register your account"
            , "page": "Create your account"
            , "mail": ""
            , "firstname": ""
            , "lastname": ""
            , "step": "step1"
            , "step1": "Create your account"
            , "step2": "Verify your account"
            , "step3": "Sign in"
            , "session": req.session
            , "error": ""
        });
    });
    // post register, (mail, password, firstname, lastname)
    app.post('/register', (req, res) => {
        let error_msg = [];

        let mail = req.body.user_mail;
        if (mail == undefined || mail == '') {
            error_msg.push(' mail');
        }

        let password = req.body.user_password;
        if (password == undefined || password == '') {
            error_msg.push(' password');
        }

        let firstname = req.body.user_firstname;
        if (firstname == undefined || firstname == '') {
            error_msg.push(' firstname');
        }

        let lastname = req.body.user_lastname;
        if (lastname == undefined || lastname == '') {
            error_msg.push(' lastname');
        }

        if (error_msg.length > 0) {
            res.render('pages/register', {
                "titel": "Register your account"
                , "page": "Create your account"
                , "mail": ""
                , "firstname": ""
                , "lastname": ""
                , "step": "step1"
                , "step1": "Create your account"
                , "step2": "Verify your account"
                , "step3": "Sign in"
                , "session": req.session
                , "error": "Udfyld;" + error_msg.join(",")
            });
        } else {
            let hashed_password = bcrypt.hashSync(password, 10);

            user_service.register(mail, hashed_password, firstname, lastname)
                .then(user_id => {
                    let key = uuidv4();
                    let now = new Date();
                    let expires = date.addDays(now, 1);

                    user_service.register_create_key(key, expires, user_id)
                        .then(result => {
                            let verify_url = `http://localhost:3000/register/verify/${key}`;
                            let message = `
                                Hello ${firstname}, <br>
                                Thank you for creating your account!<br>
                                Before you can login, you must verify your account by visiting the link below:<br>
                                    <a href="${verify_url}">Verify account</a><br>
                                Or copy and paste the following URL into the address bar of your favorite internet browser:<br>
                                    <a href="${verify_url}">${verify_url}</a><br>
                                Regards, <br>
                                Website name`

                            sendmail({
                                from: 'no-reply@website.com',
                                to: mail,
                                subject: 'Website - Verify account',
                                text: message,
                                html: message
                            }, (err, reply) => {
                                console.log(err && err.stack);
                                // console.dir(reply);
                            });
                            res.redirect('/register/verify')
                        })
                })
                .catch(err => {
                    // console.log("test "+ err);
                    let mail = req.body.user_mail;
                    let firstname = req.body.user_firstname;
                    let lastname = req.body.user_lastname;

                    res.render('pages/register', {
                        "titel": "Register your account"
                        , "page": "Create your account"
                        , "mail": mail
                        , "firstname": firstname
                        , "lastname": lastname
                        , "step": "step1"
                        , "step1": "Create your account"
                        , "step2": "Verify your account"
                        , "step3": "Sign in"
                        , "session": req.session
                        , "error": "E-mail already registered"
                    });
                    // res.redirect('/')
                });
        }
    });
    // get register/verify, bekræft email adresse
    app.get('/register/verify', (req, res) => {
        res.render('pages/register_verify', {
            "titel": "Verify your e-mail"
            , "page": "Verify your e-mail"
            , "validate": ""
            , "denied": true
            , "step": "step2"
            , "step1": "Create your account"
            , "step2": "Verify your e-mail"
            , "step3": "Sign in"
            , "session": req.session
        });
    });
    // get register/verify/:key, bekræft email adresse
    app.get('/register/verify/:key', (req, res) => {
        user_service.register_get_key(req.params.key)
            .then(result => {
                res.render('pages/register_verify', {
                    "titel": "Verify your e-mail"
                    , "page": "Verify your e-mail"
                    , "validate": "verify"
                    , "step": "step2"
                    , "step1": "Create your account"
                    , "step2": "Verify your e-mail"
                    , "step3": "Sign in"
                    , "session": req.session
                });
            })
            .catch(err => {
                res.render('pages/register_verify', {
                    "titel": "Error"
                    , "page": "Error invalid security code"
                    , "validate": "error"
                    , "step": "step2"
                    , "step1": "Create your account"
                    , "step2": "Verify your e-mail"
                    , "step3": "Sign in"
                    , "session": req.session
                });
            })
    });
    // post register/verify/:key, bekræft klik
    app.post('/register/verify/:key', (req, res) => {
        let error_msg = [];

        let params_key = req.params.key;
        if (params_key == undefined || params_key == '' || params_key.length <= 35) {
            error_msg.push(' params_key');
        }

        if (error_msg.length > 0) {
            res.render('pages/register_verify', {
                "titel": "Error"
                , "page": "Create your account"
                , "validate": "error"
                , "step": "step3"
                , "step1": "Create your account"
                , "step2": "Verify your e-mail"
                , "step3": "Sign in"
                , "session": req.session
                , "error": "Udfyld;" + error_msg.join(",")
            });
        } else {
            let get_key = {
                "user_verify_key": ""
                , "user_verify_expires": ""
                , "user_id": 0
            };

            user_service.register_get_key(params_key)
                .then(result => {
                    get_key = result;

                    user_service.verify_user(get_key.user_id)
                        .then(result => {

                            user_service.register_delete_key(params_key)
                                .then(render => {
                                    res.render('pages/register_verify', {
                                        "titel": "Verify your e-mail"
                                        , "page": "Sucess!"
                                        , "validate": "sucess"
                                        , "step": "step3"
                                        , "step1": "Create your account"
                                        , "step2": "Verify your e-mail"
                                        , "step3": "Sign in"
                                        , "session": req.session
                                    });
                                }).catch(error => {
                                    console.log(error)
                                })

                        }).catch(error => {
                            console.log(error)
                        })
                }).catch(error => {
                    res.render('pages/register_verify', {
                        "titel": "Error verifying your e-mail"
                        , "page": "Error verifying your e-mail"
                        , "validate": "error"
                        , "step": "step2"
                        , "step1": "Create your account"
                        , "step2": "Verify your e-mail"
                        , "step3": "Sign in"
                        , "session": req.session
                    });
                })
        }
    });

    // get reset-password
    app.get('/reset-password', (req, res) => {
        res.render('pages/login_reset', {
            "titel": "Reset your password"
            , "page": "Reset your password"
            , "mail": ""
            , "step": "step1"
            , "step1": "Enter your e-mail"
            , "step2": "Check your e-mail"
            , "step3": "Reset password"
            , "session": req.session
            , "error": ""
        });
    });
    //  post reset-password, (mail)
    app.post('/reset-password', (req, res) => {
        let error_msg = [];

        let mail = req.body.user_mail;
        if (mail == undefined || mail == '') {
            error_msg.push(' mail');
        }

        if (error_msg.length > 0) {
            res.render('pages/login_reset', {
                "titel": "Reset your password"
                , "page": "Reset your password"
                , "step": "step1"
                , "step1": "Enter your e-mail"
                , "step2": "Check your e-mail"
                , "step3": "Reset password"
                , "session": req.session
                , "error": "Udfyld;" + error_msg.join(",")
            });
        } else {
            user_service.login(mail)
                .then(user => {

                    let key = uuidv4();
                    let now = new Date();
                    let expires = date.addDays(now, 1);

                    user_service.reset_password_create_key(key, expires, user.user_id)
                        .then(result => {
                            let verify_url = `http://localhost:3000/select-password/${key}`;
                            let message = ` 
                                Hello, <br>
                                We have received a request to reset your account password.<br>
                                If you did NOT request to reset your password, please disregard this e-mail. No changes have been made to your account.<br>
                                If you DID request to reset your password, please visit the following link to create a new account password:<br>
                                    <a href="${verify_url}">Reset Password</a><br>
                                Or copy and paste the following URL into the address bar of your favorite internet browser:<br>
                                    <a href="${verify_url}">${verify_url}</a><br>
                                Regards, <br>
                                    Website name`;

                            console.log(verify_url)

                            sendmail({
                                from: 'no-reply@website.com',
                                to: mail,
                                subject: 'Website - Reset Password',
                                text: message,
                                html: message
                            }, (err, reply) => {
                                console.log(err && err.stack);
                                // console.dir(reply);
                            });

                            res.render('pages/login_reset', {
                                "titel": "Reset your password"
                                , "page": "Reset your password"
                                , "step": "step2"
                                , "step1": "Enter your e-mail"
                                , "step2": "Check your e-mail"
                                , "step3": "Reset password"
                                , "session": req.session
                                , "error": "Udfyld;" + error_msg.join(",")
                            });
                        })
                        .catch(error => {
                            console.log(error);
                        })

                })
                .catch(error => {
                    let mail = req.body.user_mail;

                    res.render('pages/login_reset', {
                        "titel": "Reset your password"
                        , "page": "Reset your password"
                        , "mail": mail
                        , "step": "step1"
                        , "step1": "Enter your e-mail"
                        , "step2": "Check your e-mail"
                        , "step3": "Reset password"
                        , "session": req.session
                        , "error": "E-mail not found"
                    });
                    // console.log(error);
                })

        }
    });

    // get select-password
    app.get('/select-password/:key', (req, res) => {
        user_service.reset_password_get_key(req.params.key)
            .then(result => {
                res.render('pages/login_reset_select', {
                    "titel": "Select a New Password"
                    , "page": "Select a new password"
                    , "reset": ""
                    , "step": "step3"
                    , "step1": "Enter your e-mail"
                    , "step2": "Check your e-mail"
                    , "step3": "Reset password"
                    , "session": req.session
                    , "error": ""
                });
            })
            .catch(err => {
                res.render('pages/register_verify', {
                    "titel": "Error"
                    , "page": "Error invalid security code"
                    , "validate": "error"
                    , "step": "step2"
                    , "step1": "Enter your e-mail"
                    , "step2": "Check your e-mail"
                    , "step3": "Reset password"
                    , "session": req.session
                });
            })
    });
    //  post select-password, (passowrd)
    app.post('/select-password/:key', (req, res) => {
        let error_msg = [];

        let password = req.body.user_password;
        if (password == undefined || password == '') {
            error_msg.push(' password');
        }

        let password_confirm = req.body.user_password_confirm;
        if (password_confirm == undefined || password_confirm == '') {
            error_msg.push(' password confirm');
        }

        if (password != password_confirm) {
            error_msg.push(' password match');
        }
        let params_key = req.params.key;
        if (params_key == undefined || params_key == '' || params_key.length <= 35) {
            error_msg.push(' params_id');
        }

        if (error_msg.length > 0) {
            res.render('pages/login_reset_select', {
                "titel": "Reset your password"
                , "page": "Reset your password"
                , "reset": ""
                , "step": "step3"
                , "step1": "Enter your e-mail"
                , "step2": "Check your e-mail"
                , "step3": "Reset password"
                , "session": req.session
                , "error": "Udfyld;" + error_msg.join(",")
            });
        } else {
            let get_key = {
                "user_password_key": ""
                , "user_password_expires": ""
                , "user_id": 0
            };

            user_service.reset_password_get_key(params_key)
                .then(result => {

                    get_key = result;
                    let hashed_password = bcrypt.hashSync(password, 10);

                    user_service.reset_password(hashed_password, get_key.user_id)
                        .then(result => {

                            user_service.reset_password_delete_key(params_key)
                                .then(render => {
                                    res.render('pages/login_reset_select', {
                                        "titel": "Sucess resetting your password"
                                        , "page": "Sucess!"
                                        , "reset": "sucess"
                                        , "step": "step3"
                                        , "step1": "Enter your e-mail"
                                        , "step2": "Check your e-mail"
                                        , "step3": "Sucess"
                                        , "session": req.session
                                    });
                                }).catch(error => {
                                    console.log(error)
                                })

                        }).catch(error => {
                            console.log(error)
                        })
                }).catch(error => {
                    res.render('pages/login_reset_select', {
                        "titel": "Error resetting your password"
                        , "page": "Error resetting your password"
                        , "reset": "error"
                        , "step": "step2"
                        , "step1": "Create your account"
                        , "step2": "Verify your e-mail"
                        , "step3": "Sign in"
                        , "session": req.session
                    });
                })
        }
    });
}