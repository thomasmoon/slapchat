var MainController = function() {
  var self = this;

  // Event Bus for socket client
  self.appEventBus = _.extend({}, Backbone.Events);
  // Event Bus for Backbone Views
  self.viewEventBus = _.extend({}, Backbone.Events);

  // focus of elements is handled differently on mobile
  var md = new MobileDetect(window.navigator.userAgent);
  self.isMobile = md.mobile();

  // initialize function
  self.init = function() {

    // create a chat client and connect
    if(!self.chatClient) {
      self.chatClient = new ChatClient({vent: self.appEventBus});
    }

    // This will also work on reconnect and force a new connection
    self.chatClient.connect();

    // create our views, place login view inside container first.
    self.loginModel = new LoginModel();
    self.containerModel = new ContainerModel({
      viewState: new LoginView({
        vent: self.viewEventBus,
        model: self.loginModel
      })
    });
    self.containerView = new ContainerView({model: self.containerModel});
    self.containerView.render();
    // This doesn't work from within the render function the first time
    if (!self.isMobile) {
      $('form.welcome #nameText').focus();
    }
  };

  // View Event Bus Message Handlers
  self.viewEventBus.on('login', function(name) {
    // socketio login
    self.chatClient.login(name);
  });

  // View Event Bus Message Handlers
  self.viewEventBus.on('logout', function(name) {
    //self.chatClient.logout(name);
    self.chatClient.disconnect();
  });

  self.viewEventBus.on('chat', function(chat) {
    // socketio chat
    self.chatClient.chat(chat);
  });

  // Socket Client Event Bus Message Handlers

  // triggered when login success
  self.appEventBus.on('loginDone', function(name) {
    // remove the login error
    self.loginModel.set('error', '');

    self.roomModel = new RoomModel();
    self.roomView  = new RoomView({vent: self.viewEventBus, model: self.roomModel});
    // set viewstate to roomview
    self.containerModel.set('viewState', self.roomView);
    // This doesn't work well on mobile - add contextual behaviour?
    if (!self.isMobile) {
      $('#chatInput').focus();
    }
  });

  // triggered when login error due to bad name
  self.appEventBus.on('loginNameBad', function(name) {
    self.loginModel.set('error', 'Name must be between 3-10 characters.');
  });

  // triggered when login error due to already existing name
  self.appEventBus.on('loginNameExists', function(name) {
    self.loginModel.set('error', 'Sorry, that name is already in use.');
  });

  // triggered when client requests users info
  // responds with an array of online users.
  self.appEventBus.on('usersInfo', function(data) {
    var onlineUsers = self.roomModel.get('onlineUsers');
    var users = _.map(data, function(item) {
      return new UserModel({name: item});
    });

    onlineUsers.reset(users);
  });

  // triggered when a client joins the server
  self.appEventBus.on('userJoined', function(name) {
    self.roomModel.addUser(name);
    self.roomModel.addChat({sender: name, message: 'joined the room.'});
  });

  // triggered when a client leaves the server
  self.appEventBus.on('userLeft', function(name) {
    self.roomModel.removeUser(name);
    self.roomModel.addChat({sender: name, message: 'left the room.'});
  });

  // triggered when chat receieved
  self.appEventBus.on('chatReceived', function(chat) {
    self.roomModel.addChat(chat);
  });

  // triggered when chat receieved
  self.appEventBus.on('slapReceived', function(data) {
    self.roomView.slapUser(data);
  });

  // triggered when user logs out and app is to be reset to login screen
  self.appEventBus.on('resetApp', function(chat) {
    self.init();
  });
}

$(document).ready(function() {
  var mainController = new MainController();

  mainController.init();
});