//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose= require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


//const md5=require("md5");
//const encrypt= require("mongoose-encryption");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret:"Our little secret.",
  resave:false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

console.log(process.env.API_KEY);
mongoose.connect("mongodb://localhost:27017/userDB"  , {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('useCreateIndex', true);
//mongo schema
const userSchema= new mongoose.Schema({
    username: String ,
    password: String
});
userSchema.plugin(passportLocalMongoose);
//userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields:["password"]});
//mongo model for mongo document
const User= new mongoose.model("User",userSchema);
//
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//routes
app.get("/", function(req,res){
    res.render("home");
});
app.get("/login", function(req,res){
    res.render("login");
});
app.get("/register", function(req,res){
    res.render("register");
});

app.get("/secrets", function(req,res){
    if(req.isAuthenticated()){
      res.render("secrets");
    }else{
      res.redirect("/login");
    }
});
app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/");
});


app.post("/register", function(req, res){
    User.register({username:req.body.username},req.body.password,function(err, user){
       if(err){
         console.log(err);
         res.redirect("/register");
       }else{
         passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets");
         });
       }

    });

});

app.post("/login", function(req,res){
    const user= new User({
      username: req.body.username,
      password:req.body.password
    });
    req.login(user, function(err){
      if(err){
        console.log(err);
      }else{
        passport.authenticate("local")(req, res, function(){
           res.redirect("/secrets");
        });
      }
    });

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});