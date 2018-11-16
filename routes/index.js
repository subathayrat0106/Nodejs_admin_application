var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");


// show signup form
router.get("/signup", function(req, res){
   res.render("signup", {page: 'signup'}); 
});

//post signup form
router.post("/signup",function(req, res) {
    var newUser = new User({
    username: req.body.username, 
    firstName:capitalizeFirstLetter(req.body.firstName),
    lastName:capitalizeFirstLetter(req.body.lastName),   
    email:req.body.email
    });
    if (req.body.adminCode == process.env.ADMINCODE){
        newUser.isAdmin = true;
    }
    User.register(newUser,req.body.password,function(err,user){
        if(err)
        {
              req.flash("error","Create account error, Please contact support !");
              return res.render("signup", {error: err.message});
        }
        passport.authenticate("local")(req,res,function(){
            req.flash("success", "Welcome to Yorkland Admin App - " + user.firstName + " " + user.lastName);
            res.redirect("/home");
        });
    });
});

//show login form
router.get("/", function(req, res){
   res.render("login", {page: 'login'}); 
});

//handing login logic
router.post("/login",passport.authenticate("local",
{   
    successRedirect:"/home",
    failureRedirect:"/",
    failureFlash: true
    }),function(req, res) {
});

//logout route
router.get("/logout",function(req, res) {
    req.logout();
    req.flash("success","You have successfully logout");
    res.redirect("/");
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = router;

