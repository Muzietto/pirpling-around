var unflat = require('./unflat');
var assert = require('assert');
var tests = {};

tests['can unflat one level once'] = done => {
  var input = JSON.stringify({one: 1});
  var output = unflat(input);

  assert.equal(JSON.stringify(output), input);
  done();
};

tests['can unflat one level twice'] = done => {
  var input = JSON.stringify({one: 1, two:2});
  var output = unflat(input);

  assert.equal(JSON.stringify(output), input);
  done();
};

tests['can unflat two levels once'] = done => {
  var input = JSON.stringify({'one.two': 12});
  var output = unflat(input);

  assert.equal(JSON.stringify({one:{two:12}}), JSON.stringify(output));
  done();
};

tests['can unflat two levels twice'] = done => {
  var input = JSON.stringify({'one.two': 12, 'three.four':34});
  var output = unflat(input);

  assert.equal(JSON.stringify({one:{two:12}, three:{four:34}}),  JSON.stringify(output));
  done();
};

tests['can unflat a little tree'] = done => {
  var input = JSON.stringify({'one.two': 12, 'one.three':13});
  var output = unflat(input);

  assert.equal(JSON.stringify({one:{two:12, three:13}}),  JSON.stringify(output));
  done();
};

tests['can unflat a more complex tree'] = done => {
  var input = JSON.stringify({'one.two': 12, 'one.three.four':134, 'one.three.five':135});
  var output = unflat(input);

  assert.equal(JSON.stringify({one:{two:12, three:{four:134, five: 135}}}),  JSON.stringify(output));
  done();
};

tests['can unflat a nightmare tree'] = done => {
  var input = JSON.stringify({
    'one.two': 12,
    'six.three.five':635,
    'six.three.four':634,
    'one.three.four':134,
    ten: 10,
    'six.three.seven.nine':6379,
    'one.three.five':135,
    'six.two': 62,
    'six.three.seven.eight':6378,
  });
  var output = unflat(input);

  assert.equal(JSON.stringify({
    one: {
      two:12,
      three: {
        four:134,
        five: 135
      }
    },
    six: {
      three: {
        five: 635,
        four: 634,
        seven: {
          nine: 6379,
          eight: 6378,
        }
      },
      two: 62,
    },
    ten: 10,
  }),  JSON.stringify(output));
  done();
};

module.exports = tests;
