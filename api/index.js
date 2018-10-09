
var http = require('http');
var url = require('url');

var server = http.createServer(function(req, res) {

  var parsedUrl = url.parse(req.url, true);

  var path = parsedUrl.pathname; // /pippo/gino//
  var trimmedPath = path.replace(/^\/+|\/+$/g, ''); // pippo/gino

  var qs = parsedUrl.query;

  var method = req.method.toLowerCase();

  res.end('Hello, World!\n');

  console.log(`Request received on /${trimmedPath} using method ${method} and qs ${JSON.stringify(qs)}`);
});

server.listen(3000, function() {
  console.log('Server listening on 3000');
});
