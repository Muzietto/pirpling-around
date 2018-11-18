var users = require('./users');
var fs = require('fs');
var assert = require('assert');
var path = require('path');
var dataHandlers = require('../data');
var tokens = require('./tokens');
var helpers = require('../helpers');

var tests = {};
var xtests = {};

var userPhone = Date.now() + '';
var tokensDir = path.join(__dirname, '/../../.data/tokens');
var usersDir = path.join(__dirname, '/../../.data/users');
var userPassword = `test ${userPhone}`;
var userTokenId;
var userTokenExpires;

tests['users should be a callback-based interface'] = done => {
  assert.equal(users.interfaceType(), 'callback');
  done();
};

tests['users.post should create a user'] = done => {
  var data = {
    payload: {
      firstName: 'firstName',
      lastName: 'lastName',
      phone: userPhone,
      password: userPassword,
      tosAgreement: true,
    }
  };

  users.post(data, (returnCode, error) => {
    assert.equal(returnCode, 200);

    var userFilename = `${userPhone}.json`;
    var foundUsers = fs.readdirSync(usersDir);
    assert.equal(foundUsers.includes(userFilename), true);

    dataHandlers.read('users', userPhone, (returnCode, data) => {

      assert.equal(returnCode, false);
      assert.equal(data.firstName, 'firstName');
      assert.equal(data.lastName, 'lastName');
      assert.equal(data.phone, userPhone);
      assert.equal(data.tosAgreement, true);
      assert.equal(data.hashedPassword, helpers.hash(userPassword));
      done();
    });
  });
};

tests['users.get should read a user, provided it gives the right token'] = done => {
  // create a user token to begin with
  var data = {
    payload: {
      phone: userPhone,
      password: userPassword,
    }
  };

  tokens.post(data, (returnCode, tokenObject) => {
    userTokenId = tokenObject.id;
    userTokenExpires = tokenObject.expires;

    var getData = {
      queryStringObject: {
        phone: userPhone,
      },
      headers: {
        token: userTokenId,
      },
    };

    users.get(getData, (returnCode, data) => {
      assert.equal(returnCode, 200);
      assert.equal(data.firstName, 'firstName');
      assert.equal(data.lastName, 'lastName');
      assert.equal(data.phone, userPhone);
      assert.equal(data.tosAgreement, true);
      done();
    });
  });
};

tests['users.get shouldn\'t read a user, if the token is wrong'] = done => {
  var getData = {
    queryStringObject: {
      phone: userPhone,
    },
    headers: {
      token: 'wrongTokenId',
    },
  };

  users.get(getData, (returnCode, data) => {
    assert.equal(returnCode, 403);
    assert.equal(data.error, 'missing token in header or invalid token');
    done();
  });
};

tests['users.get shouldn\'t read a user, if the token is missing'] = done => {
  var getData = {
    queryStringObject: {
      phone: userPhone,
    },
    headers: {
    },
  };

  users.get(getData, (returnCode, data) => {
    assert.equal(returnCode, 403);
    assert.equal(data.error, 'missing token in header or invalid token');
    done();
  });
};

tests['users.put should update a user, provided it encloses the right token'] = done => {
  var data = {
    payload: {
      phone: userPhone,
      firstName: 'firstName2',
      lastName: 'lastName2',
      password: 'new_' + userPassword,
    },
    headers: {
      token: userTokenId,
    },
  };

  users.put(data, returnCode => {
    assert.equal(returnCode, 200);
    var getData = {
      queryStringObject: {
        phone: userPhone,
      },
      headers: {
        token: userTokenId,
      },
    };

    users.get(getData, (_, data) => {
      assert.equal(data.firstName, 'firstName2');
      assert.equal(data.lastName, 'lastName2');
      done();
    });
  });
};

tests['users.delete should delete a user and, in the future, all his tokens'] = done => {
  var data = {
    payload: {
      phone: userPhone,
    },
    headers: {
      token: userTokenId,
    },
  };
  var previousUsers = fs.readdirSync(usersDir);

  users.delete(data, returnCode => {
    assert.equal(returnCode, 200);
    var currentUsers = fs.readdirSync(usersDir);
    assert.equal(currentUsers.length, previousUsers.length - 1);
    // TODO - check user tokens are gone
    done();
  });
};

module.exports = tests;
