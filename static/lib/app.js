
$( document ).ready( function () {
	var socket = io.connect('http://localhost');

	socket.on('data', function (data) {
  		console.log(data.data);
  		console.log($('#shipstatus'));
  		$('#shipstatus').html(data.data);
  		socket.emit('data', { my: 'data' });
	});
});

