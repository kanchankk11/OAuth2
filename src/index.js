require('dotenv').config();
require('./auth');
const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 5000;
const viewsPath = path.join(__dirname,"../pages");

app.use(express.json());
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } //* marking it false as our server is running on http not https
  }));

app.use(passport.initialize());
app.use(passport.session());
app.set("views",viewsPath);
app.set('view engine','hbs');

const isLoggedIn = (req, res, next) => {
    req.user ? next() : res.sendStatus(401);
}

app.get("/",(req, res) => {
    res.render("index");
})

//route after clicking Continue with google
app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

//redirection after authetication
app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
}));

//Is the authentication is successful
app.get('/auth/success', isLoggedIn, (req, res) => {
   
    res.render("user", {user : req.user})
});

//if the authentication failed
app.get('/auth/failure', (req, res) => {
    res.send('Failed');
});

//logout the user by clearing cookies and destroying the session
app.get('/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) { return next(err); }
      req.session.destroy();
      res.clearCookie('connect.sid', {path: '/'}).status(200).render('index');
      //res.render("index")
    });
  });
app.listen(port, (err)=>{
    if(err){
        console.log("Unable to connect server");
    }
    else{
        console.log(`Listening to port ${port}`);
    }
});
