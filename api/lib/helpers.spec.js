var helpers = require('./helpers');
var assert = require('assert');
var tests = {};

tests['parseJsonToObject should work'] = done => {
  var input = JSON.stringify({qwe: 12});
  var output = helpers.parseJsonToObject(input)

  assert.equal(output.qwe, 12);
  done();
};

tests['createRandomString should accept numeric sizes'] = done => {
  var size = 6;
  var rndString = helpers.createRandomString(size);

  assert.equal(rndString.length, size - 1);
  var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  rndString.split('').forEach(char => {
    assert.equal(possibleCharacters.includes(char), true);
  });

  done();
};

tests['createRandomString should refuse falsy sizes'] = done => {
  assert.equal(helpers.createRandomString(0), false);
  assert.equal(helpers.createRandomString(null), false);
  assert.equal(helpers.createRandomString(), false);
  done();
};

tests['validatedS should accept non-null strings'] = done => {
  assert.equal(helpers.validatedS(0), false);
  assert.equal(helpers.validatedS(null), false);
  assert.equal(helpers.validatedS(), false);
  assert.equal(helpers.validatedS(''), false);
  assert.equal(helpers.validatedS('123'), '123');
  assert.equal(helpers.validatedS(' 123  '), '123');
  done();
};

tests['validatedB should accept only booleans'] = done => {
  assert.equal(helpers.validatedB(123), false);
  assert.equal(helpers.validatedB('true'), false);
  assert.equal(helpers.validatedB(null), false);
  assert.equal(helpers.validatedB(), false);
  assert.equal(helpers.validatedB(true), true);
  assert.equal(helpers.validatedB(false), false);
  done();
};

module.exports = tests;
