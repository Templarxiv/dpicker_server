var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// mongod --dbpath=./data
var localUri = "mongodb://localhost:27017/dpicker";
var webUri = 'mongodb://dp_admin:f58admin@cluster0-shard-00-00-e2ity.mongodb.net:27017,cluster0-shard-00-01-e2ity.mongodb.net:27017,cluster0-shard-00-02-e2ity.mongodb.net:27017/dpicker?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';
mongoose.connection.openUri(webUri);
var conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', function () {
  console.log("established to mongodb");
});

var accShema = mongoose.Schema({
  login: String,
  password: String,
  name: String
});

class DB {
  constructor() {
    this.accModel = mongoose.model('Account', accShema);
  }
  login(resolve, login, password) {
    this.accModel.findOne({
      login: login
    }, (error, doc) => {
      if (!doc) return resolve(false);
      if (doc.password == password) return resolve(true);
      else return resolve(false);
    });
  }
  register(resolve, login, password) {
    this.accModel.findOne({
      login: login
    }, (error, doc) => {
      if (doc) return resolve({
        text: "Account name already being used.",
        isSuccess: false
      });
      else {
        var acc = new this.accModel({
          login: login,
          password: password
        });
        acc.save((err) => {
          if (err) return resolve({
            isSuccess: false
          });
          else return resolve({
            isSuccess: true
          });
        });
      }
    });
  }
}

exports.DB = DB;
