const express = require("express");
const app = express();
const port = 3000;
var router = express.Router();
var path = __dirname + '/views/';

const sqlite3 = require('sqlite3').verbose();
// const CircularJSON = require('circular-json');

// open database connection
let db = new sqlite3.Database('./db/problems.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the 99Problem database.');
});
//var rows =  db.prepare("SELECT * FROM problems").all();
//console.log(rows);

db.each("SELECT * FROM problems", function(err, row) {
    console.log(row);
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

router.get("/graph",function(req,res){
  res.sendFile(path + "graph.html");
});

router.get("/data1.json",function(req,res){
  res.json(path + "data1.json");
  console.log("data1.json hit")
});

app.route("/dataentry")
  .get(function(req,res){
  res.sendFile(path + "dataentry.html");
  console.log("GET /dataentry");
  })
  .post(function handler(req, res) {
    var POST = {};
    if (req.method == 'POST') {
        req.on('data', function(data) {
            data = data.toString();
            data = data.split('&');
            for (var i = 0; i < data.length; i++) {
                var _data = data[i].split("=");
                POST[_data[0]] = _data[1];
            }
            console.log(POST);
            console.log(Object.keys(POST));
        })
    }
})


app.use("/",router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

app.listen(port,function(){
  console.log("Live at Port 3000");
});

process.on( 'SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
  // some other closing procedures go here
  // close the database connection
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });


  process.exit( );
})
