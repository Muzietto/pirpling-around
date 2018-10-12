// promise-based

var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');

var lib = {};

lib.baseDir = path.join(__dirname, '/../.data/');

// TODO complete it, so that it returns a promise
lib.create = (dir, fileName, data, callback) => {
  var _fileName = lib.baseDir + dir + '/' + fileName + '.json';

  return fs.open(_fileName, 'wx')
    .then(file => {
      var _data = JSON.stringify(data);

      return fs.writeFile(file, _data)
        .then(() => fs.close(file)
            .then(() => { callback(false); })
            .catch(err => { callback(`Error closing new file ${_fileName}: ${err}`); });
        )
        .catch(err => { callback(`Error writing to new file ${_fileName}: ${err}`); });
    })
    .catch(err => { callback(`Error opening file ${_fileName} for writing: ${err}`); });
};

// returns a promise
lib.read = (dir, fileName) => {
  var _fileName = lib.baseDir + dir + '/' + fileName + '.json';
  return fs.readFile(_fileName, 'utf-8')
    .then(data => Promise.resolve(helpers.parseJsonToObject(data)))
    .catch(err => Promise.reject(`Error reading user data: ${err}`)); // used to be an object {error:msg}
};

lib.update = (dir, fileName, data, callback) => {
  var _fileName = lib.baseDir + dir + '/' + fileName + '.json';

  fs.open(_fileName, 'r+', (err, file) => {
    if (!err && file) {
      var _data = JSON.stringify(data);

      fs.ftruncate(file, err => {

        if (!err) {

          fs.writeFile(file, _data, err => {
            if (!err) {

              fs.close(file, err => {
                callback((err) ? `Error closing updated file ${_fileName}: ${err}` : false);
              });
            } else {
              callback(`Error updating file ${_fileName}: ${err}`);
            }
          });
        } else {
          callback(`Error truncating file ${_fileName}: ${err}`);
        }
      });

    } else {
      callback(`Error opening file ${_fileName} for updating: ${err}`);
    }
  });
};

lib.delete = (dir, fileName, callback) => {
  var _fileName = lib.baseDir + dir + '/' + fileName + '.json';

  fs.unlink(_fileName, err => {
    callback((err) ? `Error deleting file ${_fileName}: ${err}` : false);
  });
};

module.exports = lib;
