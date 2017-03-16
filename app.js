const app = require('express')();
const http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var usernames = {};

io.on('connection', function(socket){

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });

  socket.on('adduser', function(msg){
    console.log('user: ' + msg);
  });
});


io.emit('some event', { for: 'everyone' });

io.on('connection', function(socket){
  socket.broadcast.emit('hi');
});

io.on('connection', function(socket){
  socket.on('adduser', function(username){
      socket.username = username;
      usernames[username] = username;
      socket.emit('updatechat', 'SERVER', 'you have connected to room');
      //socket.emit('updatechat', 'SERVER', username + ' has connected to this room');
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});



http.listen(3000, function(){
  console.log('listening on *:3000');
});
