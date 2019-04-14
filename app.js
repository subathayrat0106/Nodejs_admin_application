var express           = require("express"),
    app               = express(),
    bodyParser        = require("body-parser"),
    mongoose          = require("mongoose"),
    moment            = require("moment"),
    passport          = require("passport"),
    LocalStrategy     = require("passport-local"),
    methodOverride    = require("method-override"),
    flash             = require("connect-flash"),
    dotenv            = require('dotenv').config(),
    User              = require("./models/user");
//requiring routes  
var  indexRoutes      = require("./routes/index"),
     commentRoutes      = require("./routes/comments"),
     homeRoutes       = require("./routes/home");
     //feeRoutes        = require("./routes/fee");
    
//DB Connection
app.locals.moment = require("moment");
//mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true });
mongoose.connect("mongodb://localhost:27017/yorkland_admin", { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine","ejs");
app.use(express.static(__dirname +"/public"));
app.use(methodOverride("_method"));
app.use(flash());

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret:"THIS IS NEW PAGE, HOW ARE YOU",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/",indexRoutes);
app.use("/home",homeRoutes);
app.use("/home/:id/comments",commentRoutes);

app.use(function (req, res, next) {
  res.status(404).render("error");
});


app.listen(process.env.PORT,process.env.IP,function()
{
    console.log("The Yorkland Admin App Server has started !!!");
});