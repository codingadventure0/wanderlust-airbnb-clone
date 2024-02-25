const express = require("express");
const router = express.Router({mergeParams: true}); // using mergeParams for taking properties in routes calls
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
// const {reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");

const {validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/review.js");

// Post Reviews Route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));
  
// Post Delete Reviews Route
  router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

  module.exports = router;