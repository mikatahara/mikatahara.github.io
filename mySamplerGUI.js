var fdg0 = null;
var fdg1 = null;
var fdg2 = null;
var fdg3 = null;
var fdgC = null;

var log = null;
var sampleRate = null;
var samplebuf = null;

var mRecFlag=0;
var mRecCh=0;
var mTimerId1=null;
var mCnt=0;

var mSecPattern = [
	[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
	[0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0],
	[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
	[0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
];

var mCircle = [
	[1.000000,  0.000000],
	[0.923880,  0.382683],
	[0.707107,  0.707107],
	[0.382683,  0.923880],
	[-0.000000, 1.000000],
	[-0.382683, 0.923880],
	[-0.707107, 0.707107],
	[-0.923880, 0.382683],
	[-1.000000,-0.000000],
	[-0.923880,-0.382684],
	[-0.707107,-0.707107],
	[-0.382683,-0.923880],
	[0.000000, -1.000000],
	[0.382684, -0.923880],
	[0.707107, -0.707107],
	[0.923880, -0.382683],
];

window.onload = function(){

// ページ読み込み時に実行したい処理
/* 描画領域の初期化 */
	fdg0 = new DrawGraph(0,600,0,100);
	fdg0.fSetCanvas(document.getElementById('waveshape0'));
//	fdg0.fResize();
	fdg0.fStrokeRect();
//	fdg0.fSetWindowXY(0,fdg0.cv.width,0,fdg0.cv.height);
	fdg0.fSetViewPort(0,1024,-2,2);

	fdg1 = new DrawGraph(0,600,0,100);
	fdg1.fSetCanvas(document.getElementById('waveshape1'));
//	fdg1.fResize();
	fdg1.fStrokeRect();
//	fdg1.fSetWindowXY(0,fdg0.cv.width,0,fdg0.cv.height);
	fdg1.fSetViewPort(0,1024,-2,2);

	fdg2 = new DrawGraph(0,600,0,100);
	fdg2.fSetCanvas(document.getElementById('waveshape2'));
//	fdg2.fResize();
	fdg2.fStrokeRect();
//	fdg2.fSetWindowXY(0,fdg0.cv.width,0,fdg0.cv.height);
	fdg2.fSetViewPort(0,1024,-2,2);

	fdg3 = new DrawGraph(0,600,0,100);
	fdg3.fSetCanvas(document.getElementById('waveshape3'));
//	fdg3.fResize();
	fdg3.fStrokeRect();
//	fdg3.fSetWindowXY(0,fdg0.cv.width,0,fdg0.cv.height);
	fdg3.fSetViewPort(0,1024,-2,2);

	fdgC = new DrawGraph(0,400,0,400);
	fdgC.fSetCanvas(document.getElementById('cgui'));
	fdgC.fStrokeRect();

	fdgC.fFillColor("#222222");
	fdgC.fSetViewPort(-1.2,1.2,-1.2,1.2);
	fdgC.fDrawArcXY(0,0,6);
	fdgC.fVLine(0,0,0,1.1);

	for(var i=0; i<16; i++){
		fdgC.fFillColor("#AAAAAA");
		fdgC.fDrawArcXY(mCircle[i][0],mCircle[i][1],6);
		fdgC.fDrawArcXY(0.8*mCircle[i][0],0.8*mCircle[i][1],6);
		fdgC.fDrawArcXY(0.6*mCircle[i][0],0.6*mCircle[i][1],6);
		fdgC.fDrawArcXY(0.4*mCircle[i][0],0.4*mCircle[i][1],6);
	}

/* LOG領域の初期化 */
	log = document.getElementById("log");

/* Sample Buffer */
	samplebuf = new Array(4);
	for(var i=0; i<4; i++) samplebuf[i] = new WaveSample();
}

function mDispcircle(n)
{
	var j;
	for(var i=0; i<16; i++){
		j = (i+n)%16;
		if(mSecPattern[0][j]) fdgC.fFillColor("#FF0000");
		else fdgC.fFillColor("#AAAAAA");
		fdgC.fDrawArcXY(mCircle[i][0],mCircle[i][1],6);

		if(mSecPattern[1][j]) fdgC.fFillColor("#00FF00");
		else fdgC.fFillColor("#AAAAAA");
		fdgC.fDrawArcXY(0.8*mCircle[i][0],0.8*mCircle[i][1],6);

		if(mSecPattern[2][j]) fdgC.fFillColor("#0000FF");
		else fdgC.fFillColor("#AAAAAA");
		fdgC.fDrawArcXY(0.6*mCircle[i][0],0.6*mCircle[i][1],6);

		if(mSecPattern[3][j]) fdgC.fFillColor("#00FFFF");
		else fdgC.fFillColor("#AAAAAA");
		fdgC.fDrawArcXY(0.4*mCircle[i][0],0.4*mCircle[i][1],6);
	}
}



function audioOn(nch)
{

/* Audio API */
	mAudioInitialize(process);

	samplebuf[nch].resetSaveCount();
	mRecCh = nch;
	mRecFlag = 0;

	sampleRate = mAudioContext.sampleRate;
	log.innerText +="sample rate:"
	log.innerText += sampleRate;
	log.innerText +="\n";
}

function audioOff()
{
	mAudioClose();
	clearInterval(mTimerId1);
	mTimerId1=null;
	samplebuf[0].resetSaveCount();
	samplebuf[1].resetSaveCount();
	samplebuf[2].resetSaveCount();
	samplebuf[3].resetSaveCount();
	dispWave(0);
	dispWave(1);
	dispWave(2);
	dispWave(3);
}

function dispWave(nch)
{
	switch(nch){
		case 0:
			fdg0.fClearWindowInside();
			fdg0.fDrawLine(samplebuf[nch].wavesample);
			break;
		case 1:
			fdg1.fClearWindowInside();
			fdg1.fDrawLine(samplebuf[nch].wavesample);
			break;
		case 2:
			fdg2.fClearWindowInside();
			fdg2.fDrawLine(samplebuf[nch].wavesample);
			break;
		case 3:
			fdg3.fClearWindowInside();
			fdg3.fDrawLine(samplebuf[nch].wavesample);
			break;
	}

}

function dispTrig(nch, data)
{
	switch(nch){
		case 0:
			fdg0.fClearWindowInside();
			fdg0.fDrawLine(data);
			break;
		case 1:
			fdg1.fClearWindowInside();
			fdg1.fDrawLine(data);
			break;
		case 2:
			fdg2.fClearWindowInside();
			fdg2.fDrawLine(data);
			break;
		case 3:
			fdg3.fClearWindowInside();
			fdg3.fDrawLine(data);
			break;
	}
}

/* Audio Buffer が一杯になったらこの関数が呼ばれる */
function process(data){

	var procsize = data.inputBuffer.length;
	/* L-ch を描画する */
	var inbufL = data.inputBuffer.getChannelData(0);
	var inbufR = data.inputBuffer.getChannelData(1);
	var outbufL = data.outputBuffer.getChannelData(0);
	var outbufR = data.outputBuffer.getChannelData(1);

	if(!mRecFlag){
		var rmax = 0;
		var ipoint = 0;
		var ival=0;

		for(var i=0; i<procsize; i++){
			ival = Math.abs(inbufL[i]);
			if(rmax<ival){
				rmax = ival;
				ipoint = i;
			}
		}
		if(rmax > 0.5){
			mRecFlag=1;
			log.innerText = procsize;
			log.innerText +="  ";
			log.innerText += rmax;
			log.innerText +="\n";
//			fdg0.fClearWindowInside();
//			fdg0.fDrawLine(inbufL);
			dispTrig(mRecCh,inbufL);
		}
	}

	if(mRecFlag){
		var iflag=1;
		iflag = samplebuf[mRecCh].setSample(inbufL,procsize);
		if( !iflag ){
			mRecFlag=0;
			dispWave(mRecCh);
			timeron();
		}
	}

	var v0=0;
	var v1=0;
	var v2=0;
	var v3=0;

	for(var i=0; i<procsize; i++){ 
		v0 = samplebuf[0].readSample();
		v1 = samplebuf[1].readSample();
		v2 = samplebuf[2].readSample();
		v3 = samplebuf[3].readSample();
		outbufL[i]  = v0;
		outbufL[i] += v1;
		outbufL[i] += v2;
		outbufL[i] += v3;
		outbufR[i]=outbufL[i];
		samplebuf[0].incCount();
		samplebuf[1].incCount();
		samplebuf[2].incCount();
		samplebuf[3].incCount();
	}
}

function timeron()
{

	if(mTimerId1!=null) return;
	mTimerId1=setInterval(function(){
		if(mSecPattern[0][mCnt]) samplebuf[0].resetCount();
		if(mSecPattern[1][mCnt]) samplebuf[1].resetCount();
		if(mSecPattern[2][mCnt]) samplebuf[2].resetCount();
		if(mSecPattern[3][mCnt]) samplebuf[3].resetCount();
		mDispcircle(mCnt);
		mCnt++;
		mCnt&=0xF;
	}, 500 );
}


function leftGainChange(value){
	log.innerText +="left gain:"
	log.innerText +=value;
	log.innerText +="\n";
	gainL.gain.value = value;
}

function RightGainChange(value){
	log.innerText +="right gain:"
	log.innerText +=value;
	log.innerText +="\n";
	gainR.gain.value = value;
}
