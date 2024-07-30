const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const onlineUsers = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    // When a user sends their username
    socket.on('set username', (username) => {
        socket.username = username;
        onlineUsers[socket.id] = username;
        io.emit('update users', Object.values(onlineUsers));
    });

    socket.on('chat message', (msg) => {
        msg.timestamp = new Date().toLocaleTimeString();
        io.emit('chat message', msg);
    });

    socket.on('typing', (username) => {
        socket.broadcast.emit('typing', username);
    });

    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing');
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        delete onlineUsers[socket.id];
        io.emit('update users', Object.values(onlineUsers));
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
