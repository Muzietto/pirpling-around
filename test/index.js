var runner = require('./runner');
var helpersSpecs = require('../api/lib/helpers.spec');
var dataSpecs = require('../api/lib/data.spec');
var data0Specs = require('../api/lib/data0.spec');
var unflatSpecs = require('../api/lib/unflat.spec');
var usersSpecs = require('../api/lib/handlers/users.spec');
var tokensSpecs = require('../api/lib/handlers/tokens.spec');

runner.tests = {
  unit:{
    ...unflatSpecs,
    ...helpersSpecs,
    ...dataSpecs,
    ...data0Specs,
    ...usersSpecs,
    ...tokensSpecs,
  },
};

runner.run();
