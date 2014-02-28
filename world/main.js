var async = require('async');

var Cosmos = require('./lib/cosmos').Cosmos;
var Spaceship = require('./lib/spaceship').Spaceship;

c = new Cosmos();

async.each(['jirwin', 'larsbutler', 'morgabra'], function(user, callback) {
  c.createShip(user, callback);
}, function() {
  console.log('CREATED ALL SHIPS');
  var box = c.ships.jirwin.getViewBox();
  console.dir(box);
  console.dir(c.search(box.x, box.y, box.w, box.h));
});

