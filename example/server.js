/*global require,__dirname*/
var port = 8000;
var db = '127.0.0.1:8080'
if(process.argv.length >= 3) {
  port = process.argv[2];

  if(process.argv.length >= 4) {
    db = process.argv[3];
  }
}
var http = require('http');
var con = require('connect');
var app = con.createServer(con.static(__dirname)).listen(port, undefined, undefined, function() { if(process.getuid && process.getuid() == 0) { process.setuid('nobody'); } });
var io = require('binaryjs').BinaryServer({server: app});
io.on('connection', function (client) {
  client.on('stream', function (stream) {
    stream.on('data', function (data) {
      console.log('Request:', data);
      var start = Date.now();
      http.get(
        'http://' + db + '/' + data.instance + '/' + encodeURIComponent(data.text),
        function (response) {
          console.log('Response code:', response.statusCode);
          if(response.statusCode == 200) {
            response.pipe(stream);
          } else {
            var accum = [];
            response.on('data', function(block) {
              accum.push(block);
            });
            response.on('end', function() {
              var msg = "<failed to decode>"
              try {
                msg = Buffer.concat(accum).toString();
              } finally {
                stream.write({ error : "returned from database", message : msg });
                stream.end();
              }
            });
          }
          response.on('end', function() { console.log('Response complete:', Date.now() - start, 'ms'); });
        }
      ).on('error', function (error) {
        stream.write({error : "establishing connection", message : error.message});
        stream.end();
        console.log('Error:', error.message);
      });
    });
  });
});
