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

const session = require('express-session')
app.use(session({
    secret: 'mNUIbVTBYNO786787byuVTUBGUI4w55v68808lk',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30,
        secure: false
    }
}));

// konfigurer bodyparser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

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

// start serveren på en port
const port = 3000;
app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    console.log('App is listening on http://localhost:' + port);
});

// placeres som den absolut første route der rammes
// app.get('*', (req, res, next) => {
//     req.session.login_id = 1;
//     next();
// });