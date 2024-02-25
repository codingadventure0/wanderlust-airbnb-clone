const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const User = require("../models/user.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");

const userController = require("../controllers/user.js");


// For SignUp or register 
router.route("/signup")
    .get(userController.renderSignUpForm)
    .post(wrapAsync(userController.signup));


// For login
router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,  
        passport.authenticate('local', { 
        failureRedirect: '/login', 
        failureFlash:true,
        }),
        
        userController.afterLogin
     );
     

router.get("/logout", userController.afterLogOut);


module.exports = router;