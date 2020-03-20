var mWavesampleSize=32768;

function WaveSample(){
	this.wavesample = new Array(mWavesampleSize);
	for(var i=0; i<mWavesampleSize; i++) this.wavesample[i] =0;
	this.isaveCount=0;
	this.iplayCount=0;
}

WaveSample.prototype={

	setSample : function(lwavesample,lsamplesize){
	
		if(this.isaveCount>=mWavesampleSize) return 0;

		for(var i=0; 
			i<lsamplesize && this.isaveCount<mWavesampleSize;
			i++, this.isaveCount++){
			this.wavesample[this.isaveCount]=lwavesample[i];
		}
		return 1;
	},



	resetSaveCount : function()
	{
		this.isaveCount = 0;
		for(var i=0; i<mWavesampleSize; i++) this.wavesample[i] =0;
	},
	
	readSample : function(){
		if(this.iplayCount<mWavesampleSize){
			return this.wavesample[this.iplayCount];
		} else {
			return 0;
		}
	},

	incCount : function(){
		if(this.iplayCount < mWavesampleSize) this.iplayCount++;
	},

	resetCount : function(){
		this.iplayCount=0;
	}

}


