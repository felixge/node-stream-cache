var Util   = require('util');
var Stream = require('stream').Stream;

module.exports = StreamCache;
Util.inherits(StreamCache, Stream);
function StreamCache() {
  Stream.call(this);

  this.writable = true;
  this.readable = true;

  this._buffers = [];
  this._dests   = [];
  this._ends    = [];
  this._ended   = false;
}

StreamCache.prototype.write = function(buffer) {
  this._buffers.push(buffer);

  this._dests.forEach(function(dest) {
    dest.write(buffer);
  });
};

StreamCache.prototype.pipe = function(dest, options) {
  this._buffers.forEach(function(buffer) {
    dest.write(buffer);
  });

  if (this._ended && options.end) {
    dest.end();
    return dest;
  }

  this._dests.push(dest);
  this._ends.push(options && options.end || true);

  return dest;
};

StreamCache.prototype.getLength = function() {
  return this._buffers.reduce(function(totalLength, buffer) {
    return totalLength + buffer.length;
  }, 0);
};

StreamCache.prototype.end = function() {
  for (var i = 0; i < this._dests.length; i++) {
    if (this._ends[i]) {
      this._dests[i].end();
    }
  }

  this._ended = true;
  this._dests = [];
};
