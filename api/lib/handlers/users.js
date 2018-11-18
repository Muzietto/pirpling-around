var _data = require('../data');
var _tokensHandlers = require('./tokens');
var helpers = require('../helpers');

var handlers = {
  interfaceType: () => 'callback',
};

// required firstName, lastName, phone, password, tosAgreement
handlers.post = (data, callback) => {
  var firstName = helpers.validatedS(data.payload.firstName);
  var lastName = helpers.validatedS(data.payload.lastName);
  var phone = helpers.validatedS(data.payload.phone);
  var password = helpers.validatedS(data.payload.password);
  var tosAgreement = helpers.validatedB(data.payload.tosAgreement);

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

handlers.get = (data, callback) => {

  console.log(`QS is ${JSON.stringify(data.queryStringObject)}`);

  var phone = typeof data.queryStringObject !== 'undefined'
    && typeof data.queryStringObject.phone === 'string'
    && data.queryStringObject.phone.trim().length > 0
    && data.queryStringObject.phone.trim();

  console.log(`user phone is ${phone}`);

  if (phone) {

    var token  = typeof data.headers.token === 'string' && data.headers.token;
    console.log(`user token id is ${token}`);

    _tokensHandlers.verifyToken(token, phone, isValid => {

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

handlers.put = (data, callback) => {
  var phone = typeof data.payload !== 'undefined'
    && typeof data.payload.phone === 'string'
    && data.payload.phone.trim().length > 0
    && data.payload.phone.trim();
  var firstName = helpers.validatedS(data.payload.firstName);
  var lastName = helpers.validatedS(data.payload.lastName);
  var password = helpers.validatedS(data.payload.password);

  if (phone) {
    var token  = typeof data.headers.token === 'string' && data.headers.token;
    console.log(`user token is ${token}`);
    _tokensHandlers.verifyToken(token, phone, isValid => {
      if (isValid) {
        console.log('users.put: token is valid');
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
handlers.delete = (data, callback) => {

  var phone = typeof data.payload !== 'undefined'
    && typeof data.payload.phone === 'string'
    && data.payload.phone.trim().length > 0
    && data.payload.phone.trim();

  console.log(`users.delete: user phone is ${phone}`);

  if (phone) {
    var token  = typeof data.headers.token === 'string' && data.headers.token;
    console.log(`users.delete: user token is ${token}`);
    _tokensHandlers.verifyToken(token, phone, isValid => {
      if (isValid) {
        console.log('users.delete: token is valid');
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            _data.delete('users', phone, err => {
              if (!err) {
                callback(200);
              } else {
                var msg = `users.delete: could not delete user ${phone}: ${err}`;
                console.log(msg);
                callback(500, {error: msg});
              }
            });
          } else {
            callback(400, {error: `users.delete: could not find user ${phone}`});
          }
        });
      } else {
        callback(403, {error: 'users.delete: missing token in header or invalid token'});
      }
    });
  } else {
    callback(400, {error: 'users.delete: missing required field phone number'});
  }
};

module.exports = handlers;
