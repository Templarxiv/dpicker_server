var roomModule = require('./room');
var mdb = require('./db');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');

var port = process.env.PORT || 8080;
app.use(
  "/",
  express.static(__dirname)
);
server.listen(port, () => {
  console.log('We are live on ' + port);
});
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
var rooms = [];
var db = new mdb.DB();
io.on('connection', function (socket) {
  socket.login = "";
  console.info('New client connected (id=' + socket.login + ').');
  socket.on('disconnect', function () {
    console.info('Client gone (id=' + socket.login + ').');
    for (var index = 0; index < rooms.length; index++) {
      var room = rooms[index];
      if (room.users[0] != null && room.users[0].id == socket.login) room.users[0] = null;
      if (room.users[1] != null && room.users[1].id == socket.login) room.users[1] = null;
      if (room.users.every(el => el == null)) {
        console.info('Deleting empty room ' + room.id);
        rooms.splice(index, 1);
      }
    }
  });
  socket.on('register', function (msg) {
    console.info("register");
    new Promise(resolve => {
      db.register(resolve, msg.login, msg.password)
    }).then(result => {
      socket.json.emit('registerResult', {
        text: result.text,
        success: result.isSuccess
      });
    });
  });
  socket.on('login', function (msg) {
    console.info("login " + msg.login);
    new Promise(resolve => {
      db.login(resolve, msg.login, msg.password);
    }).then(result => {
      if (result) socket.login = msg.login;
      socket.json.emit('loginResult', {
        login: msg.login,
        success: result
      });
    });
  });
  socket.on('create room', function (msg) {
    console.info("create" + socket.login);
    var room = new roomModule.Room();
    room.Create(socket.login);
    rooms.push(room);
    socket.join(room.id);

    io.sockets.emit('getRooms', rooms);
    io.sockets.to(room.id).emit('joinRoom', room);
  });
  socket.on('join room', function (msg) {
    console.info("join " + socket.login);
    var room = rooms.find(r => r.id = msg.id);
    room.Join(socket.login);
    socket.join(room.id);
    io.sockets.to(room.id).emit('joinRoom', room);
  });
  socket.on('spectate room', function (msg) {
    console.info("spectate " + msg);
    var room = rooms.find(r => r.id = msg.id);
    socket.json.emit('joinRoom', room);
  });
  socket.on('get rooms', function (msg) {
    console.info("get rooms");
    socket.json.emit('getRooms', rooms);
  });
  socket.on('draft', function (msg) {
    console.info("draft " + msg);
    io.sockets.to(msg).emit('draftStarted', {});
  });
  socket.on('choose', function (msg) {
    console.info("choose " + msg);
    var room = rooms.find(r => r.id = msg.rId);
    var resp = room.ChooseHero(msg.pId, msg.hId);
    io.sockets.to(msg.rId).emit('choosed', resp);
  });
});
