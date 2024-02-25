const Listing = require("../models/listing.js");
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geoCodingClient = mbxGeoCoding({ accessToken: mapToken});

// Index route
module.exports.index = async (req, res,next) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};


// New form route get request
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
  };


// Show Routes
module.exports.showListing = async (req, res,next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
      path:"reviews",
      populate: {
        path:"author",
      }, 
    })
    .populate("owner");
    if(!listing){
      req.flash("error", "Listing you requested for does not exist!");
      res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  };

//   Create Listing post request
  module.exports.createListing = async (req, res, next) => {
    try {

      let response = await geoCodingClient.forwardGeocode({
        query:req.body.listing.location,
        limit: 1
      })
        .send()
      
        // console.log(response.body.features[0].geometry);
        // res.send("done");

      let url = req.file.path;
      let filename = req.file.filename;
      // console.log(url, "..", filename);
      const newListing = new Listing(req.body.listing);
      newListing.owner = req.user._id;
      newListing.image = {url, filename};
      await newListing.save();
      req.flash("success", "New Listing created successfully!!");
      res.redirect("/listings");
    } catch (err) {
      next(new ExpressError(500, "Error creating listing")); 
    }
  };

//   For edit form
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error", "Listing you requested for does not exist!");
      res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_250,w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
  };

//   For update route
module.exports.updateListing = async (req, res) => {
    if(!req.body.listing){
      throw new ExpressError(400,"Send valid data for listing");
    }
    let { id } = req.params;
    let listing =  await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined"){
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = {url, filename};
      await listing.save();
    }  
    
    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
  };

// For Delete listings
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted successfully!!");
    res.redirect("/listings");
  };  