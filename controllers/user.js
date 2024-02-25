const User = require("../models/user");

// For rendering signup form
module.exports.renderSignUpForm = (req,res)=>{
    res.render("users/signup.ejs");
};

// Post signup form
module.exports.signup = async(req,res)=>{
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if(err){
                return next(err);
            }
            req.flash("success", "User registered successfully!!");
            res.redirect("/listings");
        });
    } catch(err){
        // req.flash("error", err.message);
        req.flash("error", "A user with the given username is already registered use another username.")
        res.redirect("/signup");
    }
}; 

// Render login form 
module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
};

// Login post route
module.exports.afterLogin = async (req,res) =>{
    req.flash("success", "Welcome back to wanderlust!");
    // res.redirect("/listings");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  };

// Log Out route
module.exports.afterLogOut = (req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Logged you out!!");
        res.redirect("/listings");
    });
};  