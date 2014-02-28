var async = require('async');

var Cosmos = require('./lib/cosmos').Cosmos;
var Spaceship = require('./lib/spaceship').Spaceship;

c = new Cosmos();

var tick = function() {
  var timeoutId;
  console.log('TICKING');
  console.dir(c.ships);
  timeoutId = setTimeout(c.tick.bind(c, tick), 100);
};

async.each(['jirwin', 'larsbutler', 'morgabra'], function(user, callback) {
  c.createShip(user, callback);
}, function() {
  c.tick(tick);
});

