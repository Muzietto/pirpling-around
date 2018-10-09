
var http = require('http');
var url = require('url');

var server = http.createServer(function(req, res) {

  var parsedUrl = url.parse(req.url, true);
  var path = parsedUrl.pathname; // /pippo/gino//
  var trimmedPath = path.replace(/^\/+|\/+$/g, ''); // pippo/gino

  res.end('Hello, World!\n');

  console.log('Request received on /' + trimmedPath);
});

server.listen(3000, function() {
  console.log('Server listening on 3000');
});
