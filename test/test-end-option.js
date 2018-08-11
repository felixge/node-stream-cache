var StreamCache = require('..');
var PassThrough = require('stream').PassThrough;
var assert      = require('assert');

// Does the end option allow writables to end.
(function() {
  var cache    = new StreamCache();
  var source   = new PassThrough();
  var superSourceEnd = source.end;
  source.end = function() {
    superSourceEnd();
    assert.ok(true);
  };

  source.pipe(cache, {end: true});
  source.write('hello');

  cache.end();
})();

// Does the end option prevent writables from ending.
(function() {
  var cache    = new StreamCache();
  var source   = new PassThrough();
  var superSourceEnd = source.end;
  source.end = function() {
    superSourceEnd();
    assert.ok(false);
  };

  source.pipe(cache, {end: false});
  source.write('hello');

  cache.end();
  source.end = superSourceEnd;
  source.end();
  assert.ok(true);
})();
