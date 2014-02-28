var util = require('util');

var uuid = require('node-uuid');

var SpaceObject = require('./space_object').SpaceObject;

var Planet = function(x, y, radius) {
  this.log = [];
  this.type = 'planet';
  this.name = uuid.v4().split('-').join('').substr(0, 12);
  this.radius = radius;

  SpaceObject.call(this, x, y, radius * 2, radius * 2);
};
util.inherits(Planet, SpaceObject);

Planet.prototype.tick = function(callback) {
  callback();
};

Planet.prototype.update = fuction = function(event) {
};


Planet.prototype.create = function(callback) {
  callback();
};

Planet.prototype.remove = function(callback) {
  callback();
};

exports.Planet = Planet
