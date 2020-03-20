/* SMF Decoder */

	var mTrack=null;	//Class of each Track
	var mNtrks=0;		//Number of Trucks
	var mQnotemsec=500;	//msec of Quater note
	var mDivision;		//Ticks of Quater note
	var mRate=1;		//msec of Ticks
	var mFormat;

/* ------------------------------------------------------------------------- */
/* Class Definition of Truck */

function MTrk(n, data){
	this.mTrnum=0;
	this.mLength=0;
	this.mData = null;
	this.mNexttime=0;
	this.mDeltatime=0;
	this.mEnd=0;

	this.mStatus=0;	//for MIDI
	this.mMdata1=0;	//for MIDI
	this.mMdata2=0;	//for MIDI
	this.mSysMessage=new Uint8Array(1024);	//for MIDI SysEx
	this.mSyslength=0	//System Exclusive message length;
	this.ipoint=0;	//for Read
}

MTrk.prototype={
	fPrint : function(ele) {
		for(i=0; i<this.mLength; i++){
			if(i%16==0) ele.textContent +="\n";
			ele.textContent += " 0x" + this.mData[i].toString(16) + ":";
		}
	},

	fGetFlag : function(){
		if( this.ipoint>=this.mLength ) return 0;	// end of truck
		else return 1;
	},

	fSetdata : function(length, data, n){
		this.mLength=length;
		this.mData = new Uint8Array(length);
		for(var i=0; i<length; i++) this.mData[i]=data[i+n];
	},

	fDeleteFF : function(){
		if(this.mEnd==1) return 0;
		var time=0;
		var ilocal=this.ipoint;
		if(ilocal>=this.mLength){ this.mEnd=1; return 0; }

		while(ilocal<this.mLength){
			time +=this.mData[ilocal]&0x7F;
			if( (this.mData[ilocal]&0x80) ==0 ){
				this.ipoint=ilocal+1;
				this.mDeltatime=time;
				this.mNexttime+=time;
				return time;
			}
			time <<=7;
			ilocal++;
		}
		return 0;
	},

	fEvent : function(){
		var ilocal=this.ipoint;
		if(this.mEnd==1) return 0;
		if(ilocal>=this.mLength){ this.mEnd=1; return 0; }

		if((this.mData[ilocal]&0x80)!=0 ){
			this.mStatus=this.mData[ilocal];
			ilocal++;
		}
		this.ipoint=ilocal;
		switch(this.mStatus&0xF0){
			case 0x80:
			case 0x90:
			case 0xA0:
			case 0xB0:
			case 0xE0:
				this.mMdata1=this.mData[ilocal]; ilocal++;
				this.mMdata2=this.mData[ilocal]; ilocal++;
				if(this.mMdata2>128){
					this.mMdata2=0;
				}
				break;
			case 0xC0:
			case 0xD0:
				this.mMdata1=this.mData[ilocal]; ilocal++;
				break;
			case 0xF0:
				ilocal=this.fGetMetaEvent(ilocal);
				break;
		}
		this.ipoint=ilocal;
	},

	fGetMetaEvent : function(st){
		if(this.mStatus==0xFF){
			var ilocal=st;
			var second=this.mData[ilocal];
			ilocal++;
			var len;
			switch(second){
				case 0x00:
					for(var j=0; j<3; j++) this.mSysMessage[j]=this.mData[ilocal+j];
					ilocal+=3;
					break;
				case 0x01:
				case 0x02:
				case 0x03:
				case 0x04:
				case 0x05:
				case 0x06:
				case 0x07:
				case 0x21:
				case 0x7F:
					len=this.mData[ilocal];
					ilocal++;
					for(var j=0; j<len; j++) this.mSysMessage[j]=this.mData[ilocal+j];
					ilocal+=len;
					break;
				case 0x20:
					for(var j=0; j<2; j++) this.mSysMessage[j]=this.mData[ilocal+j];
					ilocal+=2;
					break;
				case 0x2F:
					for(var j=0; j<1; j++) this.mSysMessage[j]=this.mData[ilocal+j];
					ilocal+=1;
					this.mEnd=1;
					break;
				case 0x51:
					for(var j=0; j<4; j++) this.mSysMessage[j]=this.mData[ilocal+j];
					ilocal+=4;
					mQnotemsec = ((((this.mSysMessage[1]<<8)+this.mSysMessage[2])<<8)+this.mSysMessage[3])/1000;
					mRate = mDivision/mQnotemsec;
					log.innerText += "Quarter note=";
					log.innerText += mQnotemsec;
					log.innerText += "ms\n";
//					console.log("mRate=",this.mTrnum,mRate,this.mNexttime);
					break;
				case 0x54:
					for(var j=0; j<6; j++) this.mSysMessage[j]=this.mData[ilocal+j];
					ilocal+=6;
					break;
				case 0x58:
					for(var j=0; j<5; j++) this.mSysMessage[j]=this.mData[ilocal+j];
					ilocal+=5;
					break;
				case 0x59:
					for(var j=0; j<3; j++) this.mSysMessage[j]=this.mData[ilocal+j];
					ilocal+=3;
					break;
			}

			switch(second){
				case 0x01:
				case 0x02:
				case 0x03:
				case 0x04:
				case 0x05:
						for(var j=0; j<len; j++){
							log.innerText +=String.fromCharCode(this.mSysMessage[j]);
						}
						log.innerText +="\n";
					break;
			}

			return(ilocal);
		} else if (this.mStatus==0xF0){
			var j=0;
			var ilocal=st;
			while(this.mData[ilocal+j]!=0xF7){
				this.mSysMessage[j]=this.mData[ilocal+j];
				j++;
			}
			this.mSyslength=j;
			this.mSysMessage[j]=0xF7; j++;
			ilocal+=j;
			return(ilocal);
		} else {
			return(st+1);
		}
	}
}

/* ------------------------------------------------------------------------- */

MThd= "MThd";	//ASCII Charactors of SMF File

//-- 	------------------------------------------------------------------	-->

window.addEventListener("load", function(){
	// use File API or not
	if (!window.File){
		ele.innerHTML = "No File API";
		return;
	}

	/* for log */
	var ele = document.getElementById("log");

	// Variable of File Reader object
	var reader;

	// Process of read click button
	document.getElementById("read").addEventListener("click", function(){
		var textFile = document.getElementById("filedata").files[0];

		// 選択されたファイル情報
		ele.innerText = "file name:";
		ele.innerText += textFile.name;
		ele.innerText += "\n";
		ele.innerText += "file size:";
		ele.innerText += textFile.size;
		ele.innerText += "byte\n";
		ele.innerText += "MIME Type：";
		ele.innerText += textFile.type;
		ele.innerText += "\n";
		ele.innerText += "---------------\n";

		// File reader process
		reader = new FileReader();

		reader.onload = function(evt){
			// Uint8Array Object
			var ary_u8 = new Uint8Array(evt.target.result);
			var n=0;

			if(!compchar(ary_u8, n, 4,"MThd")) return;
			n+=4;

			ele.textContent += "binary size=";
			ele.textContent += changeint(ary_u8,n,4);
			ele.textContent += "\n";
			n+=4;

			mFormat= changeint(ary_u8,n,2); n+=2;
			mNtrks= changeint(ary_u8,n,2); n+=2;
			mDivision= changeint(ary_u8,n,2); n+=2;
			ele.textContent += "format=";
			ele.textContent += mFormat;
			ele.textContent += " division=";
			ele.textContent += mDivision;
			ele.textContent += "\n";

			mTrack=new Array(mNtrks);
			for(var i=0; i<mNtrks; i++){
				mTrack[i]=new MTrk();
				mTrack[i].mTrnum=i;
			}
			var mlength=0;
			for(var i=0; i<mNtrks; i++){
				if(!compchar(ary_u8, n, 4,"MTrk")) return;
				n+=4;
				mlength = changeint(ary_u8,n,4);
				n+=4;
				mTrack[i].fSetdata(mlength,ary_u8,n);
				n+=mlength;
			}

			for(var i=0; i<mNtrks; i++){
				while(mTrack[i].mEnd==0){
					mTrack[i].fDeleteFF();
					mTrack[i].fEvent();
//					console.log(i,mTrack[i].mNexttime,mTrack[i].mStatus);
				}
			}

		}

		reader.onerror = function(evt){
			var errorNo = evt.target.error.code
			ele.innerHTML += "Error:"+errorNo;
		}

		reader.readAsArrayBuffer(textFile);

	}, true);

}, true);

//-- 	------------------------------------------------------------------	-->
/* Subroutine for reading SMF */
/* Compare Charactors */
	function compchar(buf,st,n,str)
	{
		var aaa= new String;
		for(var i=0; i<n; i++){
			aaa+=String.fromCharCode(buf[i+st]);
		}
		if(aaa==str) return 1;
		else return 0;
	}

/* Compare Charactors */
	function changeint(buf, st, m)
	{
		var n=0;
		for(var i=0; i<m; i++){
			n<<=8;
			n+=buf[st+i];
		}
		return n;
	}

//-- 	------------------------------------------------------------------	-->
// End of FILE
