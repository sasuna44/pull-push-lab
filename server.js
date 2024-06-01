const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let activeUsers = [];

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A new user has connected');

    socket.on('userLogin', (username) => {
        socket.username = username;
        activeUsers.push(username);
        io.emit('updateUsers', activeUsers);
        io.emit('message', { user: 'system', text: `${username} has joined the chat.` });
        console.log(`${username} has logged in. Active users:`, activeUsers);
    });

    socket.on('sendMessage', (message) => {
        if (socket.username) {
            io.emit('message', { user: socket.username, text: message });
            console.log(`Message from ${socket.username}: ${message}`);
        } else {
            console.log('Message from an undefined user. Ignored:', message);
        }
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            activeUsers = activeUsers.filter(user => user !== socket.username);
            io.emit('updateUsers', activeUsers);
            io.emit('message', { user: 'system', text: `${socket.username} has left the chat.` });
            console.log(`${socket.username} has disconnected. Active users:`, activeUsers);
        }
    });
});

server.listen(9000, () => console.log('Server is listening on port 9000'));
