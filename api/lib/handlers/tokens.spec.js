var tokens = require('./tokens');
var users = require('./users');
var fs = require('fs');
var assert = require('assert');
var path = require('path');

var tests = {};
var xtests = {};

var userPhone = Date.now() + '';
var tokensDir = path.join(__dirname, '/../../.data/tokens');
var usersDir = path.join(__dirname, '/../../.data/users');
var existingTokens = fs.readdirSync(tokensDir);
var userTokenId;
var userTokenExpires;

tests['tokens should be a callback-based interface'] = done => {
  assert.equal(tokens.interfaceType(), 'callback');
  done();
};

tests['tokens.post should create a token'] = done => {
  // create a user to begin with
  var userPassword = `test ${userPhone}`;
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

    // get about tokens...
    var data = {
      payload: {
        phone: userPhone,
        password: userPassword,
      }
    };

    tokens.post(data, (returnCode, tokenObject) => {
      assert.equal(returnCode, 200);

      var foundTokens = fs.readdirSync(tokensDir);
      assert.equal(foundTokens.length > existingTokens.length, true);
      assert.equal(tokenObject.phone, userPhone);
      assert.equal(!!tokenObject.id, true);
      assert.equal(!!tokenObject.expires, true);

      userTokenId = tokenObject.id;
      userTokenExpires = tokenObject.expires;
      done();
    });
  });
};

tests['tokens.get should read a token'] = done => {
  var data = {
    queryStringObject: {
      id: userTokenId,
    }
  };

  tokens.get(data, (returnCode, tokenObject) => {
    assert.equal(returnCode, 200);
    assert.equal(tokenObject.phone, userPhone);
    assert.equal(tokenObject.id, userTokenId);
    assert.equal(tokenObject.expires, userTokenExpires);
    done();
  });
};

tests['tokens.verifyToken should verify a token'] = done => {
  tokens.verifyToken(userTokenId, userPhone, returnValue => {
    assert.equal(returnValue, true);
    done();
  });
};

tests['tokens.put should increase the expiration time of a token'] = done => {
  var data = {
    payload: {
      id: userTokenId,
      extend: true,
    }
  };

  tokens.put(data, returnCode => {
    assert.equal(returnCode, 200);

    // verify correct extension
    var data = {
      queryStringObject: {
        id: userTokenId,
      }
    };

    tokens.get(data, (returnCode, tokenObject) => {
      assert.equal(tokenObject.expires > userTokenExpires, true);
      done();
    });
  });
};

tests['tokens.delete should delete the token'] = done => {
  var data = {
    payload: {
      id: userTokenId,
    }
  };

  tokens.delete(data, outcome => {
    assert.equal(outcome, 200);
    var foundTokens = fs.readdirSync(tokensDir);
    // TODO remove side effects from users.spec
    //assert.equal(foundTokens.length, existingTokens.length);
    done();
  });
};

module.exports = tests;
