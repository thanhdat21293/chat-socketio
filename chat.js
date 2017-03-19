/***
 * Ứng dụng chat
 */
const app = require('http').createServer(handler);
const io = require('socket.io')(app);
const fs = require('fs');
const ios = require('socket.io-express-session');

app.listen(8080, () => {
  console.log('Chat server listens at port 8080');
});


let log = console.log;
function handler(req, res) {
  fs.readFile(__dirname + '/chat.html', (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading chat.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}




let message = "";
/***
 * Danh sách các message
 * welcome: chào mừng người dùng tham gia chat room
 * chat: người dùng gửi đoạn chat đến
 * join: Người dùng vào phòng
 */

// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = ['room1', 'room2'];


io.on('connection', (socket) => {
  //console.log(socket.id) // ID user khi load trang, mỗi lần load là 1 ID


  socket.on('join', function(username){
        // Lưu username vào socket session
        socket.username = username;

        socket.room = 'room1';

        usernames[username] = username;

        socket.join('room1');

        // echo to client they've connected
        socket.emit('updatechat', 'Bạn', ' vào phòng room1');

        // echo to room 1 that a person has connected to their room
        socket.emit('updaterooms', rooms, 'room1');

        //socket.broadcast.emit('join', data);
    });

  socket.on('switchRoom', function(newroom){
      socket.leave(socket.room);
      socket.join(newroom);
      socket.emit('updatechat', 'Bạn', ' vào phòng '+ newroom);
      // sent message to OLD room
      socket.broadcast.to(socket.room).emit('updatechat', socket.username, ' thoát khỏi phòng');
      // update socket session room title
      socket.room = newroom;
      socket.broadcast.to(newroom).emit('updatechat', socket.username, ' vào phòng');
      socket.emit('updaterooms', rooms, newroom);
  });

  //Don't use message name 'pong'. It is reserved message
  socket.on('chat', (data) => {
        //log(io.sockets.sockets[socket]);
    let name = socket.username;
    //console.log(data);
    //To broadcast, simply add a broadcast flag to emit and send method calls.
    //Broadcasting means sending a message to everyone else except for the socket that starts it.

      if(name) {
          //socket.broadcast.emit('chat', name, data);
          io.sockets.in(socket.room).emit('chat', socket.username, data);
      }else{
          socket.emit('nologin', data);
      }
     //io.sockets.in(socket.room).emit('chat', socket.username, data);
  });
/*
  socket.on('join', (data) => {
    socket.broadcast.emit('join', data);
  });
*/
  socket.on('listuser', (data) => {
    socket.broadcast.emit('listuser', data);
  });

  socket.on('disconnect', (data) => {
    log('user disconnected');
  });

});
