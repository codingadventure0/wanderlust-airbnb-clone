if(process.env.NODE_ENV != "production"){
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crpto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", ()=>{
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized:true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 1000,
    httpOnly: true,
  }
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get("/demouser",async (req,res)=>{
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta_st"
//   });

//   let registeredUser =  await User.register(fakeUser, "st123hello");
//   res.send(registeredUser);
// });

const listingsRoutes = require("./routes/listing.js");
const reviewsRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// use ejs-locals for all ejs templates:
app.engine('ejs', ejsMate);


// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

 app.use("/listings", listingsRoutes);
 app.use("/listings/:id/reviews", reviewsRoutes);
 app.use("/", userRoutes);


// app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
//   try {
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);

//     listing.reviews.push(newReview);

//     await newReview.save();
//     await listing.save();

//     console.log("New review saved");
//     res.redirect(`/listings/${listing._id}`);
//   } catch (error) {
//     console.error("Error saving review:", error);
//     // Handle error or pass control to the error handler
//     next(new ExpressError(500, "Error saving review"));
//   }
// }));


// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });

app.all("*",(err,req,res,next)=>{
  next(new ExpressError(404,"Page Not Found!!"));
})

// For error Handling
app.use((err,req,res,next)=>{
  // res.send("Something went wrong!! Please try again later.")
  let{statusCode=500, message="Something went wrong!!"} = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("err.ejs",{message});
  
});

// Listining port
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});





