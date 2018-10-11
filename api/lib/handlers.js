// request handlers
var _data = require('./data');
var helpers = require('./helpers');
var handlers = {};
var _usersHandlers = {};

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

// TODO - only authenticated users access their stuff
_usersHandlers.get = (data, callback) => {

  console.log(`QS is ${JSON.stringify(data.queryStringObject)}`);

  var phone = typeof data.queryStringObject !== 'undefined'
    && typeof data.queryStringObject.phone === 'string'
    && data.queryStringObject.phone.trim().length > 0
    && data.queryStringObject.phone.trim();

  console.log(`user phone is ${phone}`);

  if (phone) {

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
    callback(400, {error: 'missing required field: phone number'});
  }
};

// TODO - only authenticated users access their stuff
_usersHandlers.put = (data, callback) => {

  var phone = typeof data.payload !== 'undefined'
    && typeof data.payload.phone === 'string'
    && data.payload.phone.trim().length > 0
    && data.payload.phone.trim();
  var firstName = _validatedS(data.payload.firstName);
  var lastName = _validatedS(data.payload.lastName);
  var password = _validatedS(data.payload.password);

  if (phone) {

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
    callback(400, {error: 'missing required field'});
  }
};

// TODO only authenticate users delete themselves
// TODO rem to delete all stuff related to this user
_usersHandlers.delete = (data, callback) => {
  var phone = typeof data.payload !== 'undefined'
    && typeof data.payload.phone === 'string'
    && data.payload.phone.trim().length > 0
    && data.payload.phone.trim();

  console.log(`user phone is ${phone}`);

  if (phone) {

    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        _data.delete('users', phone, (err, data) => {
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
    callback(400, {error: 'missing required field: phone number'});
  }
};

module.exports = handlers;

function _validatedS(value) {
  return (typeof(value) === 'string' && value.trim().length > 0)
    ? value.trim()
    : false;
}

function _validatedB(value) {
  return (typeof(value) === 'boolean' && value);
}
