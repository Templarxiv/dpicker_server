var roomModule = require('./room');
var clients = [];
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');

var port = process.env.PORT || 8080;
app.use(
  "/", //the URL throught which you want to access to you static content
  express.static(__dirname) //where your static content is located in your filesystem
);
server.listen(port, () => {
  console.log('We are live on ' + port);
});
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var room;
io.on('connection', function (socket) {
  console.info('New client connected (id=' + socket.id + ').');
  clients.push(socket);
  socket.on('disconnect', function () {
    var index = clients.indexOf(socket);
    if (index != -1) {
      clients.splice(index, 1);
      console.info('Client gone (id=' + socket.id + ').');
    }
  });
  socket.on('create room', function (msg) {
    console.info("create");
    room = new roomModule.Room();
    room.Create(socket.id);
    io.sockets.emit('createRoom', room.users);
  });
  socket.on('join room', function (msg) {
    console.info("join " + msg);
    if (room != null)
      room.Join(socket.id);
    io.sockets.emit('joinRoom', room.users);
  });
  socket.on('draft', function (msg) {
    console.info("draft " + msg);
    room.Start();
    io.sockets.emit('draftStarted', room.users);
  });
  socket.on('choose', function (msg) {
    console.info("choose " + msg);
    var resp = room.ChooseHero(msg.pId, msg.hId);
    io.sockets.emit('choosed', resp);
  });
});




// app.post('/create-room', (req, res) => {
//   var p = req.body.id;
//   room = new Room();
//   room.create(p);
//   res.send('created room');
// });
app.post('/join', (req, res) => {
  var p = req.body.id;
  if (room != null)
    room.Join(p);
  res.send('joined room');
});
app.post('/start', (req, res) => {
  var p = req.body.id;
  room.Start();
  res.send('Draft!');
});
app.post('/choose', (req, res) => {
  var resp = room.ChooseHero(req.body.pId, req.body.hId);
  res.send(resp);
});
app.get('/result', (req, res) => {
  var p = req.body.id;
  var resp = room.getResult();
  res.send(resp);
});
