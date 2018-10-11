// request handlers
var _data = require('./data');
var helpers = require('./helpers');
var handlers = {};
var _usersHandlers = {};
var _tokensHandlers = {};

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

// required firstName, lastName, phone, password, tosAgreement
_usersHandlers.post = (data, callback) => {
  var firstName = _validatedS(data.payload.firstName);
  var lastName = _validatedS(data.payload.lastName);
  var phone = _validatedS(data.payload.phone);
  var password = _validatedS(data.payload.password);
  var tosAgreement = _validatedB(data.payload.tosAgreement);

  if (firstName &&  lastName && phone && password && tosAgreement) {

    // user must be non-existing
    _data.read('users', phone, (err, data) => {

      if (err) { // couldn't read .data/users/<phone>.json

        // hash the password
        var hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          var userObject = {
            firstName,
            lastName,
            phone,
            tosAgreement: true,
            hashedPassword,
          };

          _data.create('users', phone, userObject, err => {

            if (!err) {
              console.log(`Created new user: ${phone}`);
              callback(200);
            } else {
              var msg = `Could not create new user: ${err}`;
              console.log(msg);
              callback(500, {error: msg})
            }
          });
        } else {
          callback(400, {error: 'Problems hashing the password'});
        }

      } else {
        callback(400, {error: 'A user with that phone number already exists'});
      }
    });

  } else {
    callback(400, {error: 'Missing required fields'});
  }
};

_usersHandlers.get = (data, callback) => {

  console.log(`QS is ${JSON.stringify(data.queryStringObject)}`);

  var phone = typeof data.queryStringObject !== 'undefined'
    && typeof data.queryStringObject.phone === 'string'
    && data.queryStringObject.phone.trim().length > 0
    && data.queryStringObject.phone.trim();

  console.log(`user phone is ${phone}`);

  if (phone) {

    var token  = typeof data.headers.token === 'string' && data.headers.token;
    console.log(`user token is ${token}`);
    var _token = helpers.parseJsonToObject(token);

    _tokensHandlers.verifyToken(_token.id, _token.phone, isValid => {

      if (isValid) {
        console.log('token is valid');

        _data.read('users', phone, (err, data) => {
          if (!err && data) {

            console.log(`retrieved data: ${JSON.stringify(data)}`);

            delete data.hashedPassword;
            callback(200, data);

          } else {
            callback(404);
          }
        });

      } else {
        callback(403, {error: 'missing token in header or invalid token'});
      }
    });
  } else {
    callback(400, {error: 'missing required field: phone number'});
  }
};

_usersHandlers.put = (data, callback) => {

  var phone = typeof data.payload !== 'undefined'
    && typeof data.payload.phone === 'string'
    && data.payload.phone.trim().length > 0
    && data.payload.phone.trim();
  var firstName = _validatedS(data.payload.firstName);
  var lastName = _validatedS(data.payload.lastName);
  var password = _validatedS(data.payload.password);

  if (phone) {
    var token  = typeof data.headers.token === 'string' && data.headers.token;
    console.log(`user token is ${token}`);
    var _token = helpers.parseJsonToObject(token);

    _tokensHandlers.verifyToken(_token.id, _token.phone, isValid => {

      if (isValid) {
        console.log('token is valid');
        if (firstName || lastName || password) {

          _data.read('users', phone, (err, data) =>{
            if (!err && data) {

              if (firstName) {
                data.firstName = firstName;
              }
              if (lastName) {
                data.lastName = lastName;
              }
              if (password) {
                data.hashedPassword = helpers.hash(password);
              }

              _data.update('users', phone, data, err => {
                if (!err) {
                  callback(200);
                } else {
                  var msg = `could not update user ${phone}: ${err}`;
                  console.log(msg);
                  callback(500, {error: msg});
                }
              });
            } else {
              callback(404);
            }
          });

        } else {
          callback(400, {error: 'no fields to update'});
        }

      } else {
        callback(403, {error: 'missing token in header or invalid token'});
      }
    });

  } else {
    callback(400, {error: 'missing required field'});
  }
};

// TODO rem to delete all stuff related to this user
_usersHandlers.delete = (data, callback) => {
  var phone = typeof data.payload !== 'undefined'
    && typeof data.payload.phone === 'string'
    && data.payload.phone.trim().length > 0
    && data.payload.phone.trim();

  console.log(`user phone is ${phone}`);

  if (phone) {
    var token  = typeof data.headers.token === 'string' && data.headers.token;
    console.log(`user token is ${token}`);
    var _token = helpers.parseJsonToObject(token);

    _tokensHandlers.verifyToken(_token.id, _token.phone, isValid => {

      if (isValid) {
        console.log('token is valid');

        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            _data.delete('users', phone, err => {
              if (!err) {
                callback(200);
              } else {
                var msg = `could not delete user ${phone}: ${err}`;
                console.log(msg);
                callback(500, {error: msg});
              }
            });
          } else {
            callback(400, {error: `could not find user ${phone}`});
          }
        });

      } else {
        callback(403, {error: 'missing token in header or invalid token'});
      }
    });

  } else {
    callback(400, {error: 'missing required field: phone number'});
  }
};

//requires phone and password
_tokensHandlers.post = (data, callback) => {
  var phone = _validatedS(data.payload.phone);
  var password = _validatedS(data.payload.password);

  if (phone && password) {
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        console.log(`found data for user ${phone}`);

        var hashedPassword = helpers.hash(password);

        if (hashedPassword === data.hashedPassword) {
          console.log('creating token for the next hour');

          var tokenId = helpers.createRandomString(20);
          var expires = Date.now() + 1000 * 60 *60;

          var tokenObject = {
            phone,
            id: tokenId,
            expires,
          };

          _data.create('tokens', tokenId, tokenObject, err => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, {error: `could not create the new token: ${err}`});
            }
          });

        } else {
          callback(400, {error: 'wrong password provided'});
        }

      } else {
        callback(400, {error: `could not find user ${phone}`});
      }
    });
  } else {
    callback(400, {error: 'missing required field(s)'});
  }
};

_tokensHandlers.get = (data, callback) => {
  var id = _validatedS(data.queryStringObject.id);
  if (id) {

    _data.read('tokens', id, (err, data) => {
      if (!err && data) {

        callback(200, data);

      } else {
        callback(404);
      }
    });

  } else {
    callback(400, {error: 'missing required field id'});
  }
};

// extend the session
_tokensHandlers.put = (data, callback) => {
  var id = _validatedS(data.payload.id);
  var extend = _validatedB(data.payload.extend);

  if (id && extend) {

    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {

        if (tokenData.expires > Date.now()) {

           tokenData.expires = Date.now() + 1000 * 60 * 60;
           _data.update('tokens', id, tokenData, err => {
             if (!err) {

               callback(200);

             } else {
               callback(500, {error: `could not update token ${id}`})
             }
           });

        } else {
          callback(400, {error: 'token already expired'});
        }

      } else {
        callback(400, {error: 'specified token does not exist'});
      }
    });

  } else {
    callback(400, {error: 'missing required fields or invalid fields'});
  }
};

_tokensHandlers.delete = (data, callback) => {
  var id = _validatedS(data.payload.id);

  if (id) {

    _data.read('tokens', id, (err, data) => {
      if (!err && data) {
        _data.delete('tokens', id, err => {
          if (!err) {
            callback(200);
          } else {
            var msg = `could not delete token ${id}`;
            console.log(msg);
            callback(500, {error: msg});
          }
        });
      } else {
        callback(400, {error: `could not find token ${id}`});
      }
    });

  } else {
    callback(400, {error: 'missing required field: phone number'});
  }

};

// verify token id
_tokensHandlers.verifyToken = (id, phone, callback) => {
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {

      if (tokenData.phone === phone && tokenData.expires) {
        callback(true);
      } else {
        callback(false);
      }

    } else {
      callback(false);
    }
  });
}

module.exports = handlers;

function _validatedS(value) {
  return (typeof(value) === 'string' && value.trim().length > 0)
    ? value.trim()
    : false;
}

function _validatedB(value) {
  return (typeof(value) === 'boolean' && value);
}
