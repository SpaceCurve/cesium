/*global require,__dirname*/
var con = require('connect');
var app = con.createServer(con.static(__dirname)).listen(8000);
var io = require('socket.io').listen(app, { log: false });
io.sockets.on('connection', function (socket) {
  socket.on('query', function (data) {
    console.log('Request:', data);
    require('http').get(
      'http://127.0.0.1:8080/' + data.instance + '/' + encodeURIComponent(data.text),
      function (response) {
        var data = { status: response.statusCode };
        if (data.status == 200) {
          response.on('data', function (chunk) { socket.emit('data', { chunk: chunk.toString() }); });
          response.on('end', function () { socket.emit('end', data); });
        } else {
          socket.emit('end', data); 
        }
        console.log('Response:', data);
      }
    ).on('error', function (error) { console.log('Error:', error.message); });
  });
});
