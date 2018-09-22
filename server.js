const express = require("express");
const app = express();
const port = 3000;
var router = express.Router();
var path = __dirname + '/views/';

const sqlite3 = require('sqlite3').verbose();

// open database connection
let db = new sqlite3.Database('./db/problems.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the problem database.');
});



router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

router.get("/about",function(req,res){
  res.sendFile(path + "about.html");
});

router.get("/contact",function(req,res){
  res.sendFile(path + "contact.html");
});

app.use("/",router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

app.listen(port,function(){
  console.log("Live at Port 3000");
});


// close the database connection
db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Close the database connection.');
});
