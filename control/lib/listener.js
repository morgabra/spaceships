var exec = require('child_process').exec;
var fs = require('fs');
var redis = require('redis');
var request = require('request');

var Listener = function() {
  this.subscriber = redis.createClient();
  this.publisher = redis.createClient();
  this.buffer = {};
  setInterval(this.doBulkTick.bind(this), 1000);
};

Listener.prototype.listen = function() {
  this.subscriber.on('pmessage', this.handle.bind(this));

  this.subscriber.psubscribe('api:*');
};

Listener.prototype.handle = function(subChannel, channel, data) {
  console.log(channel + ': ' + data);
  // channel should be api:githubid:command
  var pieces = channel.split(':');
  if (pieces.length !== 3) {
    // bail
    return;
  }

  var username = pieces[1];
  var command = pieces[2];

  if (command === 'create') {
    // download python file etc
    var url = data;
    var directory = '/tmp/' + username;
    try {
      fs.mkdirSync(directory);
    } catch (e) {
      // already exists
    }
    request(url).pipe(fs.createWriteStream(directory + '/firmware.py'));

  } else if (command === 'tick') {
    data = JSON.parse(data);
    if (this.buffer[username] === undefined) {
      this.buffer[username] = [];
    }
    this.buffer[username].push(data);
  }
};

Listener.prototype.doBulkTick = function() {
  var usernames = Object.keys(this.buffer);
  for (var i = 0; i < usernames.length; i++) {
    var username = usernames[i];
    var data = this.buffer[username];
    if (data.length === 0) {
      continue;
    }
    this.buffer[username] = [];

    var dataArg = JSON.stringify(data);
    var firmware = '/tmp/' + username + '/firmware.py';
    var shellCommand = 'zvsh --zvm-image /home/vagrant/tarball/python.tar python @' + firmware + ' ' + dataArg;
    var that = this;
    var child = exec(shellCommand, function(error, stdout, stderr) {
      if (error) {
        // handle it
      }

      var pubChannel = 'api:' + username + ':result';
      that.publisher.publish(pubChannel, stdout);
    });
  }
};

exports.Listener = Listener;
