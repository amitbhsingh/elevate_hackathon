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
    /// here is where we need to send the parent's list to the frontend
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

/*************
  Declaring Functions
    List of Functions:
      fullDate() - Returns String of Current Date in Proper Format
      addChild(name, newChild) - Finds name in DB and adds newChild to its children
      addTag(name, newTag) - Finds name in DB and adds newTag to its tags
      pushToDB(name, parent, description, scores, tags) - New entry in DB with unique Name, parent, description, scores, and tags.
**************/

let sql = '';

// Get Current Date and Time
function fullDate(){
  const date = new Date();

  dateString = date.toString();

  return dateString;
}


// Add Child to Entry
function addChild(name, newChild){
  let currentChildren = '';

  // Get Current Children
  sql = 'SELECT children children FROM problems WHERE name = (?)';
  db.each(sql, name, (err, row) => {
    if(err){
      throw err;
    }
    currentChildren = row.children;
    // Update Child
    sql = 'UPDATE problems SET children = ? WHERE name = ?';
    db.run(sql, [currentChildren + ', ' + newChild, name], function(err){
      if(err){
        throw err;
      }
    });
  });
}

// Add Tag to Entry
function addTag(name, newTag){
  let currentTags = '';

  // Get Current Tags
  sql = 'SELECT tags tags FROM problems WHERE name = (?)';
  db.each(sql, name, (err, row) => {
    if(err){
      throw err;
    }
    currentTags = row.tags;

    // Update tags
    sql = 'UPDATE problems SET tags = ? WHERE name = ?';
    db.run(sql, [currentTags + ', ' + newTag.toLowerCase(), name], function(err){
      if(err){
        throw err;
      }
    });
  });
}

// Creates Database Entry with Given Inputs
function pushToDB(name, parent, description, scores, tags){
  // Define SQL Info
  let created = fullDate();
  let entries = [name, created, parent, description, scores, tags];
  sql = 'INSERT INTO problems(name, created, parent, description, scores, tags) VALUES(?, ?, ?, ?, ?, ?)';

  // Add Entries to DB
  db.run(sql, entries, function(err){
    if(err){
      throw err;
    }
  });

  // Update Parent to Include Child
  addChild(parent, name);
}

/* END OF FUNCTIONS */


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
