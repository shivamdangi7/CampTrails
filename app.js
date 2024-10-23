const express= require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override');
const Campground = require('./models/campground');

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

app.get('/' , (req,res)=>{
    res.render('home')
})

app.get('/campgrounds' ,catchAsync( async (req, res)=>{
    const campgrounds= await Campground.find({});
    res.render('campgrounds/index' , {campgrounds})
}))

// order matter here , if otherwise new will be treated as id , and page doesn't load.
app.get('/campgrounds/new' , (req,res) =>{
    res.render('campgrounds/new' )
})

app.post('/campgrounds' , catchAsync(async(req,res,next) =>{
    if(!req.body.campground) throw new ExpressError('Invalid Campground Data' , 400)
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.get('/campgrounds/:id' , catchAsync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show' , { campground });
}))

app.get('/campgrounds/:id/edit' ,catchAsync( async(req,res) =>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit' , { campground });
}))

app.put('/campgrounds/:id' ,catchAsync( async(req,res) =>{
    const {id}  = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground} );
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id' ,catchAsync( async(req,res) =>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))

app.all('*' , (req,res,next)=>{
    next(new ExpressError('Page Not Found' , 404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500 , message='Something Went Wrong'} = err;
    res.status(statusCode).send(message)
    // this type of error only works with async errors
})

app.listen('3000' , ()=>{
    console.log("Serving on port 3000")
});
