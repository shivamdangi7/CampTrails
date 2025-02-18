const express = require('express');
const router =  express.Router();
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync')
const { campgroundSchema }  = require('../schemas')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds')

const multer  = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage });

router.route('/')
    .get( catchAsync(campgrounds.index))
    .post( isLoggedIn,upload.array('image'), validateCampground,catchAsync(campgrounds.createCampground))

// order matter here , if otherwise new will be treated as id , and page doesn't load.
router.get('/new' , isLoggedIn , campgrounds.renderNewForm)

router.route('/:id')
    .get( catchAsync(campgrounds.showCampground))
    .put( isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete( isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit' ,isLoggedIn , isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;
