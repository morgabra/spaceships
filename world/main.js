var async = require('async');

var Cosmos = require('./lib/cosmos').Cosmos;
var Spaceship = require('./lib/spaceship').Spaceship;

c = new Cosmos();

var timeoutId;

var tick = function() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(c.tick.bind(c, tick), 100);
};


async.timesSeries(100, function(user, callback) {
  c.createShip(user, callback);
}, function() {
  c.tick(tick);
});

