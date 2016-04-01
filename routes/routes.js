var database;
var ObjectId = require("mongodb").ObjectID;
var Routes = function(){};

function getRenderData(req, msg){
  var data = {};
  if(req.session && req.session.passport){
    data.login = "Logout...";
    data.loginlink = "/logout";
    data.authed = true;
  } else {
    data.login = "Github Login"
    data.loginlink = "/auth/github";
    data.authed = false;
  }
  data.heading = msg;
  return data;
}

Routes.prototype.setDB = function(db){
  database = db;
}

Routes.prototype.home = function(req, res){
  var data = {};
  res.render("index", getRenderData(req, "Welcome!"));
}

Routes.prototype.success = function(req, res){
  database.collection("users").findOne({id: req.session.passport.user.id}, function(err, user){
    if(user === null){
      db.collection("users").insert(req.session.passport.user);
    }
    res.render("index", getRenderData(req, "Logged in successfully!"));
  })
}

Routes.prototype.logout = function(req, res){
  req.session.destroy();
  res.render("index", getRenderData(req, "Logged out successfully!"));
}

Routes.prototype.myPolls = function(req, res){
  database.collection("polls").find({creator: req.session.passport.user.username}).toArray(function(err, array){
    res.send({polls: array});
  })
}

Routes.prototype.allPolls = function(req, res){
  database.collection("polls").find().toArray(function(err, array){
    res.send({polls: array});
  })
}

function upperCaseString(string){
  return string.split(" ").map(function(word){
    return word.split("").map(function(letter, i){ return i === 0 ? letter.toUpperCase() : letter }).join("");
  }).join(" ");
}

Routes.prototype.submitPoll = function(req, res){
  var now = new Date();
  var choices = req.body.choices.map(function(choice){
    data = {};
    data.name = upperCaseString(choice);
    data.count = 0;
    return data;
  })

  var name = upperCaseString(req.body.title);
  database.collection("polls").insert({
    creator: req.session.passport.user.username,
    name: name,
    choices: choices,
    created: now 
  })
  res.end();
}

Routes.prototype.getPoll = function(req, res){
  console.log(req.body._id);
  database.collection("polls").findOne({_id: ObjectId(req.body._id) }, function(err, doc){
    res.send(doc);
  })
}

Routes.prototype.submitChoice = function(req, res){
  database.collection("polls").findAndModify(
    {_id: ObjectId(req.body._id), "choices.name": req.body.choice },
    [],
    { $inc: { "choices.$.count": 1 }},
    {new: true},
    function(e, doc){
      res.send(doc);
    });
}

module.exports = new Routes();
