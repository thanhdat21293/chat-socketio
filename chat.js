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
 * chat: người dùng gửi đoạn chat đến
 * join: Người dùng đăng nhập, mặc định vào room1
 * switchRoom: Người dùng chọn room
 * socket.broadcast.in(socket.room).emit() : Thực hiện lệnh cho tất cả user (Trừ user hiện tại)
 * io.sockets.in(socket.room).emit() : Thực hiện lệnh cho tất cả user (Kể cả user hiện tại)
 */

let usernames = {};

let rooms = ['all'];


io.on('connection', (socket) => {
    //console.log(socket.id) // ID user khi load trang, mỗi lần load là 1 ID


    socket.on('join', function (username) {
        // Lưu username vào socket session
        socket.username = username;
        socket.room = 'all';

        usernames[socket.id] = username;

        socket.join('all');

        socket.broadcast.to(socket.room).emit('updatechat', username, ' đã vào phòng All');

        socket.emit('updatechat', 'Bạn', ' vào phòng chat All');

        socket.emit('updaterooms', rooms, 'all');

    });

    socket.on('switchRoom', function (newroom) {
        socket.leave(socket.room);
        socket.join(newroom);
        if (usernames[newroom] != undefined) {
            socket.emit('updatechat', 'Bạn', ' chat riêng với ' + socket.username);

            // Gửi tin nhắn cho room vừa thoát
            socket.broadcast.to(socket.room).emit('updatechat', socket.username, ' rời phòng.');

            socket.room = newroom;
            socket.broadcast.to(newroom).emit('updatechat', socket.username, ' muốn chat riêng với bạn.');
        } else {
            socket.emit('updatechat', 'Bạn', ' đã vào phòng.');

            // Gửi tin nhắn cho room vừa thoát
            socket.broadcast.to(socket.room).emit('updatechat', socket.username, ' rời phòng.');

            socket.room = newroom;
            socket.broadcast.to(newroom).emit('updatechat', socket.username, ' vào phòng.');
        }

        socket.emit('updaterooms', rooms, newroom);
    });

    socket.on('chat', (data) => {
        //log(io.sockets.sockets[socket]);
        let name = socket.username;

        if (name) {
            socket.broadcast.in(socket.room).emit('chat', name, data);
        } else {
            socket.emit('nologin', data);
        }
    });

    socket.on('listuser', (data) => {
        /* let allConnectedClients = io.sockets.connected;*/
        //let clientsCount = io.engine.clientsCount ; // Dem user
        io.sockets.emit('listuser', usernames, data);
    });

    socket.on('disconnect', (data) => {
        delete usernames[socket.id];
        //let clientsCount = io.engine.clientsCount ; // Dem user
        socket.broadcast.emit('listuser', usernames, data);
        log('user disconnected');
    });

});
