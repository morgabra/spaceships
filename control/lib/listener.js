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
};

exports.Listener = Listener;
