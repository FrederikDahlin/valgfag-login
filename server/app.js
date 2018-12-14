// indlæs express
const express = require('express');
const app = express();

// knyt morgan til som logger
const logger = require('morgan');
app.use(logger('dev'));

// sæt view-engine op til at benytte ejs
app.set('view engine', 'ejs'); // definer template engine
app.set('views', './server/views'); // definerer hvor ejs filerne er placeret
app.engine('ejs', require('express-ejs-extend')); // tillad extends i ejs templates

const session = require('express-session')({
    secret: 'mNUIbVTBYNO786787byuVTUBGUI4w55v68808lk',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30,
        secure: false
    }
})
app.use(session);

// konfigurer bodyparser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const chat_service = require('./services/chat.js');
const port = 3000;
const io = require('socket.io').listen(app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    console.log('App is listening on http://localhost:' + port);
}));
const sharedsession = require("express-socket.io-session");
io.use(sharedsession(session, {
    autosave: true
}));

io.on('connection', (socket) => {
    socket.on('message to server', (msg) => {
        // service her!!
        chat_service.opret_en(msg.message, socket.handshake.session.user_id )
            .then(result => {
                io.sockets.emit('message to client', {
                    'message': msg.message
                    // ,'time': new Date()
                    , 'user_firstname': socket.handshake.session.user_firstname 
                    , 'user_lastname': socket.handshake.session.user_lastname 
                    , 'user_id': socket.handshake.session.user_id

                })
                // result();
            })
            .catch(err => {
                console.log(err);
            })
    })
});

// app.locals.datetime = require('date-and-time');

require('./routes/frontend.js')(app);
require('./routes/user.js')(app);


// // for at demonstrere at viewengine fungerer, definers en default route
// app.get('/', (req, res) => {
//    // routens formål er at indlæse templaten kaldet 'index.ejs' 
//    // som er placeret i roden af views mappen.
//    // der sendes et json objekt med, som indeholder et 'title' og et 'data' element
//    // de to elementer er noget vi finder på! .. mere om det senere.
//    res.render('pages/fisk', {
//       "title": "Mine Fisk",
//       "data": "Akvarie fisk er flotte"
//    });
// });


app.use(express.static('public'));



// // placeres som den absolut første route der rammes
// app.get('*', (req, res, next) => {
//     req.session.user_id = 1;
//     next();
// });