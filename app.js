require('dotenv').config();
const express  = require('express');

const app = express();
const PORT = 4000 || process.env.PORT;
const expressLayout = require('express-ejs-layouts');



// admin needs the following imports
// adding cookieparser (cookie that we will use to store all session when user loged in)
const cookieparser = require('cookie-parser');
const mangostore = require('connect-mongo');
const session = require('express-session');

// adding method override to use put and delete methods
const methodoverride = require('method-override');



const connectdb = require('./server/config/db');
//connection to db function
connectdb();

// two lines below help us get data from the forminput
app.use(express.urlencoded({extended:true}));
app.use(express.json());

// // middleware of ookie parser
app.use(cookieparser());
// // set medthod override as middle ware
app.use(methodoverride('_method'));


// session for the admin
app.use(session({
    // ? lookup the documentation in sessions
     secret:'keyboard cart',
     resave:false,
     saveUninitialized:true,
     store:mangostore.create({
        mongoUrl:process.env.MANGODB_URL
     }),
    //  add if you need the cookie to expire
    // cookie:{maxAge:new Date{Date.now() + (3600000)}}
    // Date.now() - 30 * 24 60 *  60 * 1000

}))

app.use(express.static('public'));
// Template engine
app.use(expressLayout);

app.set('layout', './layouts/main');
app.set('view engine', 'ejs'); // Fix here



// including server file inside server folder file is called main.js
app.use('/',require('./server/routes/main'));
// users route
// app.use('/',require('./server/routes/usersrouter'));


app.listen(PORT, ()=>{
console.log(`App Runing on port ${PORT}`);
});


