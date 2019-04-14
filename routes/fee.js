var express = require("express");
var router  = express.Router();
var middleware = require("../middleware");
var Student = require("../models/student");
var Fee = require("../models/fee");

//UPDATE STUDENT Balance
router.get("/update",middleware.isLoggedIn,function(req, res) {
   Student.findById(req.params.id,function(err,student){
       if(err){
           console.log(err);
       }else{
           res.render("fee/update",{student:student});
       }
   })
});

router.post("/:id/fee",middleware.isLoggedIn,function(req,res){
    var updatedTuition = req.body.updatedTuition;
    var updatedCredit = req.body.updatedCredit;
    var updatedAfterSchoolFee = req.body.updatedAfterSchoolFee;
    var updatedInsuranceFee = req.body.insuranceFee;
    var updatedLunchFee = req.body.updatedLunchFee;
    //var firstName =req.body.firstName;
    //var lastName = req.body.lastName;
    var newUpdate = {
        //firstName:firstName,
        //lastName:lastName,
        finance:{
    updatedTuition:updatedTuition,
    updatedCredit:updatedCredit,
    updatedAfterSchoolFee:updatedAfterSchoolFee,
    updatedInsuranceFee:updatedInsuranceFee,
    updatedLunchFee:updatedLunchFee
        }
    };
    Student.create(newUpdate,function(err,student){
       if(err){
           req.flash('error',err.message);
           return res.redirect('back');
       } 
       res.redirect('/home');
    });
});


//update additional
router.put("/:id/fee",middleware.isLoggedIn,function(req,res){
   Student.findById(req.params.id,function(err, updateFee) {
         if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } 
        updateFee.finance.updatedTuition = req.body.updatedTuition;
        updateFee.finance.updatedCredit = req.body.updatedCredit;
        updateFee.finance.updatedAfterSchoolFee = req.body.updatedAfterSchoolFee;
        updateFee.finance.updatedInsuranceFee = req.body.afterSchoolFee;
        updateFee.finance.updatedLunchFee = req.body.updatedLunchFee;
        updateFee.save();
        req.flash("success","Student Additional Fee Have Been Successfully Updated!");
        res.redirect("/home/" + updateFee.id);
    });
});



module.exports = router;