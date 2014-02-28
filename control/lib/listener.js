var exec = require('child_process').exec;
var fs = require('fs');
var redis = require('redis');
var request = require('request');

var Listener = function() {
  this.subscriber = redis.createClient();
  this.publisher = redis.createClient();
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
    // run a function
    // zvsh --zvm-image python.tar python @something.py args moreargs
    // then push stdout back to redis
    var firmware = '/tmp/' + username + '/firmware.py';
    var shellCommand = 'zvsh --zvm-image /home/vagrant/tarball/python.tar python @' + firmware + ' ' + data;
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
