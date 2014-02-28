var async = require('async');

var Cosmos = require('./lib/cosmos').Cosmos;
var Spaceship = require('./lib/spaceship').Spaceship;

c = new Cosmos();

var timeoutId;

var tick = function() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(c.tick.bind(c, tick), 500);
};

async.series([
  function createPlanet(callback) {
    async.times(10, function(planet, callback) {
      c.createPlanet(callback);
    }, callback);
  }
], function() {
    c.tick(tick);
});
