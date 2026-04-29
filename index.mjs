import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';
//import isUserAuthenticated from './middleware/isAuthenticated.mjs';
import getFullName from './middleware/fullName.mjs';
import authRoutes from './routes/authRoutes.mjs';
//import quoteRoutes from './routes/quoteRoutes.mjs';

import pool from './config/db.mjs';

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
//for Express to get values using the POST method
app.use(express.urlencoded({extended:true}));
//setting up database connection pool, replace values in red
// const pool = mysql.createPool({
//     host: "sh4ob67ph9l80v61.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
//     user: "w9c7lwn8um1o99yj",
//     password: "u3rw8lbcasz2h307",
//     database: "pyn5h5u7iu857dd2",
//     connectionLimit: 10,
//     waitForConnections: true
// });

//setting sessions
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
//   cookie: { secure: true }
}))

//middleware used by ALL routes
app.use(getFullName);

//routes
app.get("/", authRoutes);

app.get('/addAuthor', (req, res) => {
   res.render('addAuthor.ejs')
});

app.get('/updateAuthor', (req, res) => {
   res.render('updateAuthor.ejs')
});

app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest

//middleware functions

// function isUserAuthenticated(req, res, next){
//     if (req.session.authenticated) { 
//       next();
//    } else {
//      res.redirect("/");
//    }
// }


app.listen(3000, ()=>{
    console.log("Express server running")
})