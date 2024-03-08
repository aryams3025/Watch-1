const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const path = require('path');
require('./config/database')();
require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const adminrouter = require('./routers/adminRouter');
const shopRouter = require('./routers/shopRouter');
const authrouter = require('./routers/authRouter');
const moment = require('moment');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    resave: false,
    secret: process.env.KEY,
    saveUninitialized: false
}));

const shortDateFormat = 'MMM Do YY';
app.locals.moment = moment;
app.locals.shortDateFormat = shortDateFormat;

app.use(authrouter);
app.use('/admin', adminrouter);
app.use('/', shopRouter);

passport.use(new GoogleStrategy({
    clientID: '1038707947328-lbal1v6etqlmtriqbk968n3349mm9l9c.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3001'
}, (accessToken, refreshToken, profile, done) => {
    // Save user details or perform additional actions
    return done(null, profile);
}));

app.use(passport.initialize());
app.use(passport.session());

// Google authentication route
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect home
        res.redirect('/landing');
    }
);

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Example protected route
app.get('/', ensureAuthenticated, (req, res) => {
    res.send('Welcome, ' + req.user.username);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server connected at http://localhost:${PORT}/`);
});
