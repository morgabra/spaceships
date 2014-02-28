var util = require('util');
var uuid = require('node-uuid');


var SpaceObject = function(user, x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.id = uuid.v4();
  this.type = 'spaceobject';
  this.lastTicked = 0;
};

SpaceObject.prototype.getLocation = function() {
  return {
    x: this.x,
    y: this.y
  };
};

SpaceObject.prototype.setLocation = function(x, y) {
  this.x = x;
  this.y = y;
};

SpaceObject.prototype.getBounds = function() {
  var bounds = {};

  bounds.w = this.width;
  bounds.h = this.height;
  bounds.x = this.x - (this.width / 2);
  bounds.y = this.y - (this.height / 2);

  return bounds;
};

SpaceObject.prototype.tick = function(callback) {
  this.lastTicked = Date.now();
  callback();
};

SpaceObject.prototype.update = function(event) {
};

SpaceObject.prototype.getDistance = function(target) {
  return Math.sqrt(Math.pow(target.x - this.x, 2) + Math.pow(target.y - this.y, 2));
};

exports.SpaceObject = SpaceObject;
