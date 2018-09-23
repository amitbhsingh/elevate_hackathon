const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
var router = express.Router();
var path = __dirname + '/views/';

const sqlite3 = require('sqlite3').verbose();
var arrayToTree = require('array-to-tree');
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
var possibleparents = [];
var ALLrows = [];  // THE WHOLE DATABASE, YO!
var treefromallrows;
var populateParentArray = function () {
possibleparents = [];
db.each("SELECT * FROM problems", function(err, row) {
  //  console.log(row.name);
    possibleparents.push(row.name)
    ALLrows.push(row)
}, function(err, row) {
  //  console.log(possibleparents); // all parents collected
  // console.log(ALLrows);
  ALLrows.forEach(function(row){row.size=1})

treefromallrows = arrayToTree(ALLrows, {
  parentProperty: 'parent',
  childrenProperty: 'children',
  customID: 'name'
});
    console.log(treefromallrows); //WOOOO!
});
}
populateParentArray();


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
  res.sendFile(path + "data1.json");
  console.log("data1.json hit")
});

router.get("/allrows.json",function(req,res){
  res.json(ALLrows);
  console.log("allrows.json hit")
});


///////////////////////////////////////////////////////////////
router.get("/circlesdata.json",function(req,res){ // WORK HERE


    var circlesdata = {"name": "circles data", "children": treefromallrows}

  var count = 0;

  function count_leaves(node){
      if(node.children){
          //go through all its children
          for(var i = 0; i<node.children.length; i++){
              //if the current child in the for loop has children of its own
              //call recurse again on it to decend the whole tree
              if (node.children[i].children){
                  count_leaves(node.children[i]);
                  count++
              }
              //if not then it is a leaf so we count it
              else{
                  count++;
              }
          }
      }
      console.log("count: " + count)
    }
    count_leaves(circlesdata)

  //circlesdata.children.forEach(function(entry){entry.size = Math.random(5)+1})
  res.json(circlesdata);
  console.log(circlesdata)
  console.log("circlesdata.json hit")
});
////////////////////////////////////////////////////////////////


router.get("/parents.json",function(req,res){
  res.json(possibleparents);
  console.log("/parents.json hit")
});

app.route("/dataentry")
  .get(function(req,res){
    /// here is where we need to send the parent's list to the frontend
    populateParentArray()
    console.log(possibleparents);
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
            //pushToDB(name, parent, description, scores, tags) - New entry in DB with unique Name, parent, description, scores, and tags.
            pushToDB(POST.problemname, POST.problemparent, POST.problemdescription, 0, POST.problemtags);
            // console.log(Object.keys(POST)); // [ 'problemname',  'problemdescription', 'problemparent', 'problemtags', 'submit' ]

        })
    }
})


app.use("/",router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

app.listen(port,function(){
  console.log("Live at Port " + port + " http://localhost:"+port+"/graph");
});

/*************
  Declaring Functions
    List of Functions:
     stringToArray(initString) - Returns Array from Initial String using ", " for splitting
      fullDate() - Returns String of Current Date in Proper Format
      addChild(name, newChild) - Finds name in DB and adds newChild to its children
      addTag(name, newTag) - Finds name in DB and adds newTag to its tags
      pushToDB(name, parent, description, scores, tags) - New entry in DB with unique Name, parent, description, scores, and tags.
      getChildren(name) - Finds name in DB and return the children as an array
**************/

let sql = '';

// Get Current Date and Time
function fullDate(){
  const date = new Date();

  dateString = date.toString();

  return dateString;
}

// Split initString into Array and Return Array
function stringToArray(initString){
  stringArray = initString.split(", ");
  return stringArray;
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
  db.run(sql, entries, function(err,){
    if(err){
      throw err;
    }
    console.log("lastID is " + this.lastID);
  });

  // Update Parent to Include Child
  addChild(parent, name);
}

/* Getters */
function getChildren(name){
  let childrenArray = [];
  sql = 'SELECT children children FROM problems WHERE name = ?';

  // Get Children
  db.each(sql, name, (err, row) => {
    if(err){
      throw err;
    }
    childrenArray = stringToArray(row.children);
    console.log(childrenArray);
    return childrenArray;
  });
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
