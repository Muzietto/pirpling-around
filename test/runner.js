var runner = {};

runner.tests = {
  unit: {},
  integration: {},
};

runner.run = _ => {
  var count = 0;
  var successes = 0;
  var errors = [];

  Object.keys(runner.tests).forEach(type => {
    Object.keys(runner.tests[type]).forEach(testName => {
      try {
        runner.tests[type][testName](_ => {
          successes++;
        });
      } catch(error) {
        errors.push({error, testName});
      } finally {
        count++;
      }
    });
  });

  console.log('');
  console.log('--------TEST REPORT-------');
  console.log(`Ran: ${count}`);
  console.log('\x1b[32m%s\x1b[0m', `Pass: ${successes}`);
  console.log('\x1b[31m%s\x1b[0m', `Fail: ${errors.length}`);

  errors.forEach(error => {
    console.log('');
    console.log('\x1b[31m%s\x1b[0m', `Name: ${error.testName}, Error: ${error.error}`);
  });
  console.log('');
  console.log('--------END TEST REPORT-------');
};

module.exports = runner;
