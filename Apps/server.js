/*global require,__dirname*/
var con = require('connect');
var app = con.createServer(con.static(__dirname)).listen(8000);
var io = require('socket.io').listen(app, { log: false });
io.sockets.on('connection', function (socket) {
  socket.emit('connect', { hello: 'world' });
  socket.on('query', function (data) {
    console.log(data);
    require('http').get(
      'http://127.0.0.1:8080/db/' + encodeURIComponent(data.text),
      function (response) {
        if (response.statusCode == 200) {
          response.on('data', function (chunk) { socket.emit('data', { chunk: chunk.toString() }); });
          response.on('end', function () { socket.emit('end'); });
        }
        console.log('status:', response.statusCode);
      }
    );
  });
});
