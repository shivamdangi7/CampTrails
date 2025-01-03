const express = require('express');
const router =  express.Router({mergeParams: true});
const { validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')

const Campground = require('../models/campground');
const Review = require('../models/review');


const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')


router.post('/', isLoggedIn, validateReview , catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success' , 'Create New Review!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async(req,res)=>{
    const { id , reviewId } = req.params;
    await Campground.findByIdAndUpdate(id , {$pull: {reviews: reviewId}})
    // remove from array soln mongo The $pull operator.
    await Review.findByIdAndDelete(reviewId);
    req.flash('success' , 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}))
// the reason we need like this because we need to remove the reference to the campground and we have to remove the review itself.

module.exports = router;