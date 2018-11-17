var runner = require('./runner');
var helpersSpecs = require('../api/lib/helpers.spec');
var dataSpecs = require('../api/lib/data.spec');
var data0Specs = require('../api/lib/data0.spec');
var unflatSpecs = require('../api/lib/unflat.spec');

runner.tests = {
  unit:{
    ...unflatSpecs,
    ...helpersSpecs,
    ...dataSpecs,
    ...data0Specs,
  },
};

runner.run();
