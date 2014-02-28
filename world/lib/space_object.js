var util = require('util');
var uuid = require('node-uuid');


var SpaceObject = function(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.id = uuid.v4();
};

SpaceObject.prototype.getLocation = function() {
  return {
    x: this.x,
    y: this.y
  };
};

SpaceObject.prototype.getBounds = function() {
  var bounds = {};

  bounds.w = this.width;
  bounds.h = this.height;
  bounds.x = this.x - (this.width / 2);
  bounds.y = this.y - (this.height / 2);

  return bounds;
};


exports.SpaceObject = SpaceObject;
