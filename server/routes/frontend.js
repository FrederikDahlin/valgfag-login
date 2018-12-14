const chat_service = require('../services/chat.js');

module.exports = (app) => {
    //index
    app.get('/', (req, res) => {
        res.render('pages/index', {
            "titel": "Index"
            , "page": "Index"
            , "email": ""
            , "session": req.session
        });
    });

    // get /chat, 
    app.get('/chat', (req, res) => {
        if (req.session.user_id == undefined) {
            res.redirect('/login');
        } else {
            (async () => {
                try {
                    let chat = [];

                    await chat_service.hent_alle()
                        .then(result => {
                            chat = result;
                        })

                    res.render('pages/chat', {
                        "titel": "Chat"
                        , "page": "Chat"
                        , "chat": chat
                        , "session": req.session

                    });

                } catch (error) {
                    console.log(error);
                }
            })();
        }
    });
}