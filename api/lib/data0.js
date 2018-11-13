// promise-based

var fs = require('fs').promises;
var path = require('path');
var helpers = require('./helpers');

var lib = {};

lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = (dir, fileName, data) => {
  var _fileName = lib.baseDir + dir + '/' + fileName + '.json';

  return fs.open(_fileName, 'wx')
    .then(file => fs.writeFile(file, JSON.stringify(data)))
    .then(fs.close)
    .then(_ => Promise.resolve(false))
    .catch(err => Promise.reject(`Error creating file ${_fileName}: ${err}`));
};

lib.read = (dir, fileName) => {
  var _fileName = lib.baseDir + dir + '/' + fileName + '.json';

  return fs.readFile(_fileName, 'utf-8')
    .then(data => Promise.resolve(helpers.parseJsonToObject(data)))
    .catch(err => Promise.reject(`Error reading user data: ${err}`));
};

lib.update = (dir, fileName, data) => {
  var _fileName = lib.baseDir + dir + '/' + fileName + '.json';
  var theFile;

  return fs.open(_fileName, 'r+')
    .then(file => {
      theFile = file;
      return fs.ftruncate(file);
    })
    .then(_ => fs.writeFile(theFile, JSON.stringify(data)))
//    .then(_ => fs.close(theFile))
    .then(_ => Promise.resolve(false))
    .catch(err => Promise.reject(`Error updating file ${_fileName}: ${err}`));
};

lib.delete = (dir, fileName, callback) => {
  var _fileName = lib.baseDir + dir + '/' + fileName + '.json';

  return fs.unlink(_fileName)
    .then(_ => Promise.resolve(false))
    .catch(err => Promise.reject(`Error deleting file ${_fileName}: ${err}`));
};

module.exports = lib;
