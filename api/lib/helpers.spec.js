var helpers = require('./helpers');
var assert = require('assert');
var tests = {};

tests['should return 1'] = done => {
  assert.equal(helpers.gimmeOne(), 1);
  done();
};

tests['should return 2'] = done => {
  assert.equal(helpers.gimmeOne(), 2);
  done();
};

module.exports = tests;
