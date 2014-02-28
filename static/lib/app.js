function main() {
    var framerate = new Framerate("framerate-monitor");
    var canvas = document.getElementById("gamecanvas");
    var graphics = canvas.getContext("2d");

    var gameLoop = function() {
        update();

        graphics.fillStyle = "rgba(0, 0, 0, 1.0)";
        graphics.clearRect(0, 0, canvas.width, canvas.height);
        graphics.fillStyle = "rgba(240, 150, 10, 1.0)";
        // graphics.fillRect(testData[0].x, 10, 8, 8);
        graphics.fillStyle = "rgba(0, 0, 150, 1.0)";
        // graphics.fillRect(testData[0].scanners[0].x, testData[0].scanners[0].y, 11, 11);
        // graphics.fillRect(testData[0].scanners[1].x, testData[0].scanners[1].y, 11, 11);
        framerate.snapshot();
        window.requestAnimationFrame(gameLoop);
    };

    window.requestAnimationFrame(gameLoop);

}


function update() {
    // Do stuff to update the game
}

// Data received here looks something like this:
/*
var testData = [
  {
    x: 12, // coord
    y: 123, // coord
    heading: 10, //degrees
    speed: 100, // units/second
    scanners: [
      // list of objects within view
      {
        x: 220,
        y: 111,
        name: 'zeries120',
        distance: 800, // units
        direction: 98, // degrees from 0 on the coord plane
        type: 'planet',
        size: 78 // area of bounding box
      },
      {
        x: 270,
        y: 87,
        name: 'jirwin',
        distance: 800, // units
        direction: 98, // degrees from 0 on the coord plane
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
*/

$( document ).ready( function () {
    main();
	var socket = io.connect('http://localhost');

	socket.on('data', function (data) {
  		console.log(data.data);
  		console.log($('#shipstatus'));
  		$('#shipstatus').html(data.data);
  		socket.emit('data', { my: 'data' });
	});
});

