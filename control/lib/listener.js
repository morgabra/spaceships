var fs = require('fs');
var redis = require('redis');
var request = require('request');

var Listener = function() {
  this.redis = redis.createClient();
  this.redis.debug_mode = true;

};

Listener.prototype.listen = function() {
  this.redis.on('pmessage', this.handle);

  this.redis.psubscribe('api:*');
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
  }
};

exports.Listener = Listener;
