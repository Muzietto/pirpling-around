function unflat(json) {
  var flattened = JSON.parse(json);
  return Object.keys(flattened).reduce((acc, curr) => {
    return unflatHelper(acc, curr, flattened[curr]);
  }, {});
}

module.exports = unflat;

function unflatHelper(acc, currentKey, currentValue) {
  if (currentKey.indexOf('.') === -1) {
    acc[currentKey] = currentValue;
  } else {
    var nextKey = car(currentKey);
    var nextAcc = {};
    if (acc[nextKey]) {
      nextAcc = Object.assign(acc[nextKey], {});
    }
    acc[nextKey] = unflatHelper(nextAcc, cdr(currentKey), currentValue);
  }
  return acc;
}

function car(dotSeparatedString) {
  return dotSeparatedString.split('.')[0];
}

function cdr(dotSeparatedString) {
  return dotSeparatedString.split('.').slice(1).join('.');
}
