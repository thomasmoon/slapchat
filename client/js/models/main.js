var ContainerModel = Backbone.Model.extend({
});

var UserModel = Backbone.Model.extend({

});


var UserCollection = Backbone.Collection.extend({
  model: UserModel
});

var ChatModel = Backbone.Model.extend({

});

var ChatCollection = Backbone.Collection.extend({
  model: ChatModel
});

var RoomModel = Backbone.Model.extend({
  defaults: {
    // Backbone collection for users
    onlineUsers: new UserCollection(),

    /**
     * Backbone collection for chats, init with predefined model
     *
     * @todo engage Slapchap, channel bot
     * @todo randomize starting message
     */

    userChats: new ChatCollection([
      new ChatModel({sender: 'Slapchap', message: "Welcome! Give me a slap, I'll get you back:<br /><em>/slap Slapchap</em>"}),
    ])
  },

  addUser: function(username) {
    this.get('onlineUsers').add(new UserModel({name: username}));
  },

  removeUser: function(username) {
    var onlineUsers = this.get('onlineUsers');
    var u = onlineUsers.find(function(item) {
      return item.get('name') == username;
    });

    if (u) {
      onlineUsers.remove(u);
    }
  },

  addChat: function(chat) {
    this.get('userChats').add(new ChatModel({sender: chat.sender, message: chat.message}));
  }
});

var LoginModel = Backbone.Model.extend({
  defaults: {
    error: ""
  }
});