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


io.on('connection', (socket) => {
  //console.log(socket.id) // ID user khi load trang, mỗi lần load là 1 ID
    /*
  socket.on('welcome', (data) => {
    //console.log(data);
    socket.emit('welcome', {message: '<div class="title">Chào mừng bạn tham gia diễn đàn</div>'});
  });
  */
    session.socket.id;
    log(sess);
  //Don't use message name 'pong'. It is reserved message
  socket.on('chat', (data) => {

    //console.log(data);
    //To broadcast, simply add a broadcast flag to emit and send method calls.
    //Broadcasting means sending a message to everyone else except for the socket that starts it.
    socket.broadcast.emit('chat', data);
  });

  socket.on('join', (data) => {
    socket.broadcast.emit('join', data);
  });

  socket.on('listuser', (data) => {
    socket.broadcast.emit('listuser', data);
  });

  socket.on('disconnect', (data) => {
    log('user disconnected');
  });

});
