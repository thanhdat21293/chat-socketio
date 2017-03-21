/***
 * Ứng dụng chat
 */
const app = require('http').createServer(handler);
const io = require('socket.io')(app);
const fs = require('fs');
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
 * join: Người dùng đăng nhập, mặc định vào all
 * switchRoom: Người dùng chọn room
 * sameroom: Cập nhật lại user các phòng khi 1 user chuyển phòng khác
 * updatechat: Thông báo vào phòng và rời phòng
 * listuser: Hiển thị user online
 * socket.broadcast.in(socket.room).emit() : Thực hiện lệnh cho tất cả user (Trừ user hiện tại)
 * io.sockets.in(socket.room).emit() : Thực hiện lệnh cho tất cả user (Kể cả user hiện tại)
 */

let usernames = {};
let rooms = ['all', 'room 2'];
io.on('connection', (socket) => {
    //console.log(socket.id) // ID user khi load trang, mỗi lần load là 1 ID
    socket.on('join', function (username) {
        let check = 1;
        for (let id in usernames) {
            if (usernames[id] === username) {
                check = 2;
                break;
            }
        }
        if (check === 1) {
            // Lưu username vào socket session
            socket.username = username;
            socket.room = 'all';
            usernames[socket.id] = username;
            socket.join('all');
            socket.broadcast.to(socket.room).emit('updatechat', username, ' đã vào phòng All');
            socket.emit('updatechat', 'Bạn', ' vào phòng chat All');
            socket.emit('updaterooms', rooms, 'all');
            let clients = Object.keys(io.sockets.adapter.rooms['all'].sockets);
            io.sockets.in(socket.room).emit('sameroom', usernames, clients, socket.room);
        }
        socket.emit('samename', username, check);
    });
    socket.on('switchRoom', function (newroom, idUser) {
        socket.leave(socket.room);
        socket.join(newroom);
        let oldRoom = socket.room;

        if (usernames[idUser] != undefined) {
            socket.emit('updatechat', 'Bạn', ' chat riêng với ' + usernames[idUser]);
            socket.broadcast.to(socket.room).emit('updatechat', socket.username, ' rời phòng.');
            socket.room = newroom;
            socket.broadcast.to(newroom).emit('updatechat', socket.username, ' muốn chat riêng với bạn.');
        } else {
            /*
            let checkRoom = 1;
            rooms.forEach((room) => {
                if(oldRoom === room){
                    checkRoom = 2;
                }
            });
            if (checkRoom === 2) {
                //Cập nhật lại user ở room vừa rời
                let clients = Object.keys(io.sockets.adapter.rooms['room 2'].sockets);
                io.sockets.in('room 2').emit('sameroom', usernames, clients, 'room 2');
            }
            */
            socket.emit('updatechat', 'Bạn', ' đã vào phòng ' + newroom);
            // Gửi tin nhắn cho room vừa thoát
            socket.broadcast.to(socket.room).emit('updatechat', socket.username, ' rời phòng.');
            socket.room = newroom;
            socket.broadcast.to(newroom).emit('updatechat', socket.username, ' vào phòng ' + newroom);

            //Cập nhật user ở room vừa vào
            let clients = Object.keys(io.sockets.adapter.rooms[newroom].sockets);
            io.sockets.in(newroom).emit('sameroom', usernames, clients, newroom);
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