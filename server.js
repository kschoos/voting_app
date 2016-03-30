var express = require("express");
var strftime = require("strftime");
var routes = require("./routes/routes.js")
var app = express();
var port = process.env.PORT || 5000;
var passport = require("passport");
var GithubStrategy = require("passport-github").Strategy;
var mongo = require("mongodb").MongoClient;
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
  routes.setDB(db);
})

passport.serializeUser(function(user, done) {
    console.log(user);
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.set("view engine", "jade");
app.use(express.static(__dirname + "/public"));
app.get("/", function(req, res){
  res.render("index", {isHome: true, toHome: "./", current: ""});
})
app.get("/auth/github", passport.authenticate("github"));
app.get("/auth/github/callback", passport.authenticate("github", {
  successRedirect: "/success",
  failureRedirect: "/error"
}), function(req, res){
  console.log(req.user);
})
app.get("/success", function(req, res){
})

app.post("/home", routes.home);


app.listen(port, function(){
  console.log("Server running on port: " + port);
});
