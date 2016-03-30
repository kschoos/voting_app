var express = require("express");
var strftime = require("strftime");
var routes = require("./routes/routes.js")
var app = express();
var port = process.env.PORT || 5000;
var mongo = require("mongodb").MongoClient;

console.log(process.env.MONGOLAB_URI);

mongo.connect(process.env.MONGOLAB_URI, function(err, db){
  console.log("Connected successfully to MongoDB");
  routes.setDB(db);
})

app.set("view engine", "jade");
app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res){
  res.render("index", {isHome: true, toHome: "./", current: ""});
})

app.post("/home", routes.home);


app.listen(port, function(){
  console.log("Server running on port: " + port);
})
