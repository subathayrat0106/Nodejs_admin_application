var express = require("express");
var router  = express.Router();
var middleware = require("../middleware");
var multer = require('multer');
var Student = require("../models/student");
var Fee = require("../models/fee");


//INDEX - SHOW HOME PAGE
router.get("/",middleware.isLoggedIn,function(req,res){
   Student.find({},function(err,allStudents){
       if(req.query.search){
           var noMatch = null;
           const regex = new RegExp(escapeRegExp(req.query.search),'gi');
           var condition = {$or:[{firstName:regex},{lastName:regex}]};
           Student.find(condition,function(err,allStudents){
              if(err){
                   req.flash('error',err.message);
                   return res.render("home");
              }else{
                  if(allStudents.length < 1){
                      noMatch = "No Student is found, please try again.";
                  }
                  res.render("home",{students: allStudents, page:'home',noMatch:noMatch});
              } 
           });
       }else{
           //Get all student list from DB
           if(err){
                req.flash('error',err.message);
               return res.redirect('/home');
           }else{
               res.render("home",{students: allStudents, page:'home',noMatch:noMatch});
           }
       }
   });
});

//Create A New Student
router.post("/",middleware.isLoggedIn,function(req,res){
    var firstName = req.body.firstName;
    var lastName  = req.body.lastName;
    var dob       = req.body.dob;
    var tuition   = req.body.tuition;
    var credit    = req.body.credit;
    var afterSchoolProgram = req.body.afterSchoolProgram;
    var afterSchoolFee = req.body.afterSchoolFee;
    var insuranceFee = req.body.insuranceFee;
    var lunchFee = req.body.lunchFee;
    var studentEntryTime = req.body.studentEntryTime;
    var newStudent ={
        firstName : capitalizeFirstLetter(firstName),
        lastName : capitalizeFirstLetter(lastName),
        dob : dob,
        studentEntryTime: studentEntryTime,
        finance:{
        tuition:tuition,
        credit:credit,
        afterSchoolProgram:afterSchoolProgram,
        afterSchoolFee:afterSchoolFee,
        insuranceFee:insuranceFee,
        lunchFee:lunchFee
        }
    };
    Student.create(newStudent,function(err,student){
       if(err){
           req.flash('error',err.message);
           return res.redirect('back');
       } 
       res.redirect('/home');
    });
});

//NEW - show form to create new student
router.get("/new",middleware.isLoggedIn,function (req,res) {
    res.render("new");
});

//Show - show a student info
router.get("/:id",middleware.isLoggedIn,function(req,res){
   Student.findById(req.params.id).populate("comments").populate("updateFees").exec(function(err,foundStudent){
     if(err){
      req.flash("error", "Something went wrong.");
      return res.redirect("/home");
     }else{
         res.render("show",{student:foundStudent});
     }
   });
});

//EDIT STUDENT INFO
router.get("/:id/edit",middleware.isLoggedIn,function(req, res) {
   Student.findById(req.params.id,function(err,foundStudent){
       if(err){
            req.flash("error","Student not found");
       }
        res.render("edit",{student:foundStudent});
   });
});

router.put("/:id",middleware.isLoggedIn,function(req,res){
    Student.findById(req.params.id,function(err, foundStudent) {
         if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } 
        foundStudent.firstName = capitalizeFirstLetter(req.body.firstName);
        foundStudent.lastName = capitalizeFirstLetter(req.body.lastName);
        foundStudent.dob = req.body.dob;
        foundStudent.studentEntryTime = req.body.studentEntryTime;
        foundStudent.finance.tuition = req.body.tuition;
        foundStudent.finance.credit = req.body.credit;
        foundStudent.finance.afterSchoolProgram = req.body.afterSchoolProgram;
        foundStudent.finance.afterSchoolFee = req.body.afterSchoolFee;
        foundStudent.finance.insuranceFee = req.body.insuranceFee;
        foundStudent.finance.lunchFee = req.body.lunchFee;
        foundStudent.save();
        req.flash("success","Student Infomation Have Been Successfully Edit!");
        res.redirect("/home/" + foundStudent._id);
    });
});


router.delete("/:id",middleware.isLoggedIn,function(req,res){
    Student.findByIdAndRemove(req.params.id,function(err){
        if(err)
        {
            res.flash("error","Unable delete the info");
            res.redirect("/home");
        }else{
            res.redirect("/home");
        }
    });
});

router.get("/:id/fee/update",middleware.isLoggedIn,function(req, res) {
   Student.findById(req.params.id,function(err,student){
       if(err){
           console.log(err);
       }else{
           res.render("fee/update",{student:student});
       }
   });
});

router.post("/:id/fee",middleware.isLoggedIn,function(req,res){
    Student.findById(req.params.id,function(err, student) {
        if(err){
          req.flash('error',err.message);
          res.redirect("back");
        }else{
            Fee.create(req.body.update,function(err,updateFee){
                if(err){
                  req.flash('error',err.message);
                }else{
                    updateFee.author.id = req.user._id;
                    updateFee.author.username = req.user.username;
                    updateFee.author.firstName = req.user.firstName;
                    updateFee.author.lastName = req.user.lastName;
                    updateFee.save();
                    student.updateFees.push(updateFee);
                    student.save();
                    req.flash("success","Successfully updated student fee");
                    res.redirect('/home');
                }
            });
        }
    });
});

router.get("/:id/fee/:updateFee_id/edit",middleware.isLoggedIn,function(req ,res){
     Fee.findById(req.params.updateFee_id,function(err, newUpdateFee) {
        if(err){
             req.flash('error',err.message);
            res.redirect("back");
        }else{
            res.render("fee/edit",{student_id: req.params.id, fee:newUpdateFee});
            console.log(newUpdateFee);
        }
    });
});

router.put("/:id/fee/:updateFee_id",middleware.isLoggedIn,function(req,res){
    Fee.findByIdAndUpdate(req.params.updateFee_id,req.body.update,function(err,newUpdate){
         if(err){
             req.flash('error',err.message);
            res.redirect("back");
        }else{
            res.redirect("/home/" + req.params.id);
        }
    });
});

router.delete("/:id/fee/:updateFee_id",middleware.isLoggedIn,function(req,res){
    Fee.findByIdAndRemove(req.params.updateFee_id,function(err){
        if(err){
         req.flash('error',err.message);
         res.redirect("back");
        }else{
           req.flash("success","Update Balance deleted");
           res.redirect("/home/"+req.params.id);
        }
    });
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); 
}

module.exports = router;