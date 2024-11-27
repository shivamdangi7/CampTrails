const express = require('express');
const router =  express.Router({mergeParams: true});

const Campground = require('../models/campground');
const Review = require('../models/review');

const { reviewSchema }  = require('../schemas')

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')


const validateReview = (req,res,next) =>{
    const { error } = reviewSchema.validate(req.body);
    console.log(error);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

router.post('/', validateReview , catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success' , 'Create New Review!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', catchAsync(async(req,res)=>{
    const { id , reviewId } = req.params;
    await Campground.findByIdAndUpdate(id , {$pull: {reviews: reviewId}})
    // remove from array soln mongo The $pull operator.
    await Review.findByIdAndDelete(reviewId);
    req.flash('success' , 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}))
// the reason we need like this because we need to remove the reference to the campground and we have to remove the review itself.

module.exports = router;