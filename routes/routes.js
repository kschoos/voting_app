var database;
var Routes = function(){};

Routes.prototype.setDB = function(db){
  database = db;
}

Routes.prototype.home = function(req, res){
  res.send({header: "Home", content: "It works!"});
}

module.exports = new Routes();