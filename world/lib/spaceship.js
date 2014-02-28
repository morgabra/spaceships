var util = require('util');

var SpaceObject = require('./space_object').SpaceObject;

var Spaceship = function(user, x, y, width, height) {
  SpaceObject.call(this);
};
util.inherits(Spaceship, SpaceObject);

Spaceship.prototype.update = function(callback) {
  callback();
};


exports.Spaceship = Spaceship;
