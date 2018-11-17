// uses promise-based datasources and returns promises
var _data = require('../data');
var _dataPromise = require('../data0');
var helpers = require('../helpers');

var handlers = {
  interfaceType: () => 'promise',
};

// required firstName, lastName, phone, password, tosAgreement
handlers.post = data => {

    var firstName = helpers.validatedS(data.payload.firstName);
    var lastName = helpers.validatedS(data.payload.lastName);
    var phone = helpers.validatedS(data.payload.phone);
    var password = helpers.validatedS(data.payload.password);
    var tosAgreement = helpers.validatedB(data.payload.tosAgreement);

    if (firstName &&  lastName && phone && password && tosAgreement) {

      return _dataPromise.read('users', phone)
        .then(() => Promise.reject({code: 400, payload: {error: 'A user with that phone number already exists'}}))
        .catch(err => { // user must be non-existing
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

            return _dataPromise.create('users', phone)
              .then(() => {
                console.log(`Created new user: ${phone}`);
                return Promise.resolve({code: 200});
              })
              .catch(err => {
                var msg = `Could not create new user: ${err}`;
                console.log(msg);
                return Promise.reject({code: 500, payload: {error: msg}});
              });
          } else {
            return Promise.reject({code: 400, payload: {error: 'Problems hashing the password'}});
          }
        });
    } else {
      return Promise.reject({code: 400, payload: {error: 'Missing required fields'}});
    }
};

handlers.get = data => {

  return new Promise((resolve, reject) => {

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
              resolve({code: 200, data});

            } else {
              reject({code: 404});
            }
          });

        } else {
          reject({code: 403, error: 'missing token in header or invalid token'});
        }
      });
    } else {
      reject({code: 400, error: 'missing required field: phone number'});
    }
  });
};

handlers.put = (data, callback) => {

  return new Promise((resolve, reject) => {

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
                    resolve({code: 200});
                  } else {
                    var msg = `could not update user ${phone}: ${err}`;
                    console.log(msg);
                    reject({code: 500, error: msg});
                  }
                });
              } else {
                reject({code: 404});
              }
            });

          } else {
            reject({code: 400, error: 'no fields to update'});
          }

        } else {
          reject({code: 403, error: 'missing token in header or invalid token'});
        }
      });

    } else {
      reject({code: 400, error: 'missing required field'});
    }
  });
};

// TODO rem to delete all stuff related to this user
handlers.delete = (data, callback) => {

  return new Promise((resolve, reject) => {

    var phone = typeof data.payload !== 'undefined'
      && typeof data.payload.phone === 'string'
      && data.payload.phone.trim().length > 0
      && data.payload.phone.trim();

    console.log(`user phone is ${phone}`);

    if (phone) {
      var token  = typeof data.headers.token === 'string' && data.headers.token;
      console.log(`user token is ${token}`);

      _tokensHandlers.verifyToken(token, phone, isValid => {

        if (isValid) {
          console.log('token is valid');

          _data.read('users', phone, (err, data) => {
            if (!err && data) {
              _data.delete('users', phone, err => {
                if (!err) {
                  resolve({code: 200});
                } else {
                  var msg = `could not delete user ${phone}: ${err}`;
                  console.log(msg);
                  reject({code: 500, error: msg});
                }
              });
            } else {
              reject({code: 400, error: `could not find user ${phone}`});
            }
          });

        } else {
          reject({code: 403, error: 'missing token in header or invalid token'});
        }
      });

    } else {
      reject({code: 400, error: 'missing required field: phone number'});
    }
  });
};

module.exports = handlers;
