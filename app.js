var express = require('express'),
  config = require('./config'),
  path = require('path'),
  http = require('http'),
  socketio = require('socket.io'),
  app = express(),
  server = http.createServer(app),
  io = socketio.listen(server);

server.listen(config.listen_port, function() {
  console.log(' - listening on ' + config.listen_port+ ' ' + __dirname);
});

// Frontend
app.get('/', function(req, res) {
  res.sendFile(path.resolve('client/index.html'));
});

// static frontend files
app.use(express.static('client'));

// require our chatserver
var ChatServer = require('./server/chatserver');

// initialize a new chat server.
new ChatServer({io: io}).init();