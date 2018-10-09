
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
    
    var chosenHandler = router[trimmedPath] || handlers.notFound;

    var data = {
      trimmedPath,
      method,
      headers,
      payload: buffer,
    };

    chosenHandler(data, (statusCode, payload) => {
      
      statusCode = (typeof statusCode === 'number') ? statusCode : 200;
      payload = (typeof payload === 'object') ? payload : {};

      var payloadString = JSON.stringify(payload);

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      
  
      console.log(`>>>>> Request received on /${trimmedPath} using method ${method} and qs ${JSON.stringify(qs)} and headers ${JSON.stringify(headers)} and payload ${buffer}`);
      console.log(`<<<<< Sending back code ${statusCode} and payload ${payloadString}`);

    });

    
  });

});

server.listen(3000, function() {
  console.log('Server listening on 3000');
});

var handlers = {};

handlers.sample = (data, cb) => {
  cb(406, {name: 'sample handler'});
};

handlers.notFound = (data, cb) => {
  cb(404);
};


var router = {
  'sample': handlers.sample,
};

