var express = require("express");
var bodyparser = require("body-parser");
var strftime = require("strftime");
var routes = require("./routes/routes.js")
var app = express();
var port = process.env.PORT || 5000;
var passport = require("passport");
var GithubStrategy = require("passport-github").Strategy;
var mongo = require("mongodb").MongoClient;
var session = require("express-session")
var MongoStore = require("connect-mongo")(session)
var database = {};

app.use(bodyparser.urlencoded({ extended: true }));

app.use(require("express-session")({
  secret: "wambudendudi",
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ url: process.env.MONGOLAB_URI})
}));

app.use(passport.initialize());
app.use(passport.session());

var GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
var GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

passport.use(new GithubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/github/callback"
}, function(accessToken, refreshToken, profile, done){
  process.nextTick(function(){
    return done(null, profile);
  }) 
}))

mongo.connect(process.env.MONGOLAB_URI, function(err, db){
  console.log("Connected successfully to MongoDB");
  database = db;
  routes.setDB(db);
})

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.set("view engine", "jade");
app.use(express.static(__dirname + "/public"));
app.get("/auth/github", passport.authenticate("github"));
app.get("/auth/github/callback", passport.authenticate("github", {
    successRedirect: "/success",
    failureRedirect: "/error"
  }), function(req, res){
})

app.get("/logout", routes.logout);
app.get("/success", routes.success);
app.get("/",  routes.home);
app.post("/home", routes.home);
app.post("/mypolls", routes.myPolls);
app.post("/allpolls", routes.allPolls);
app.post("/submitpoll", routes.submitPoll);
app.post("/getpoll", routes.getPoll);
app.post("/submitchoice", routes.submitChoice);


app.listen(port, function(){
  console.log("Server running on port: " + port);
});
