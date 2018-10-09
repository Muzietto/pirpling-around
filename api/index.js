
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

var server = http.createServer(function(req, res) {

  var parsedUrl = url.parse(req.url, true);

  var path = parsedUrl.pathname; // /pippo/gino//
  var trimmedPath = path.replace(/^\/+|\/+$/g, ''); // pippo/gino

  var qs = parsedUrl.query;

  var headers = req.headers;

  var method = req.method.toLowerCase();

  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', data => { buffer += decoder.write(data)});
  req.on('end', data => { 
    
    buffer += decoder.end()
    
    res.end('Hello, World!\n');
  
    console.log(`>>>>> Request received on /${trimmedPath} using method ${method} and qs ${JSON.stringify(qs)} and headers ${JSON.stringify(headers)} and payload ${buffer}`);
    
  });

});

server.listen(3000, function() {
  console.log('Server listening on 3000');
});
