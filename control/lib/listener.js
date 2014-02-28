var redis = require('redis');

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
  var pieces = channel.split(':');
  if (pieces.length !== 3) {
    // bail
    return;
  }

  command = pieces[2];

  if (command === 'create') {
    var message = JSON.parse(data);
    // download python file etc
  } else if (command === 'tick') {
    // run a function
    // zvsh --zvm-image python.tar python @something.py args moreargs
    // then push stdout back to redis
  }
};

exports.Listener = Listener;
