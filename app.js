//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose= require("mongoose");
const encrypt= require("mongoose-encryption");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

console.log(process.env.API_KEY);
mongoose.connect("mongodb://localhost:27017/userDB"  , {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
//mongo schema
const userSchema= new mongoose.Schema({
    email: {
      type: String,
      required: [true, "Please enter email"]
    } ,
    password: {
      type: String,
      required: [true, "Please enter password"]
    }
});

userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields:["password"]});
//mongo model for mongo document
const User= new mongoose.model("User",userSchema);

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


app.post("/register", function(req, res){
    const newUser= new User({
      email:req.body.username,
      password:req.body.password
    });
    newUser.save(function(err){
        if(!err){
          res.render("secrets");
        }else{
          console.log(err);
        }
    });
});

app.post("/login", function(req,res){
    User.findOne({email: req.body.username}, function(err, foundUser){
      if(err){
        console.log(err);
      }else{
          console.log(foundUser);
          if(foundUser){
            if(foundUser.password === req.body.password){
                  res.render("secrets");
            }
          }
      }
    });

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
