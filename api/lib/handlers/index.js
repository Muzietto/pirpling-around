// request handlers
var _data = require('../data');
var helpers = require('../helpers');
var _usersHandlers = require('./users');
var _tokensHandlers = require('./tokens');

var handlers = {};

handlers.ping = (data, cb) => {
  cb(200);
};

handlers.sample = (data, cb) => {
  cb(406, {name: 'sample handler'});
};

handlers.notFound = (data, cb) => {
  cb(404);
};

handlers.users = (data, callback) => {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];

  if (acceptableMethods.indexOf(data.method) > -1) {

    _usersHandlers[data.method](data, callback);

  } else {
    callback(405); // Method Not Allowed
  }
};

handlers.tokens = (data, callback) => {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];

  if (acceptableMethods.indexOf(data.method) > -1) {

    _tokensHandlers[data.method](data, callback);

  } else {
    callback(405); // Method Not Allowed
  }
};

module.exports = handlers;
