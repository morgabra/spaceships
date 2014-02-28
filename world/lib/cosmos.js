var EventEmitter = require('events').EventEmitter;
var util = require('util');

var async = require('async');
var redis = require('redis');
var RTree = require('rtree');

var config = require('../../local_settings');
var Spaceship = require('./spaceship').Spaceship;
var Planet = require('./planet').Planet;


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
    x: Math.random() * 320 - 320,
    y: Math.random() * 240 - 240
  };
};

Cosmos.prototype.createPlanet = function(callback) {
  var self = this,
      location = this.getRandomLocation(),
      radius = Math.random() * 25 + 1,
      planet;

  planet = new Planet(location.x, location.y, radius);
  self.insert(planet, function() {
    self.emit('created-planet', planet);
    callback();
  });
};

Cosmos.prototype.redisEvent = function(pattern, channel, message) {
  var self = this,
      chanInfo = channel.split(':'),
      eventType = chanInfo[chanInfo.length - 1],
      user = chanInfo[1];

  if (eventType === 'created') {
    self.createShip(user, function() {
      console.log('Created ship for', user);
    });
  } else if (eventType === 'result') {
    self.ships[user].update(message);
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

  async.eachLimit(Object.keys(this.objects), 500, function(spaceObjKey, callback) {
    var spaceObj = self.objects[spaceObjKey];

    async.series([
      // Tick each space object
      function tickSpaceObj(callback) {
        spaceObj.tick(callback)
      },

      // Update world location of each space object
      function updateSpaceObjInCosmos(callback) {
        if (spaceObj.type === 'spaceship') {
          self.updateObjectLocation(spaceObj, callback);
        } else {
          callback();
        }
      }
    ], function(err) {
      var chan,
          box;

      if (err) {
        self.emit('error', err);
        callback();
        return;
      }

      self.lastTicked = Date.now();

      if (spaceObj.type === 'spaceship') {
        chan = ['api', spaceObj.name, 'tick'].join(':');
        box = spaceObj.getViewBox();
        self.redisPubClient.publish(
          chan,
          JSON.stringify(self.search(box.x, box.y, box.w, box.h))
        );
      }

      self.emit('tick', self.lastTicked);
      callback();
    });
  }, function() {
    console.log('Finished ticking.', Date.now());
    callback();
  });
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


  async.series([
    self.remove.bind(self, spaceObj),
    self.insert.bind(self, spaceObj)
  ], callback);
};

exports.Cosmos = Cosmos;
