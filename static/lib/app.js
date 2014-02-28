var framerate;
var canvas;
var graphics;
var shipImage;
var tickData = {ship: null};// is updated by the socketio stuff below

// Data received here looks something like this:
var testData = [
  {
    name: 'larsbutler',
    x: 50, // coord
    y: 123, // coord
    heading: 15, //degrees
    speed: 100, // units/second
    scanners: [
      // list of objects within view
      {
        x: 220,
        y: 111,
        name: 'zeries120',
        distance: 800, // units
        heading: 98, // degrees from 0 on the coord plane
        type: 'planet',
        size: 78 // area of bounding box
      },
      {
        x: 270,
        y: 87,
        name: 'jirwin',
        distance: 800, // units
        heading: 98, // degrees from 0 on the coord plane
        type: 'ship',
        shield: 65, // percentage of shield charge,
        health: 100, // hit points
        size: 1 // area of bounding box
      }
    ],
    sensors: {
      engineTemperature: 900, // unbounded int
      power: 80, // 0-100
      shield: 99, // 0-100
      throttle: 29, // 0-100
    },
    log: [
      {
        'type': 'combat',
        'message': 'You were hit for 6 damage',
        'timestamp': 213908210823 // timestamp in milliseconds
      },
      {
        'type': 'combat',
        'message': 'You were hit for 6 damage',
        'timestamp': 213908210823 // timestamp in milliseconds
      }
    ]
  }
];

var me = testData[0];

function main() {
    framerate = new Framerate("framerate-monitor");
    canvas = document.getElementById("gamecanvas");
    graphics = canvas.getContext("2d");

    shipImage = new Image();
    shipImage.src = "media/ObjectSpaceship.png";

    var gameLoop = function() {
        // Time?
        update();
        render(graphics);
        framerate.snapshot();
        window.requestAnimationFrame(gameLoop);
    };

    window.requestAnimationFrame(gameLoop);

}

function render(graphics) {
    // Clear
    graphics.fillStyle = "rgba(0, 0, 0, 1.0)";
    graphics.clearRect(0, 0, canvas.width, canvas.height);

    // draw my ship
    // loop over other ships and draw them
    // cyan text
    drawShip(graphics, tickData.ship, shipImage, "rgba(0, 255, 255, 1.0)");
    /*
    for (var i = 0; i < me.scanners.length; i++) {
        var eachShip = me.scanners[i];
        // white text
        drawShip(graphics, eachShip, shipImage, "rgba(255, 255, 255, 1.0)");
    }
    */
}

function drawShip(graphics, shipObj, image, textRgba) {
    if (shipObj === null) {
        return;
    }
    var shipWidth = 64;
    var shipHeight = 64;

    graphics.save();
    // graphics.translate(canvas.width/2, canvas.height/2);
    graphics.translate(shipObj.x, shipObj.y);
    graphics.rotate(shipObj.heading * Math.PI/180);
    graphics.drawImage(image, -image.width/2, -image.width/2);
    graphics.restore();
    graphics.fillStyle = textRgba;
    graphics.fillText(shipObj.name, shipObj.x - 32, shipObj.y + 32);
}


function update() {
    // Do stuff to update the game
}


$( document ).ready( function () {
    main();
    var socket = io.connect('http://localhost');

    socket.on('data', function (data) {
        // TODO(larsbutler): need to get a list of stuff here
        console.log(data.data);
        if (data.data == "Connected!") {
            // Cool, we're connected
            // But this isn't json
            return;
        }
        // We got ship data
        tickData.ship = JSON.parse(data.data);

        // console.log($('#shipstatus'));
        $('#shipstatus').html(data.data);
        socket.emit('data', { my: 'data' });
    });
});

