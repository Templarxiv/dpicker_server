var roomModule = require('./room');
var clients = [];
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000, () => {
  console.log('We are live on ' + 3000);
});
// app.use(bodyParser.urlencoded({
//   extended: false
// }))
// app.use(bodyParser.json())
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });


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
