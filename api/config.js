
var environments = {};

environments.development = {
  port: 3000,
  envName: 'development',
};

environments.production = {
  port: 5000,
  envName: 'production',
};

var currentEnvironment = (typeof process.env.NODE_ENV !== 'undefined') 
  ? process.env.NODE_ENV.toLowerCase() 
  : 'development';

var environmentToExport = environments[currentEnvironment];

module.exports = environmentToExport;
