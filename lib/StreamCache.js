"use strict";

class StreamCache extends require('stream').Stream{
	constructor(){
		super();
		
		this.writable=true;
		this.readable=true;
		
		this.length=0;
		
		//contains just one buffer if ended
		this._buffers=[];
		//is set to null if ended
		this._dests=[];
	}
	
	write(buffer){
		const dests=this._dests;
		if(dests!==null){}
		else
			throw Error('stream already ended');
		
		if(buffer.constructor===Buffer){}
		else
			throw Error('buffer expected');
		
		this._buffers.push(buffer);
		this.length+=buffer.length;
		
		var i=dests.length;
		while(i--)
			dests[i].write(buffer);
		
		return true;
	}
	
	end(buffer){
		const dests=this._dests;
		if(buffer===undefined){
			if(dests!==null){}
			else
				throw Error('stream already ended');
		}
		else
			this.write(buffer);
		
		var i=dests.length;
		while(i--)
			dests[i].end();
		
		this._dests=null;
		
		//merge all buffers into one since there will be no more being added
		//(saves memory and loopings in future pipe calls)
		this._buffers=[
			Buffer.concat(this._buffers)
		];
		
		return this;
	}
	
	pipe(dest,options){
		if(options===undefined){}
		else
			throw Error('options not supported');
		
		//TODO try to asynchronize buffer flow, since with this implementation,
		// it blocks execution until all data is written out
		
		const buffers=this._buffers,dests=this._dests;
		if(dests===null)
			return dest.end(buffers[0]);
		
		for(var i=0,l=buffers.length;i<l;++i)
			dest.write(buffers[i]);
		
		dests.push(dest);
		
		return dest;
	}
	
	//deprecated
	getLength(){
		return this.length;
	}
}

module.exports=StreamCache;
