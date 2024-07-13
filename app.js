const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

const channels = {};

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('join-channel', (channelId) => {
    if (!channels[channelId]) {
      channels[channelId] = [];
    }
    socket.join(channelId);
    channels[channelId].push(socket.id);
    console.log(`Client joined channel: ${channelId}`);
  });

  socket.on('screen-data', ({ channelId, data }) => {
    console.log(`Received screen data for channel: ${channelId}`);
    io.to(channelId).emit('screen-data', { channelId, data });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    for (const channelId in channels) {
      channels[channelId] = channels[channelId].filter(id => id !== socket.id);
      if (channels[channelId].length === 0) {
        delete channels[channelId];
      }
    }
  });
});

app.get('/streamer', (req, res) => {
  res.render('streamer');
});

app.get('/', (req, res) => {
  res.render('viewer');
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
