var EventEmitter = require('events').EventEmitter;
var util = require('util');

var async = require('async');
var redis = require('redis');
var RTree = require('rtree');

var config = require(__dirname + '/../../local_settings').config;
var Spaceship = require('./spaceship').Spaceship;



var Cosmos = function() {
  this.cosmos = new RTree();
  this.objects = {};
  this.ships = {};
  this.lastTicked = 0;
  this.redisClient = redis.createClient(conf.redis.port, conf.redis.host);

  this.redisClient.on('pmessage', self.redisEvent.bind(self));
  this.redisClient.psubscribe(config.redis.prefix + 'api:*:*');

  EventEmitter.call(this);
};
util.inherits(Cosmos, EventEmitter);

Cosmos.prototype.getRandomLocation = function() {
  return {
    x: Math.random() * 20000 - 10000,
    y: Math.random() * 20000 - 10000
  };
};

Cosmos.prototype.redisEvent = function(pattern, channel, message) {
  var self = this,
      chanInfo = channel.split(':'),
      eventType = chanInfo[chanInfo.length - 1],
      user = chanInfo[2];

  if (eventType === 'created') {
    self.createShip(user);
  } else if (eventType === 'update') {
    self.ships[user].update(message);
  }
};

Cosmos.prototype.createShip = function(user) {
  var location = self.getRandomLocation(),
      ship;

  ship = new Spaceship(user, location.x, location.y, 1, 1);
  this.ships[user] = ship;
  self.insert(ship, function() {
    self.emit('created-ship', ship);
  });
};

Cosmos.prototype.insert = function(spaceObj, callback) {
  var self = this;

  spaceObj.create(function(err) {
    if (err) {
      self.emit('error', err);
      callback(err);
      return;
    };

    self.objects[spaceObj.id] = spaceObj;
    self.cosmos.insert(spaceObj.getBounds(), spaceObj);

    self.emit('insert', spaceObj, Object.keys(spaceObj).length);
    callback();
  });
};

Cosmos.prototype.tick = function(callback) {
  var self = this;

  async.eachLimit(Object.keys(this.objects), 500, function(spaceObj, callback) {
    async.series([
      // Tick each space object
      function tickSpaceObj(callback) {
        spaceObj.tick(callback)
      },

      // Update world location of each space object
      function updateSpaceObjInCosmos(callback) {
        self.update(spaceObj, callback);
      }
    ], function(err) {
    if (err) {
      self.emit('error', err);
      callback();
      return;
    }

    self.lastTicked = Date.now();

    self.emit('tick', self.lastTicked);
    callback();
  });
};

Cosmos.prototype.search = function(x, y, width, height, callback) {
  return this.cosmos.search({x: x, y: y, w: width, h: height});
};

Cosmos.prototype.remove = function(spaceObj, callback) {
  spaceObj.remove(function(err) {
    self.cosmos.remove(spaceObj.getBounds(), spaceObj);
    delete self.objects[spaceObj.id];
    self.emit('remove', spaceObj);
    callback();
  });
};

Cosmos.prototype.update = function(spaceObj, callback) {
  var self = this;

  async.series([
    self.remove.bind(self, spaceObj),
    self.insert.bind(self, spaceObj)
  ], callback);
};

exports.Cosmos = Cosmos;
