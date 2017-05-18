var ContainerView = Backbone.View.extend({
  el: '#container',

  initialize: function(options) {
    this.model.on("change:viewState", this.render, this);
  },

  render: function() {
    var view = this.model.get('viewState');
    this.$el.html(view.render().el);
  }
});

var LoginView = Backbone.View.extend({
  template: _.template($('#login-template').html()),

  events: {
    'change #nameText': 'onLogin',
    'submit form': 'onLogin'
  },

  initialize: function(options) {
    this.vent = options.vent;

    this.listenTo(this.model, "change:error", this.render, this);
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));

    if (!this.l) {
      this.l = Ladda.create(this.$("#nameBtn").get(0));
    } else {
      this.l.stop();
    }

    $('form.welcome #nameText').val('').focus();
    return this;
  },

  onLogin: function(e) {
    // prevent the form from submitting
    e.preventDefault();
    this.l.start();
    this.vent.trigger("login", this.$('#nameText').val());
    $('form.welcome #nameText').val('').focus();
  }
});


var RoomView = Backbone.View.extend({
  template: _.template($("#room-template").html()),

  events: {
    'keypress #chatInput': 'chatInputPressed',
    'change #chatInput': 'chatSend',
    'click #backBtn': 'quitRoom',
    'click #quitBtn': 'logoutUser'
  },

  initialize: function(options) {

    this.vent = options.vent;

    // chat input is handled differently on mobile
    var md = new MobileDetect(window.navigator.userAgent);
    this.isMobile = md.mobile();

    var onlineUsers = this.model.get('onlineUsers');
    var userChats = this.model.get('userChats');

    this.listenTo(onlineUsers, "add", this.renderUser, this);
    this.listenTo(onlineUsers, "remove", this.renderUsers, this);
    this.listenTo(onlineUsers, "reset", this.renderUsers, this);

    this.listenTo(userChats, "add", this.renderChat, this);
    this.listenTo(userChats, "remove", this.renderChats, this);
    this.listenTo(userChats, "reset", this.renderChats, this);
  },

  render: function() {
    this.$el.html(this.template());
    this.renderUsers();
    this.renderChats();


    return this;
  },

  renderUsers: function() {
    this.$('#userList').empty();

    // add our bot first
    this.renderUser(new UserModel({name: "Slapchap"}));

    this.model.get("onlineUsers").each(function (user) {
      this.renderUser(user);
    }, this);
  },


  renderUser: function(model) {
    var template = _.template("<a class='list-group-item'><%= name %></a>");

    this.$('#userList').append(template(model.toJSON()));

    // add one extra for bot
    this.$('#userCount').html(this.model.get("onlineUsers").length+1);

    //this.$('.nano').nanoScroller();
  },

  renderChats: function() {
    this.$('#chatList').empty();

    this.model.get('userChats').each(function(chat) {
      this.renderChat(chat);
    }, this);
  },

  renderChat: function(model) {
    var template = _.template($('#msg-template').html());

    var element = $(template(model.toJSON()));

    element.appendTo(this.$('#chatList')).hide().fadeIn().slideDown();

    //this.$('.nano').nanoScroller();
    //this.$('.nano').nanoScroller({ scroll: 'bottom' });
  },

  slapUser: function(data) {
    //alert('slap');
    $('#slapper').html(data.sender);
    $('#slapOverlay').fadeIn();
    $(window).click(function clickSlap(){
      $('#slapOverlay').fadeOut();
      $(window).removeEventListener('click');
    });
  },

  // events

  chatInputPressed: function(evt) {
    if (evt.keyCode == 13) {
      this.vent.trigger("chat", this.$('#chatInput').val());
      this.$('#chatInput').val('');
      return false;
    }
  },

  chatSend: function() {
    if(this.isMobile){
      this.vent.trigger("chat", this.$('#chatInput').val());
      this.$('#chatInput').val('');
    }
  },

  quitRoom: function() {
    //this.vent.trigger("disconnect");
    //self.containerModel.set('viewState', MainController.loginView);
  },

  logoutUser: function() {
    this.vent.trigger("logout");
  }

});