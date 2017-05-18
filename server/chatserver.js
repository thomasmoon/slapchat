_ = require('underscore');

var Server = function(options) {
  var self = this;

  self.io = options.io;

  self.users = [];

  self.init = function() {

    // Fired upon a connection
    self.io.on("connection", function(socket) {
      self.handleConnection(socket);
    });
  }

  self.handleConnection = function(socket) {
    // wait for a login
    socket.on('login', function(name) {

      var nameBad = !name || name.length < 3 || name.length > 10;

      if (nameBad) {
        socket.emit('loginNameBad', name);
        return;
      }

      // name exists
      if (name in self.users) {
        socket.emit("loginNameExists", name);
      } else {
        var newUser = new User({ name: name, socket: socket });
        self.users[name] = newUser;
        self.setResponseListeners(newUser);
        socket.emit("welcome", name);
        self.io.sockets.emit("userJoined", name);
      }
    });
  }

  self.setResponseListeners = function(user) {

    user.socket.on("onlineUsers", function() {
      // refresh for all users
      self.io.sockets.emit("onlineUsers", Object.keys(self.users));
    });

    user.socket.on("chat", function(chat) {
      var msg = chat.trim();
      if (msg.substr(0,6)==='/slap ') {
        var target = msg.substr(6);
        if (target in self.users){
          self.users[target].socket.emit("slap", { sender: user.name });
        } else if (target == 'Slapchap') {
          user.socket.emit("slap", { sender: 'Slapchap' });
        }
      } else {
        self.io.sockets.emit("chat", { sender: user.name, message: chat });
      }
    });

    // This is called by both automatic disconnect, ie. window closes
    // and when the quit button is closed and client disconnects manually
    user.socket.on('disconnect', function() {
      // remove the user from the users list
      delete self.users[user.name];
      self.io.sockets.emit("userLeft", user.name);
    });
  }
}

// User Model
var User = function(args) {
  var self = this;

  self.socket = args.socket;
  self.name = args.name;
}

module.exports = Server;