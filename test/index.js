var runner = require('./runner');
var helpersSpecs = require('../api/lib/helpers.spec');
var dataSpecs = require('../api/lib/data.spec');

runner.tests = {
  unit:{
    ...helpersSpecs,
    ...dataSpecs,
  },
};

runner.run();
