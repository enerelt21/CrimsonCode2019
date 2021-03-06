const express = require('express');
const bodyParser = require('body-parser');
const path_join = require('path').join;
const usersRoutes = require('./routes/user');
const searchRoutes = require('./routes/search');
const namesRoutes = require('./routes/name');
const favoriteRoutes = require('./routes/favorite');


const passport = require('passport');
require('./config/passport');



const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false}));
// parse application/json
app.use(bodyParser.json());


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS, PUT');
    next();
});

app.use(express.static(path_join(__dirname, 'public')));
app.use('/pictures', express.static(path_join(__dirname, 'results')));


app.use(passport.initialize());

// Routes
app.use('/api/user', usersRoutes);
app.use('/api/name', namesRoutes);
app.use('/api/like', favoriteRoutes);
app.use('/api/search', searchRoutes);



console.log('Username:', process.env.CC2019_MYSQL_USER);
console.log('Database:', process.env.CC2019_MYSQL_DATABASE);


//Handle errors
app.use(function(err, req, res, next) {
    console.log(err);
    return res.status(err.status || 500).json({ error : JSON.stringify(err) });
});

module.exports = app;





