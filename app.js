if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
} 

console.log(process.env.SECRET);

const express= require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStatergy = require('passport-local');
const User = require('./models/user')

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')

mongoose.connect('mongodb://localhost:27017/camp-trails' )

const db = mongoose.connection;
db.on("error" , console.error.bind(console, "connection error:"))
db.once("open" , () =>{
    console.log("Database connected");
});

const app = express();
// Instead of ejs use ejsMate
app.engine('ejs' , ejsMate);
app.set('view engine' , 'ejs');
app.set('views' , path.join(__dirname, 'views'))
// now the req.body is parsed
app.use(express.urlencoded({ extended: true }))
// the string we want to use is _method to set other request
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname,'public')))

const sessionConfig = {
    secret: 'ThisShouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpsOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000* 60 * 60 * 24 * 7 
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStatergy(User.authenticate()));
// authenticate is used 
passport.serializeUser(User.serializeUser())
// serializer the user , how to store a user in a session.
passport.deserializeUser(User.deserializeUser())
//  how to get the user out of that session.


app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})


app.get('/' , (req,res)=>{
    res.render('home')
})

app.use('/', userRoutes)
app.use('/campgrounds' , campgroundRoutes)
app.use('/campgrounds/:id/reviews' , reviewRoutes)


app.all('*' , (req,res,next)=>{
    next(new ExpressError('Page Not Found' , 404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500 } = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error' , {err})
    // this type of error only works with async errors
})

app.listen('3000' , ()=>{
    console.log("Serving on port 3000")
});
