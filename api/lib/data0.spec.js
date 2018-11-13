var data = require('./data0');
var fs = require('fs');
var assert = require('assert');
var path = require('path');

var tests = {};

var filename = Date.now();
var baseDir = path.join(__dirname, '/../.data/test');

tests['datasource should create a file and return a promise'] = done => {
  var text = `test ${filename}`;
  var jsonContent = JSON.stringify({ text });

  data.create('test', filename, { text })
    .then(outcome => {
      assert.equal(outcome, false);
      var foundFiles = fs.readdirSync(baseDir);
      assert.equal(foundFiles.length, 1);
      assert.equal(foundFiles[0], `${filename}.json`);
      done();
    });
};

tests['datasource should read a file and return a promise'] = done => {
  var text = `test ${filename}`;
  var jsonContent = JSON.stringify({ text });

  data.read('test', filename)
    .then(data => {
      assert.equal(JSON.stringify(data), jsonContent);
      done();
    });
};

tests['datasource should update a file and return a promise'] = done => {
  var text = `test ${filename} test`;
  var jsonContent = JSON.stringify({ text });

  data.update('test', filename, { text })
    .then(outcome => {
      assert.equal(outcome, false);
      var foundContent = fs.readFileSync(`${baseDir}/${filename}.json`);
      assert.equal(foundContent, jsonContent);
      done();
    });
};

tests['datasource should delete a file and return a promise'] = done => {
  data.delete('test', filename)
    .then(outcome => {
      assert.equal(outcome, false);
      var foundFiles = fs.readdirSync(baseDir);
      assert.equal(foundFiles.length, 0);
      done();
    });
};

module.exports = tests;
