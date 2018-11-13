var _data = require('../data');
var helpers = require('../helpers');

var handlers = {
  interfaceType: () => 'callback',
};

//requires phone and password
handlers.post = (data, callback) => {
  var phone = helpers.validatedS(data.payload.phone);
  var password = helpers.validatedS(data.payload.password);

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

handlers.get = (data, callback) => {
  var id = helpers.validatedS(data.queryStringObject.id);
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
handlers.put = (data, callback) => {
  var id = helpers.validatedS(data.payload.id);
  var extend = helpers.validatedB(data.payload.extend);

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

handlers.delete = (data, callback) => {
  var id = helpers.validatedS(data.payload.id);

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
handlers.verifyToken = (id, phone, callback) => {

  _data.read('tokens', id, (err, tokenData) => {

    if (!err && tokenData) {

      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
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
