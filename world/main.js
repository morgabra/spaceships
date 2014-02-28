var async = require('async');

var Cosmos = require('./lib/cosmos').Cosmos;
var Spaceship = require('./lib/spaceship').Spaceship;

c = new Cosmos();

var timeoutId;

var tick = function() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(c.tick.bind(c, tick), 100);
};

async.series([
  function createPlanet(callback) {
    async.times(25, function(planet, callback) {
      c.createPlanet(callback);
    }, callback);
  },

  function createShips(callback) {
    async.times(5, function(user, callback) {
      c.createShip(user, callback);
    }, callback);
  }], function() {
    c.tick(tick);
  });

