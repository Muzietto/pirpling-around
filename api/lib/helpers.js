var crypto = require('crypto');
var config = require('../config');

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

module.exports = helpers;
