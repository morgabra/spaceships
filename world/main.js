var Cosmos = require('./lib/cosmos').Cosmos;
var SpaceObject = require('./lib/space_object').SpaceObject;

c = new Cosmos();

s = new SpaceObject(500, -132.231, 10, 10);
t = new SpaceObject(109453.23910, -132.231, 10, 100);
v = new SpaceObject(3423.52094, -123.421, 10, 99);

c.insert(s);
c.insert(t);
c.insert(v);

console.dir(c.cosmos.search({x: 200, y: -200, w: 400, h: 800}));
