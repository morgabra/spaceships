var util = require('util');

var SpaceObject = require('./space_object').SpaceObject;

var Spaceship = function(user, x, y, width, height, heading) {
  this.heading = heading;
  this.throttle = 0;
  this.engineTemperature = 0;
  this.power = 100;
  this.shield = 100;
  this.health = 100;
  this.log = [];
  this.type = 'spaceship';
  this.viewDistance = 100;

  SpaceObject.call(this);
};
util.inherits(Spaceship, SpaceObject);

Spaceship.prototype.update = function(callback) {
  callback();
};

Spaceship.prototype.getViewBox = function() {
  var bounds = {};

  bounds.w = this.width;
  bounds.h = this.height;
  bounds.x = this.x - (this.viewDistance / 2);
  bounds.y = this.y - (this.viewDistance / 2);

  return bounds;
};

Spaceship.prototype.getDirection = function(target) {
  var angle, x, y;

  // Translate the target location as if the ship was the origin
  x = target.x - source.x;
  y = target.y - source.y;

  // The target is on the same spot as the ship
  if (x === 0 && y === 0) {
    return 0;
  }

  // Calculate the angle of the target
  angle = Math.atan2(y, x) * (180 / Math.PI);

  // Orient the atan2 angle to the origin in our coords
  if (angle < 0) {
    angle = Math.abs(angle) + 90;
  } else if (angle <= 90) {
    angle = 90 - angle;
  } else {
    angle = 270 + 180 - angle;
  }

  // Take the ship heading into account
  if (angle >= source.heading) {
    return angle - source.heading;
  } else {
    return 360 - source.heading + angle;
  }
};

exports.Spaceship = Spaceship;
