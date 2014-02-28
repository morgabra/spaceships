var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var passportSocketIo = require('passport.socketio');
var GitHubStrategy = require('passport-github').Strategy;

var MongoStore = require('connect-mongo')(express);

var http = require('http');
var Socket = require('socket.io');

var redis = require('redis');

var log = require('winston');


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

function App(settings) {
  this.settings = settings;
  this.staticdir = path.resolve(__dirname + "/../" + this.settings.static_path);
  this.viewsdir = path.resolve(__dirname + "/../lib/views");

  mongoose.connect(settings.db.host, settings.db.db);
  this.db = mongoose.connection;
  this.db.on('error', function (err) {
    console.log('Connection Error: ', err);
    process.exit(1);
  });
  this.db.once('open', function callback() {
    console.log('Connected to DB');
  });

  this.cookiestore = new MongoStore({mongoose_connection: this.db});

  this.redis = redis.createClient(settings.redis.port, settings.redis.host);

  this.app = express();
  this.app.configure(function() {

    this.app.set('views', this.viewsdir);
    this.app.set('view engine', 'jade');

    this.app.use(express.bodyParser());

    this.app.use(express.methodOverride());
    this.app.use(express.cookieParser());

    this.app.use(express.session({ secret: settings.secret, key: 'spaceships', store: this.cookiestore}));
    this.app.use(passport.initialize());
    this.app.use(passport.session());


    // Use the GitHubStrategy within Passport.
    //   Strategies in Passport require a `verify` function, which accept
    //   credentials (in this case, an accessToken, refreshToken, and GitHub
    //   profile), and invoke a callback with a user object.
    passport.use(new GitHubStrategy({
        clientID: settings.github.id,
        clientSecret: settings.github.secret,
        callbackURL: "http://spaceships.mirwin.net:3000/auth/github/callback"
      },
      function(accessToken, refreshToken, profile, done) {
          return done(null, profile);
      }
    ));

    // Variables available to every view
    this.app.locals = {
      title: "spaceships",
      errors: []
    };

    // Static Files
    this.app.use(express.static(this.staticdir));

  }.bind(this));

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
  }

  // Index
  this.app.get('/', ensureAuthenticated, function(req, res) {
    res.render('index', {user: req.user});
  }.bind(this));

  this.app.get('/update', ensureAuthenticated, function(req, res) {
    res.render('update', {user: req.user});
  }.bind(this));

  this.app.post('/update', ensureAuthenticated, function(req, res) {

    console.log('FDSAFDSAFDSAFASDFSAD');

    var user = req.user.username;
    var repo = req.body.repository;
    var branch = req.body.branch;

    if (!(user && repo && branch)) {
      console.log('Error parsing firmware location');
      res.redirect('/');
    } else {
      var url = 'https://raw.github.com/' + user + '/' + repo + '/starship/firmware.py';
      this.redis.publish('api:' + user + ':create', url, function(err, result) {
        if (err) {
          console.log('Error publishing firmware update', err);
        } else {
          console.log('Published firmware update to ' + result + ' clients.');
        }
      });
      res.redirect('/');
    }
  }.bind(this));

  this.app.get('/login', function(req, res) {
    res.render('login', { user: req.user });
  });

  this.app.get('/auth/github',
    passport.authenticate('github'),
    function(req, res){});

  this.app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

  this.app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  this.server = http.createServer(this.app);
  this.io = Socket.listen(this.server);
  this.io.set('log level', 0);

  // set authorization for socket.io
  this.io.set('authorization', passportSocketIo.authorize({
    cookieParser: express.cookieParser,
    key:         'spaceships',
    secret:      this.settings.secret,
    store:       this.cookiestore,
    success:     onAuthorizeSuccess,
    fail:        onAuthorizeFail,
  }));

  function onAuthorizeSuccess(data, accept){
    accept(null, true);
  }

  function onAuthorizeFail(data, message, error, accept){
    console.log('failed connection to socket.io:', message);
    accept(null, false);
  }

  this.io.on('connection', function (socket) {
    console.log("connected user: ", socket.handshake.user.username);

    socket.emit('data', {data: 'Connected!'});

    var rclient = redis.createClient(this.settings.redis.port, this.settings.redis.host);
    rclient.subscribe('tick:' + socket.handshake.user.username);
    rclient.on('message', function(chan, msg) {
      console.log("msg is: ", msg);
      socket.emit('data', {data: msg});
    });

    socket.on('data', function(data) {
      console.log(socket.handshake.user.username, data);
    });

  }.bind(this));

}

App.prototype.start = function () {

  this.server.listen(this.settings.listen_port);

  log.info('listening on port ' + this.settings.listen_port);
};

module.exports = App;
