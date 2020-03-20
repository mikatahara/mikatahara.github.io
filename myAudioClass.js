var mAudioContext = null;
var audiosource;
var splitter = null;
var merger = null;
var node = null;

var mGainW = null;
var mGainD = null;
var mReverb = null;

var mAudioBuffer= [null,null];

function mAudioInitialize(process){

	if(mAudioContext!=null) return;

	navigator.getUserMedia = ( navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia);

	mAudioContext = new AudioContext();
	splitter= mAudioContext.createChannelSplitter(2);
	merger 	= mAudioContext.createChannelMerger(2);
	node 	= mAudioContext.createScriptProcessor(1024, 2, 2);
	mGainW 	= mAudioContext.createGain();
	mGainD 	= mAudioContext.createGain();
	mGainW.gain.value = 0.4;
	mGainD.gain.value = 1.0;
	mReverb	= mAudioContext.createConvolver();

/* Convolver のインパルス応答のロード*/
	mloadDogSound(
		"https://mikatahara.github.io/1 Halls 11 Gold Hall.1.1.wav"
 		, 0);

//データ処理関数の定義
	node.onaudioprocess=process;

// Mic -> SP を立ち上げる
	soundThrough();
}

function mAudioClose(){
	if(mAudioContext!=null){
		mAudioContext.close();
		mAudioContext=null;
	}
}

function soundThrough() {
	navigator.getUserMedia({video: false, audio: true},

		function(stream){
			audiosource = mAudioContext.createMediaStreamSource(stream);
			audiosource.connect(node);
//			node.connect(splitter);
//			splitter.connect(gainL, 0);
//			splitter.connect(gainR, 1);
//			gainL.connect(merger, 0, 0)
//			gainR.connect(merger, 0, 1)
			node.connect(mReverb);
			mReverb.connect(mGainW);
			node.connect(mGainD);
			mGainW.connect(mAudioContext.destination);
			mGainD.connect(mAudioContext.destination);
///			merger.connect(mAudioContext.destination);
	},

		function(e) {	// I can't use getUserMedia
			console.log(e);
		}
	);
}

function mloadDogSound(url, n) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';

	// Decode asynchronously
	request.onload = function() {
		mAudioContext.decodeAudioData(request.response, function(buffer) {
		mAudioBuffer[n]= buffer; 
		mReverb.buffer = mAudioBuffer[n];
		}, function(){ alert('Error'); } );
	}
	request.send();
}
