
var environments = {};

environments.development = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'development',
  hashingSecret: 'This is a development secret',
};

environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
  hashingSecret: 'This is a production secret',
};

var currentEnvironment = (typeof process.env.NODE_ENV !== 'undefined')
  ? process.env.NODE_ENV.toLowerCase()
  : 'development';

var environmentToExport = environments[currentEnvironment];

module.exports = environmentToExport;
