const user_service = require('../services/user.js');
const bcrypt = require('bcrypt');
const sendmail = require('sendmail')({
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
                        res.redirect('/');
                        console.log(req.session);
                    } else {
                        res.render('pages/login', {
                            "titel": "Login"
                            , "page": "Login"
                            , "user_mail": mail
                            , "session": req.session
                            , "error": "Udfyld;" + error_msg.join(",")
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
            , "step": "step1"
            , "step1": "Create your account"
            , "step2": "Verify your account"
            , "step3": "Sign in"
            , "session": req.session
            , "error": ""
        });
    });

    //  post register, (mail, password, firstname, lastname)
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
                .then(result => {
                    res.redirect('/register/verify')
                })
                .catch(err => {
                    console.log(err);
                    // res.redirect('/')
                });
            sendmail({
                from: 'no-reply@website.com',
                to: mail,
                subject: 'Website - Verify account',
                html: `Hello, <br>
                        Thank you for creating your account!<br>
                        Before you can login, you must verify your account by visiting the link below:<br>
                            <a href="/register/verify">Verify account</a><br>
                        Or copy and paste the following URL into the address bar of your favorite internet browser:<br>
                            http://localhost:3000/register/verify/--id <br>
                        Regards, <br>
                        Website name`,
            }, function (err, reply) {
                console.log(err && err.stack);
                // console.dir(reply);
            });
        }
    });

    // get register/verify, bekræft email adresse
    app.get('/register/verify', (req, res) => {
        res.render('pages/register_verify', {
            "titel": "Verify your e-mail"
            , "page": "Verify your e-mail"
            , "step": "step2"
            , "step1": "Create your account"
            , "step2": "Verify your account"
            , "step3": "Sign in"
            , "session": req.session
        });
    });

    // get reset-password
    app.get('/reset-password', (req, res) => {
        res.render('pages/login_reset', {
            "titel": "Reset your password"
            , "page": "Reset your password"
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
            sendmail({
                from: 'no-reply@website.com',
                to: mail,
                subject: 'Website - Reset Password',
                html: `Hello, <br>
                        We have received a request to reset your account password.<br>
                        If you did NOT request to reset your password, please disregard this e-mail. No changes have been made to your account.<br>
                        If you DID request to reset your password, please visit the following link to create a new account password:<br>
                            <a href="/select-password">Reset Password</a><br>
                        Or copy and paste the following URL into the address bar of your favorite internet browser:<br>
                            http://localhost:3000/select-password <br>
                        Regards, <br>
                            Website name`,
            }, function (err, reply) {
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
        }
    });

    // get select-password
    app.get('/select-password', (req, res) => {
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

        let test;

        function run() {
            test = setTimeout(redirect, 3000);
        }

        function redirect() {
            res.redirect('/login')
        }
    });

    //  post select-password, (mail)
    app.post('/select-password', (req, res) => {
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
            res.render('pages/login_reset_select', {
                "titel": "Reset your password"
                , "page": "Reset your password"
                , "reset": "sucess"
                , "step": "step3"
                , "step1": "Enter your e-mail"
                , "step2": "Check your e-mail"
                , "step3": "Sucess"
                , "session": req.session
                , "error": "Udfyld;" + error_msg.join(",")
            });

            let test;

            function run() {
                test = setTimeout(redirect, 3000);
            }

            function redirect() {
                res.redirect('/login')
            }

        }
    });
}