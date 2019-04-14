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
    req.flash("success","You Have Successfully Logout");
    res.redirect("/");
});

router.get("/forgot",function(req,res){
    res.render('forgot');
});

router.post("/forgot",function(req,res,next){
    async.waterfall([
        function(done){
            crypto.randomBytes(20,function(err,buf){
                var token = buf.toString('hex');
                done(err,token);
            });
        },
        function(token,done){
            User.findOne({email:req.body.email},function(err,user){
                if(err){
                    console.log(err);
                }
                if(!user){
                    req.flash('error','No account with that email address exists.');
                    return res.redirect('/forgot');
                }
                
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000;
                
                user.save(function(err){
                    done(err,token,user);
                });
            });
        },
        function(token,user,done){
            var smtpTransport = nodemailer.createTransport({
                service:'Gmail',
                auth:{
                    user:process.env.TECHEMAIL,
                    pass:process.env.TECHPASSWORD
                }
            });
            var mailOptions = {
              to: user.email,
        from: 'techsupport@yorklandhighschool.com',
        subject: 'Yorkland_Admin Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err){
               console.log('mail sent');
               req.flash('success','An e-mail has been sent to ' + user.email + ' with further instructions.');
               done(err,'done');
            });
        }
    ],function(err){
        if(err) return next(err);
        res.redirect('/forgot');
    });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if(err){
          console.log(err);
      }
     if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if(err){
              console.log(err);
          }
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            if(err){
                console.log(err);
            }
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
                if(err){
                    console.log(err);
                }
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: process.env.TECHEMAIL,
          pass: process.env.TECHPASSWORD
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'techsupport@yorklandhighschool.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/home');
  });
});


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = router;

