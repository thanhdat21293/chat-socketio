/***
 * Ứng dụng chat
 */
const app = require('http').createServer(handler);
const io = require('socket.io')(app);
const fs = require('fs');

app.listen(8080, () => {
  console.log('Chat server listens at port 8080');
});

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
 */
io.on('connection', (socket) => {
  socket.emit('welcome', {message: 'Chào mừng bạn tham gia diễn đàn'});

  //Don't use message name 'pong'. It is reserved message
  socket.on('chat', (data) => {

    console.log(data);
    //To broadcast, simply add a broadcast flag to emit and send method calls.
    //Broadcasting means sending a message to everyone else except for the socket that starts it.
    socket.broadcast.emit('chat', data);
  });

});
