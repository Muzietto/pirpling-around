var fs = require('fs');
var path = require('path');

var lib = {};

lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = (dir, fileName, data, callback) => {
  var _fileName = lib.baseDir + dir + '/' + fileName + '.json';

  fs.open(_fileName, 'wx', (err, file) => {
  
    if (!err && file) {
    
      var _data = JSON.stringify(data);

      fs.writeFile(file, _data, err => {
      
        if (!err) {
        
          fs.close(file, err => {
            callback((err) ? `Error closing new file ${_fileName}: ${err}` : false);
          });
        } else {
          callback(`Error writing to new file ${_fileName}: ${err}`);
        }
      });

    } else {
      callback(`Error opening file ${_fileName} for writing: ${err}`);
    }
  });
};

lib.read = (dir, fileName, callback) => {
  var _fileName = lib.baseDir + dir + '/' + fileName + '.json';
  fs.readFile(_fileName, 'utf-8', callback);
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

