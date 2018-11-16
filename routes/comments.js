var express = require("express");
var router  = express.Router({mergeParams:true});
var Comments = require("../models/comment");
var Student = require("../models/student");
var middleware = require("../middleware");

//show new comment page
router.get("/new",middleware.isLoggedIn,function(req, res) {
    Student.findById(req.params.id,function(err,student){
        if(err)
        {
            req.flash("error","Unable to direct to new comment page");
            res.redirect("back");
        }else
        {
            res.render('comments/new',{student:student});
        }
    });
});

//Create new comment
router.post("/",middleware.isLoggedIn,function(req,res){
  Student.findById(req.params.id,function(err,student){
      if(err){
          req.flash('error',err.message);
          res.redirect("back");
      }else{
          Comments.create(req.body.comment,function(err,comment){
              if(err){
                  req.flash('error',err.message);
                  res.redirect('/home/'+ student._id);
              }else{
                  comment.author.id = req.user._id;
                  comment.author.username = req.user.username;
                  comment.author.firstName = req.user.firstName;
                  comment.author.lastName = req.user.lastName;
                  comment.save();
                  student.comments.push(comment);
                  student.save();
                  req.flash("success","Successfully added comment");
                  res.redirect('/home/'+ student._id);
              }
          });
      }
  });
});

//COMMENT EDIT ROUTER
router.get("/:comment_id/edit",middleware.isLoggedIn,function(req,res){
    Comments.findById(req.params.comment_id,function(err, foundComment) {
        if(err){
             req.flash('error',err.message);
            res.redirect("back");
        }else{
            res.render("comments/edit",{student_id: req.params.id, comment:foundComment});
        }
    });
});

router.put("/:comment_id",middleware.isLoggedIn,function(req,res){
   Comments.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
        if(err){
             req.flash('error',err.message);
            res.redirect("back");
        }else{
            res.redirect("/home/" + req.params.id);
        }
   }) ;
});

router.delete("/:comment_id",middleware.isLoggedIn,function(req,res){
    Comments.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
         req.flash('error',err.message);
         res.redirect("back");
        }else{
           req.flash("success","Comment deleted");
           res.redirect("/home/"+req.params.id);
        }
    });
});


module.exports = router;