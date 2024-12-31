const express = require('express');
const router =  express.Router();
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync')
const { campgroundSchema }  = require('../schemas')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

router.get('/' ,catchAsync( async (req, res)=>{
    const campgrounds= await Campground.find({});
    res.render('campgrounds/index' , {campgrounds})
}))

// order matter here , if otherwise new will be treated as id , and page doesn't load.
router.get('/new' , isLoggedIn , (req,res) =>{ 
    res.render('campgrounds/new' )
})

router.post('/' ,isLoggedIn, validateCampground, catchAsync(async(req,res,next) =>{
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data' , 400)
    const campground = new Campground(req.body.campground);
    campground.author= req.user._id;
    await campground.save();
    req.flash('success' , 'Succesfully make a new campground!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.get('/:id' , catchAsync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(campground);
    if(!campground){
        req.flash('error' , 'Cannot find that campground!')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show' , { campground });
}))

router.get('/:id/edit' ,isLoggedIn , isAuthor, catchAsync( async(req,res) =>{
    const { id } = req.params ;
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error' , 'Cannot find that campground!')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit' , { campground });
}))

router.put('/:id' , isLoggedIn, isAuthor, validateCampground, catchAsync( async(req,res) =>{
    const {id}  = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground} );
    req.flash('success','Successfully update Campground!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id' , isLoggedIn, isAuthor,catchAsync( async(req,res) =>{
    const {id} = req.params;
    const campground = await campground.findById(id)
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission')
        return req.redirect(`/camgrounds/${id}`)
    }
    await Campground.findByIdAndDelete(id);
    req.flash('success' , 'Successfully deleted campground')
    res.redirect('/campgrounds')
}))

module.exports = router;
