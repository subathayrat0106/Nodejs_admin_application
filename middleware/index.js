var middlewareObj = {};

middlewareObj.isLoggedIn = function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to be logged in!");
    res.redirect("/");
}
module.exports = middlewareObj;