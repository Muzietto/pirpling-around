var runner = require('./runner');
var helpersSpecs = require('../api/lib/helpers.spec');
var dataSpecs = require('../api/lib/data.spec');
var data0Specs = require('../api/lib/data0.spec');

runner.tests = {
  unit:{
    ...helpersSpecs,
    ...dataSpecs,
    ...data0Specs,
  },
};

runner.run();
