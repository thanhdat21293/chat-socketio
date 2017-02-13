/***
 * Ứng dụng ping pong gửi message qua lại. Mỗi lần gửi tăng biến count lên 1
 * chú ý không dùng message name là 'pong' server sẽ không bao giờ nhận được
 */
const app = require('http').createServer(handler);
const io = require('socket.io')(app);
const fs = require('fs');

app.listen(8080, () => {
  console.log('App listens at port 8080');
});

function handler(req, res) {
  fs.readFile(__dirname + '/pong.html', (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading pong.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

let count = 0;

io.on('connection', (socket) => {
  socket.emit('ping', {msg: 'ping', count: count});

  //Don't use message name 'pong'. It is reserved message
  socket.on('poong', (data) => {
    console.log('poong', data);
    count += 1;
    socket.emit('ping', {msg: 'Ping', count: count});
  });

});


