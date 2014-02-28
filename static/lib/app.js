var framerate;
var canvas;
var graphics;
var shipImage;
var tickData = {ships: null};// is updated by the socketio stuff below
var tickCounter = 0;


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

    // draw my ship
    // loop over other ships and draw them
    // cyan text
    if (tickData.ships === null) {
        return;
    }

    if (tickCounter % 30 == 0) {
        graphics.fillStyle = "rgba(0, 0, 0, 1.0)";
        graphics.clearRect(0, 0, canvas.width, canvas.height);
    }
    for (var i = 0; i < tickData.ships.length; i++) {
        drawShip(graphics, tickData.ships[i], shipImage, "rgba(0, 255, 255, 1.0)");
    }
}

function drawShip(graphics, shipObj, image, textRgba) {
    if (shipObj === null) {
        return;
    }
    var shipWidth = 64;
    var shipHeight = 64;

    graphics.save();
    graphics.translate(shipObj.x, shipObj.y);
    graphics.rotate(shipObj.heading * Math.PI/180);
    graphics.drawImage(image, -image.width/2, -image.width/2);
    graphics.restore();
    graphics.fillStyle = textRgba;
    graphics.fillText(shipObj.name, shipObj.x - 32, shipObj.y + 32);
}


function update() {
    // Do stuff to update the game
    tickCounter++;
    if (tickCounter > 10) {
        tickCounter = 0;
    }

    // HACK: translate the origin from top left to center
    if (tickData.ships === null) {
        return;
    }
}


$( document ).ready( function () {
    main();
    var socket = io.connect('http://spaceships.mirwin.net');

    socket.on('data', function (data) {
        // TODO(larsbutler): need to get a list of stuff here
        if (data.data == "Connected!") {
            // Cool, we're connected
            // But this isn't json
            return;
        }
        // We got ship data
        tickData.ships = JSON.parse(data.data);
        for (var i = 0; i < tickData.ships.length; i++) {
            var ship = tickData.ships[i];
            ship.x += 320;
            ship.y += 240;
        }


        // console.log($('#shipstatus'));
        // $('#shipstatus').html(data.data);
        socket.emit('data', { my: 'data' });
    });
});

