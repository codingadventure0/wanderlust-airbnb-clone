const Listing = require("./models/listing.js");
const {listingSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const {reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");

// Validation middleware for verification of is any one is login or not
module.exports.isLoggedIn = (req,res, next) => {
    // console.log(req.user); // this is print user info
    // console.log(req.path, "..", req.originalUrl);
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl; // user automatic redirect to their page before login
        req.flash("error", "you must be logged in to  access listing!");
        return res.redirect("/login");
    }
    next();
};

// Validation for where the user is before login
module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// Validation middleware for Owner verify
module.exports.isOwner = async (req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "You are not owner of the listining");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// Validation middleware for Author verify for deleting comment
module.exports.isReviewAuthor = async (req,res,next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You are not author of the Review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// Validation middleware for listing forms
module.exports.listingvalidation = (req, res, next) => {
    const { error } = listingSchema.validate(req.body); 
    if (error) {
      
      const errMsg = error.details.map((el) => el.message).join(', ');
      next(new ExpressError(400, errMsg));
    } else {
      next(); 
    }
};


  // Validation middleware for reviews
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
  
    if (error) {
      console.error("Review Validation Error:", error.message);
      return res.status(400).send(`Validation Error: ${error.message}`);
    } else {
      next();
    }
};