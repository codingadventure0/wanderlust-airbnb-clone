const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
// const {listingSchema} = require("../schema.js");

const multer  = require('multer');
const {storage} = require("../cloudconfig.js")
const upload = multer({ storage });

const {isLoggedIn} = require("../middleware.js");
const {isOwner, listingvalidation} = require("../middleware.js");

const listingController = require("../controllers/listing.js");

  
router.route("/")
  .get( wrapAsync(listingController.index)) //Index Route
  .post( isLoggedIn,upload.single('listing[image]'),listingvalidation, wrapAsync(listingController.createListing)); //Create Route
  // .post(upload.single('listing[image]'),(req,res)=>{
  //   res.send(req.file);
  // })

//New Route
router.get("/new",isLoggedIn, listingController.renderNewForm);

router.route("/:id")
  .get( wrapAsync(listingController.showListing)) //Show Route
  .put( isLoggedIn,isOwner,upload.single('listing[image]'),listingvalidation, wrapAsync(listingController.updateListing)) //Update Route
  .delete( isLoggedIn,isOwner, wrapAsync(listingController.destroyListing)); // Delete Route

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));
  

  module.exports = router;
