var users = require('./users');
var fs = require('fs');
var assert = require('assert');
var path = require('path');
var dataHandlers = require('../data');
var helpers = require('../helpers');

var tests = {};
var xtests = {};

var phone = Date.now() + '';
var baseDir = path.join(__dirname, '/../../.data/users');

tests['users should be a callback-based interface'] = done => {
  assert.equal(users.interfaceType(), 'callback');
  done();
};

tests['users.post should create a user'] = done => {
  var password = `test ${phone}`;
  var data = {
    payload: {
      firstName: 'firstName',
      lastName: 'lastName',
      phone,
      password,
      tosAgreement: true,
    }
  };

  users.post(data, (returnCode, error) => {
    assert.equal(returnCode, 200);

    var userFilename = `${phone}.json`;
    var foundUsers = fs.readdirSync(baseDir);
    assert.equal(foundUsers.includes(userFilename), true);

    dataHandlers.read('users', phone, (returnCode, data) => {

      assert.equal(returnCode, false);
      assert.equal(data.firstName, 'firstName');
      assert.equal(data.lastName, 'lastName');
      assert.equal(data.phone, phone);
      assert.equal(data.tosAgreement, true);
      assert.equal(data.hashedPassword, helpers.hash(password));
      done();
    });
  });
};

xtests['users.get should read a user'] = done => {
  var password = `test ${phone}`;
  var data = {
    queryStringObject: {
      phone,
    }
  };

  data.read('test', filename, (_, data) => {
    assert.equal(JSON.stringify(data), jsonContent);
    done();
  });
};

xtests['datasource should update a file'] = done => {
  var text = `test ${filename} test`;
  var jsonContent = JSON.stringify({ text });

  data.update('test', filename, { text }, _ => {
    var foundContent = fs.readFileSync(`${baseDir}/${filename}.json`);
    assert.equal(foundContent, jsonContent);
    done();
  });
};

xtests['datasource should delete a file'] = done => {
  data.delete('test', filename, outcome => {
    assert.equal(outcome, false);
    var foundFiles = fs.readdirSync(baseDir);
    assert.equal(foundFiles.length, 0);
    done();
  });
};

module.exports = tests;
