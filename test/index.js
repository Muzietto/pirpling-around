var runner = require('./runner');
var helpersSpecs = require('../api/lib/helpers.spec');

runner.tests = {
  unit:{
    ...helpersSpecs
  },
};

runner.run();
