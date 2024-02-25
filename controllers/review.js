const Listing = require("../models/listing.js");
const Review = require("../models/review.js");


// Post Reviews Route
module.exports.createReview = async(req,res) => {
    try{
        console.log(req.params.id);
        let listing = await Listing.findById(req.params.id);
        let newReview = new Review(req.body.review);

        newReview.author = req.user._id;
        console.log(newReview) 
        listing.reviews.push(newReview);
    
        await newReview.save();
        await listing.save();
    
        console.log("new review saved");
        req.flash("success", "New Review added successfully!!");
        res.redirect(`/listings/${listing._id}`);
    } catch (err) {
      next(new ExpressError(500, "Error creating listing")); // Pass control to the error handler
    }
  };


//   For delete review
module.exports.destroyReview = async (req, res) => {
    let { id, reviewId} = req.params;
  
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`)
  };
