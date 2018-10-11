var crypto = require('crypto');
var config = require('./config');

var helpers = {};

helpers.hash = str => {
  if (typeof str === 'string' && str.length > 0) {

    var hash = crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');

    return hash;

  } else {
    return false;
  }
};

helpers.parseJsonToObject = str => {
  var result;
  try {
    result = JSON.parse(str);
  } catch(err) {
    console.log(`Helpers - Error parsing JSON: ${err}`)
    result = {};
  }
  return result;
};

helpers.createRandomString = size => {
  size = (typeof size == 'number' && size > 0) ? size : false;

  if (size) {
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    var str = '';

    for (i=1; i<size; i++) {
      str += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
    }
    console.log(`random string is ${str}`);
    return str;
  } else {
    return false;
  }
};

module.exports = helpers;
