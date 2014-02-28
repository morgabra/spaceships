var util = require('util');

var SpaceObject = require('./space_object').SpaceObject;

var Spaceship = function(user, x, y, width, height, heading) {
  this.heading = Math.random() * 360;
  this.throttle = 100;
  this.engineTemperature = 0;
  this.power = 100;
  this.shield = 100;
  this.health = 100;
  this.log = [];
  this.type = 'spaceship';
  this.viewDistance = 250;
  this.name = user;

  SpaceObject.call(this, x, y, width, height);
};
util.inherits(Spaceship, SpaceObject);

Spaceship.prototype.tick = function(callback) {
  this.tickLocation();

  this.lastTicked = Date.now();
  callback();
};

Spaceship.prototype.tickLocation = function() {
  var speed = this.getSpeed(),
      delta = (Date.now() - this.lastTicked) / 1000, // delta in seconds
      distance = speed / delta;

  x = this.x + Math.cos(this.heading) * distance;
  y = this.y + Math.sin(this.heading) * distance;

  if (x < -320) {
    x = 320;
  } else if (x > 320) {
    x = -320;
  }

  if (y < -240) {
    y = 240;
  } else if (y > 240) {
    y = -240;
  }

  this.setLocation(x, y);
};

Spaceship.prototype.update = function(event) {
  event = JSON.parse(event.toString());

  this.throttle = event.throttle || this.throttle;
  this.heading = event.heading || this.heading;
};

Spaceship.prototype.getSpeed = function() {
  return this.throttle / 100;
};

Spaceship.prototype.create = function(callback) {
  callback();
};

Spaceship.prototype.remove = function(callback) {
  callback();
};

Spaceship.prototype.getViewBox = function() {
  var bounds = {};

  bounds.w = this.viewDistance;
  bounds.h = this.viewDistance;
  bounds.x = this.x - (this.viewDistance / 2);
  bounds.y = this.y - (this.viewDistance / 2);

  return bounds;
};

Spaceship.prototype.getDirection = function(target) {
  var angle, x, y;

  // Translate the target location as if the ship was the origin
  x = target.x - this.x;
  y = target.y - this.y;

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
  if (angle >= this.heading) {
    return angle - this.heading;
  } else {
    return 360 - this.heading + angle;
  }
};

exports.Spaceship = Spaceship;
