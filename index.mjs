import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';

const app = express();

//session configuration
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'cst336 csumb',
  resave: false,
  saveUninitialized: true
//   cookie: { secure: true }  //only works in web servers
}))


app.set('view engine', 'ejs');
app.use(express.static('public'));
//for Express to get values using the POST method
app.use(express.urlencoded({extended:true}));
//setting up database connection pool
const pool = mysql.createPool({
    host: "sh4ob67ph9l80v61.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "w9c7lwn8um1o99yj",
    password: "u3rw8lbcasz2h307",
    database: "pyn5h5u7iu857dd2",
    connectionLimit: 10,
    waitForConnections: true
});

//let isUserAuthenticated = false;

//routes
app.get('/', (req, res) => {
   res.render('login.ejs')
});

app.get('/logout', (req, res) => {
   req.session.destroy();
   res.redirect('/');
});

app.get('/profile', isUserAuthenticated, (req, res) => {
    res.render('profile.ejs')
//    if (req.session.isUserAuthenticated) {
//     res.render('profile.ejs')
//    } else {
//     res.redirect("/");
//    }
});

app.get('/newRoute', isUserAuthenticated, (req, res) => {
  res.render("newView.ejs")
});

app.post('/loginProcess', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    let hashedPassword = "";
    let sql = `SELECT *
               FROM users
              WHERE username = ?`;
    const [rows] = await pool.query(sql, [username]); 

    if (rows.length > 0) { //username exists in the table
      hashedPassword = rows[0].password;
    }

    const match = await bcrypt.compare(password, hashedPassword);

    if (match) {
        req.session.isUserAuthenticated = true;
        req.session.fullName = rows[0].firstName + " " + rows[0].lastName;
        res.render('home.ejs')
    } else {
        res.render('login.ejs', {"loginError": "Wrong Credentials" })
    }

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

function isUserAuthenticated(req, res, next){
 if (req.session.isUserAuthenticated) {
    next();
   } else {
    res.redirect("/");
   }
}

app.listen(3000, ()=>{
    console.log("Express server running")
})