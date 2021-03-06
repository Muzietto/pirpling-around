
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var fs = require('fs');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');

var httpServer = http.createServer(function(req, res) {
  unifiedServer('HTTP')(req, res);
});

httpServer.listen(config.httpPort, function() {
  console.log(`${config.envName} - HTTP server listening on ${config.httpPort}`);
});

var httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem'),
};

var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
  unifiedServer('HTTPS')(req, res);
});

httpsServer.listen(config.httpsPort, function() {
  console.log(`${config.envName} - HTTPS server listening on ${config.httpsPort}`);
});

var unifiedServer = protocol => (req, res) => {

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

    console.log(`>>>>> ${protocol} ${method} received on /${trimmedPath} with qs ${JSON.stringify(qs)} and headers ${JSON.stringify(headers)} and payload ${buffer}`);

    var chosenHandler = [trimmedPath] || handlers.notFound;

    var data = {
      trimmedPath,
      method,
      headers,
      queryStringObject: qs,
      payload: helpers.parseJsonToObject(buffer),
    };

    handlerInterfaces()[chosenHandler.interfaceType()](chosenHandler, data);
  });
}

var router = {
  ping: handlers.ping,
  sample: handlers.sample,
  users: handlers.users,
  tokens: handlers.tokens,
};

function handlerInterfaces() {
  return {
    callback: (handler, data) => {
      handler(data, (statusCode, payload) => {

          statusCode = (typeof statusCode === 'number') ? statusCode : 200;
          payload = (typeof payload === 'object') ? payload : {};

          var payloadString = JSON.stringify(payload);

          res.setHeader('Content-Type', 'application/json');
          res.writeHead(statusCode);
          res.end(payloadString);

          console.log(`CALLBACK: <<<<< ${protocol} ${method} on /${trimmedPath}: sending back code ${statusCode} and payload ${payloadString}\n`);
      });
    },
    promise: (handler, data) => {
      handler(data)
        .then(({statusCode, payload}) => {

            statusCode = (typeof statusCode === 'number') ? statusCode : 200;
            payload = (typeof payload === 'object') ? payload : {};

            var payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log(`PROMISE: <<<<< ${protocol} ${method} on /${trimmedPath}: sending back code ${statusCode} and payload ${payloadString}\n`);
        });
    },
  };
}
