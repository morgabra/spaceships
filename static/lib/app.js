var framerate;
var canvas;
var graphics;
var shipImage;
var planetImage;
var tickData = null;
var tickDataBuffer = null;
var tickCounter = 0;


function main() {
    framerate = new Framerate("framerate-monitor");
    canvas = document.getElementById("gamecanvas");
    graphics = canvas.getContext("2d");

    shipImage = new Image();
    shipImage.src = "media/ObjectSpaceship.png";
    planetImage = new Image();
    planetImage.src = "media/planet.png";

    var gameLoop = function() {
        update();
        render(graphics);
        framerate.snapshot();
        window.requestAnimationFrame(gameLoop);
    };

    window.requestAnimationFrame(gameLoop);

}

function render(graphics) {
    if (tickDataBuffer === null) {
        return;
    }

    if (tickCounter % 30 == 0) {
        graphics.fillStyle = "rgba(0, 0, 0, 1.0)";
        graphics.clearRect(0, 0, canvas.width, canvas.height);
    }
    // swap buffer
    tickData = tickDataBuffer;
    for (var i = 0; i < tickData.stuff.length; i++) {
        drawSpaceObject(graphics, tickData.stuff[i], "rgba(0, 255, 255, 1.0)");
    }
}

function drawSpaceObject(graphics, obj, textRgba) {
    if (obj === null) {
        return;
    }
    var image;
    if (obj.type == "spaceship") {
        image = shipImage;
    }
    else if (obj.type == "planet") {
        image = planetImage;
    }
    var shipWidth = 64;
    var shipHeight = 64;

    graphics.save();
    graphics.translate(obj.x, obj.y);
    graphics.rotate(obj.heading * Math.PI/180);
    graphics.drawImage(image, -image.width/2, -image.width/2);
    graphics.restore();
    graphics.fillStyle = textRgba;
    graphics.fillText(obj.name, obj.x - 32, obj.y + 32);
}


function update() {
    // Do stuff to update the game
    tickCounter++;
    if (tickCounter > 10) {
        tickCounter = 0;
    }
}


$( document ).ready( function () {
    main();
    var socket = io.connect('http://localhost');

    socket.on('data', function (data) {
        // TODO(larsbutler): need to get a list of stuff here
        if (data.data == "Connected!") {
            // Cool, we're connected
            // But this isn't json
            return;
        }
        // We got ship data
        tickDataBuffer = {stuff: JSON.parse(data.data)};
        // translate coords
        for (var i = 0; i < tickDataBuffer.stuff.length; i++) {
            var obj = tickDataBuffer.stuff[i];
            obj.x += 320;
            obj.y += 240;
        }


        // console.log($('#shipstatus'));
        // $('#shipstatus').html(data.data);
        socket.emit('data', { my: 'data' });
    });
});

