/*global require,__dirname,console*/
var con = require('connect');
var app = con.createServer(con.static(__dirname)).listen(8000);
var io = require('socket.io').listen(app, { log: false });
io.sockets.on('connection', function (socket) {
  "use strict";

  socket.on('query', function (data) {
    console.log('Request:', data);
    var id = data.id;
    require('http').get(
      'http://127.0.0.1:8080/' + data.instance + '/' + encodeURIComponent(data.text),
      function (response) {
        var data = { id: id, status: response.statusCode };
        if (data.status === 200) {
          response.on('data', function (chunk) { socket.emit('data', { id: id, chunk: chunk.toString() }); });
          response.on('end', function () { socket.emit('end', { id: id, status: data.status }); });
        } else {
          socket.emit('end', data);
        }
        console.log('Response:', data);
      }
    ).on('error', function (error) { console.log('Error:', error.message); });
  });
});
