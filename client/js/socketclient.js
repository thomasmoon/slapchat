var ChatClient = function(options) {
  // redefine this to avoid conflicts
  var self = this;

  // app event bus
  self.vent = options.vent;

  self.hostname = 'http://'+window.location.host;

  // connects to the server
  self.connect = function() {
    // connect to the host
    self.socket = io.connect(self.hostname, {'forceNew':true });

    // set responseListeners on the socket
    self.setResponseListeners(self.socket);
  }

  // send login message
  self.login = function(name) {
    self.socket.emit('login', name);
  }

  // send chat message
  self.chat = function(chat) {
    self.socket.emit('chat', chat);
  }

  // send logout message
  self.logout = function(name) {
    self.socket.emit('logout', name);
  }

  // disconnect socket
  self.disconnect = function() {
    self.socket.io.disconnect();
    // reset app
    self.vent.trigger('resetApp');
  }

  self.setResponseListeners = function(socket) {
    // handle messages from the server
    socket.on('welcome', function(data) {
      // request server info
      socket.emit('onlineUsers');
      self.vent.trigger('loginDone', data);
    });

    socket.on('loginNameExists', function(data) {
      self.vent.trigger('loginNameExists', data);
    });

    socket.on('loginNameBad', function(data) {
      self.vent.trigger('loginNameBad', data);
    });

    socket.on('onlineUsers', function(data) {
      self.vent.trigger('usersInfo', data);
    });

    socket.on('userJoined', function(data) {
      self.vent.trigger('userJoined', data);
    });

    socket.on('userLeft', function(data) {
      self.vent.trigger('userLeft', data);
    });

    socket.on('chat', function(data) {
      self.vent.trigger('chatReceived', data);
    });

    socket.on('slap', function(data) {
      self.vent.trigger('slapReceived', data);
    });
  }
}