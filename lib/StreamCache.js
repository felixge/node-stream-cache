var Util   = require('util');
var Stream = require('stream').Stream;

module.exports = StreamCache;
Util.inherits(StreamCache, Stream);
function StreamCache() {
  Stream.call(this);

  this.writable = true;
  this.readable = true;
  
  //contains just one buffer if ended
  this._buffers = [];
  //is set to null if ended
  this._dests   = [];
}

StreamCache.prototype.write = function(buffer) {
  this._buffers.push(buffer);

  const dests=this._dests;
  var i=dests.length;
  while(i--)
    dests[i].write(buffer);
  
  return true;
};

StreamCache.prototype.pipe = function(dest, options) {
  if (options===undefined){}
  else
    throw Error('StreamCache#pipe: options are not supported yet.');
  
  //TODO try to asynchronize buffer flow, since with this implementation,
  // it blocks execution until all data is written out
  
  const buffers=this._buffers,dests=this._dests;
  if (dests===null)
    return dest.end(buffers[0]);
  
  for(var i=0,l=buffers.length;i<l;++i)
    dest.write(buffers[i]);
  
  dests.push(dest);

  return dest;
};

StreamCache.prototype.getLength = function() {
  if(this._dests===null)
    return this._buffers[0].length;
  
  const buffers=this._buffers;
  var l=0,i=buffers.length;
  while(i--)
    l+=buffers[i].length;
  
  return l;
};

StreamCache.prototype.end = function(buffer) {
  const dests=this._dests;
  if (dests!==null){}
  else
    throw Error('StreamCache#end: stream already ended.');
  
  if(buffer===undefined){}
  else
    this.write(buffer);
  
  var i=dests.length;
  while(i--)
    dests[i].end();
  
  this._dests = null;
  
  //merge all buffers into one since there will be no more being added
  //(saves memory and loopings in future pipe calls)
  this._buffers=[
    Buffer.concat(this._buffers)
  ];
  
  return this;
};
