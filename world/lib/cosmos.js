var EventEmitter = require('events').EventEmitter;
var util = require('util');

var async = require('async');
var redis = require('redis');
var RTree = require('rtree');

var config = require('../../local_settings');
var Spaceship = require('./spaceship').Spaceship;



var Cosmos = function() {
  this.cosmos = new RTree();
  this.objects = {};
  this.ships = {};
  this.lastTicked = 0;

  this.redisClient = redis.createClient(config.redis.port, config.redis.host);
  this.redisPubClient = redis.createClient(config.redis.port, config.redis.host);

  this.redisClient.on('pmessage', this.redisEvent.bind(this));
  this.redisClient.psubscribe('api:*:*');

  EventEmitter.call(this);
};
util.inherits(Cosmos, EventEmitter);

Cosmos.prototype.getRandomLocation = function() {
  return {
    x: Math.random() * 600 - 300,
    y: Math.random() * 600 - 300
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
  } else {
    console.log(message);
  }
};

Cosmos.prototype.createShip = function(user, callback) {
  var self = this,
      location = this.getRandomLocation(),
      ship;

  ship = new Spaceship(user, location.x, location.y, 1, 1);
  this.ships[user] = ship;
  self.insert(ship, function() {
    self.emit('created-ship', ship);
    callback();
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

  console.log('TICK IN COSMOS');

  async.eachLimit(Object.keys(this.objects), 500, function(spaceObjKey, callback) {
    var spaceObj = self.objects[spaceObjKey];

    async.series([
      // Tick each space object
      function tickSpaceObj(callback) {
        spaceObj.tick(callback)
      },

      // Update world location of each space object
      function updateSpaceObjInCosmos(callback) {
        self.updateObjectLocation(spaceObj, callback);
      }
    ], function(err) {
      var chan;

      if (err) {
        self.emit('error', err);
        callback();
        return;
      }

      console.log('Finished tick');

      self.lastTicked = Date.now();

      chan = ['tick', spaceObj.name].join(':');
      self.redisPubClient.publish(chan, JSON.stringify(spaceObj));

      self.emit('tick', self.lastTicked);
      callback();
    });
  }, callback);
};

Cosmos.prototype.search = function(x, y, width, height) {
  return this.cosmos.search({x: x, y: y, w: width, h: height});
};

Cosmos.prototype.remove = function(spaceObj, callback) {
  var self = this;

  spaceObj.remove(function(err) {
    self.cosmos.remove(spaceObj.getBounds(), spaceObj);
    delete self.objects[spaceObj.id];
    self.emit('remove', spaceObj);
    callback();
  });
};

Cosmos.prototype.updateObjectLocation = function(spaceObj, callback) {
  var self = this;

  console.log('UPDATING LOCATION', spaceObj.name);

  async.series([
    self.remove.bind(self, spaceObj),
    self.insert.bind(self, spaceObj)
  ], callback);
};

exports.Cosmos = Cosmos;
