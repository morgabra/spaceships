var EventEmitter = require('events').EventEmitter;
var util = require('util');

var async = require('async');

var RTree = require('rtree');


var Cosmos = function() {
  this.cosmos = new RTree();
  this.objects = {};
};
util.inherits(Cosmos, EventEmitter);

Cosmos.prototype.insert = function(spaceObj, callback) {
  self.objects[spaceObj.id] = spaceObj;
  self.cosmos.insert(spaceObj.getBounds(), spaceObj);

  self.emit('insert', spaceObj, Object.keys(spaceObj).length);
  callback();
};

Cosmos.prototype.tick = function(callback) {
  var self = this;

  async.eachLimit(Object.keys(this.objects), 500, function(spaceObj, callback) {
    spaceObj.update(callback);
  }, function(err) {
    if (err) {
      self.emit('error', err);
      callback();
      return;
    }

    self.emit('tick');
    callback();
  });
};

Cosmos.prototype.search = function(x, y, width, height, callback) {
  return this.cosmos.search({x: x, y: y, w: width, h: height});
};

Cosmos.prototype.remove = function(spaceObj, callback) {
  self.cosmos.remove(spaceObj.getBounds(), spaceObj);
  delete self.objects[spaceObj.id];
  self.emit('remove', spaceObj);
  callback();
};

Cosmos.prototype.update = function(spaceObj, callback) {
  var self = this;

  async.series([
    self.remove.bind(self, spaceObj),
    self.insert.bind(self, spaceObj)
  ], callback);
};

exports.Cosmos = Cosmos;
