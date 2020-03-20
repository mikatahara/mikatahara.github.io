/*	------------------------------------------------------------------------ */
/* MIDI Patch を実現する */
{

	var numMidiIn=0;
	var numMidiOut=0;
	var ftg1=null;	/* Input が縦、Outputが横のテーブル MIDI In to Out*/
	var ftg2=null;	/* Input が縦、Outputが横のテーブル System Realtime On/Off*/
	var icount=0;	/* 表示のリターン用*/
	var BrowserOut=0;
	var idi= new Array(16);
	for(var i=0; i<16; i++) idi[i]=-1;

	/* MIDI APIを起こす */
	function runPatch()
	{
		if (!log) log = document.getElementById("log");
		navigator.requestMIDIAccess( { sysex: true } ).then( successPatch, failure );
	}

	function successPatch(midiAccess)
	{
		var i=0;
		m=midiAccess;

		if (typeof m.inputs === "function") {
			inputs=m.inputs();
			outputs=m.outputs();
		} else {
			var inputIterator = m.inputs.values();
			inputs = [];
			for (var o = inputIterator.next(); !o.done; o = inputIterator.next()) {
				inputs.push(o.value)
			}

			var outputIterator = m.outputs.values();
			outputs = [];
			for (var o = outputIterator.next(); !o.done; o = outputIterator.next()) {
				outputs.push(o.value)
			}
		}

		if(input_menu_id!=null) setInputDeviceSelect();
		if(output_menu_id!=null) setOutputDeviceSelect();

		if(m!=null){						//MIDIが使える場合
			numMidiIn = inputs.length;		//MIDI Input の数
			numMidiOut = outputs.length;	//MIDI Outputの数

			log.font = "12pt Arial";

			log.innerText = "MIDI ready!";
			log.innerText +="\n";
			log.innerText +="--------------------------------\n";
			log.innerText +="input_device=";
			log.innerText += numMidiIn;
			log.innerText +="\n";

			for(i=0; i<numMidiIn; i++){
				log.innerText +="[";
				log.innerText +=i;
				log.innerText +="]";
				log.innerText +=inputs[i].name;
				log.innerText +="\n";
				log.innerText +=" - connection/";
				log.innerText +=inputs[i].connection;
				log.innerText +=" id/";
				log.innerText +=inputs[i].id;
				log.innerText +=" state/";
				log.innerText +=inputs[i].state;
				log.innerText +=" version/";
				log.innerText +=inputs[i].version;
				log.innerText +="\n";
			}

			log.innerText +="--------------------------------\n";
			log.innerText +="output_device=";
			log.innerText += numMidiOut;
			log.innerText +="\n";

			for(i=0; i<numMidiIn; i++){
				log.innerText +="[";
				log.innerText +=i;
				log.innerText +="]";
				log.innerText +=outputs[i].name;
				log.innerText +="\n";
				log.innerText +=" - connection/";
				log.innerText +=outputs[i].connection;
				log.innerText +=" id/";
				log.innerText +=outputs[i].id;
				log.innerText +=" state/";
				log.innerText +=outputs[i].state;
				log.innerText +=" version/";
				log.innerText +=outputs[i].version;
				log.innerText +="\n";
			}

			/* MIDI In の入力ポート、Fmidiinを生成する */ 
			for(i=0; i<numMidiIn; i++){
				inputs[i].onmidimessage =handleMIDIMessage2;
				idi[inputs[i].id]=i;
			}
		}

		guiInit();	//GUIの初期化

//		alert( "OK MIDI が使えます" );
	}

/* -------------------------------------------------------------------------- */
/*	MIDI を受けた時の挙動 */
	function handleMIDIMessage2(event) {
		var str=null;
		var i,k;
		var jd;
		if( event.data.length>1) {
			log.innerText +="*";
			icount++;
			if(icount>47){ icount=0; log.innerText +="\n"; }
			jd=idi[this.id];
			if(jd!=-1) goMidiOut(jd,event);
		}
	}

	function goMidiOut(id,event){
		var i;

		if( event.data[0]>=0xF8 ){	//System RealTime
			if( ftg2.toggle[id]==0 ) return;
		}

		/* MIDI 出力 */
		for(i=0; i<numMidiOut; i++){
			/* Flagの確認 */
			if(ftg1.toggle[i][id]==1){
				outputs[i].send(event.data);
			}
		}

	}

/*	------------------------------------------------------------------------ */
	/* フラグ用のバッファー */
	var toggle=null;

/*	------------------------------------------------------------------------ */
	/* GUI */
	var canvas	= null;
	var ctx		= null;
	
	var ixo		=240+100;		//四角の左上のＸの場所
	var iyo		=20+50;			//四角の左上のＸの場所
	var ixa		=120;			//一つの四角のＸの長さ
	var iya		=24;			//一つの四角のＹの長さ

	var jxo		=ixo-48;		//もう一つの四角のＸの場所

	var itxb	=jxo-ixa;		//左文字列のＸの場所
	var ityb	=iyo+10;		//左文字列のＹの場所
	var itln	=ixa-10;		//文字列の長さの最大

	var jtxb	=ixo+10;		//上文字列のＸの場所
	var jtyb	=iyo-20;		//上文字列のＹの場所

	var jtxb2	=jxo+4;			//F8表示の位置

	/* GUIの初期化 */
	function guiInit()
	{
		var i,j;
		var ix, iy;

		canvas	= document.getElementById('first');
		ctx		= canvas.getContext('2d');

		ctx.font = "10pt Arial";
	    ctx.textAlign = "left";		//start, end, left, right, center
		ctx.textBaseline = "middle"	//top, middle, bottom

		ftg1 = new FToggleSW(ixo,ixa,iyo,iya,numMidiOut,numMidiIn+1);
		ftg1.fSetCanvas(canvas);
		ftg1.fDraw();
	
		ftg2 = new FToggleSW(jxo,iya,iyo,iya,1,numMidiIn);
		ftg2.fSetCanvas(canvas);
		ftg2.fDraw();

		//MIDI In の名前を表示
		for(i=0; i<numMidiIn; i++){
			ctx.fillText(inputs[i].name, itxb, ityb+i*iya,itln);  
		}
		ctx.fillText("Browser", itxb, ityb+numMidiIn*iya,itln);  
		BrowserOut=numMidiIn;	//Browserの入力を、MidiInポートの次に設定

		//MIDI Outの名前を表示
		for(i=0; i<numMidiOut; i++){
			ctx.fillText(outputs[i].name, jtxb+i*ixa, jtyb,itln);  
//			ctx.fillText(outputs[i].name, jtxb+i*ixa, jtyb,itln);  
		}

		ctx.fillText("F8", jtxb2,jtyb,itln);
	}

	function sendmidifromBrowser()
	{
		var midievent=document.getElementById("doc_ment").value;
		var len=document.getElementById("doc_ment").textLength;
		var str;
		if(len==0) return;
		var sysex=Array(100);
		var j=0;
		for(var i=0; i<len; i++){
			str="0x";
			str+=midievent.substr(i,2);
			sysex[j]=parseInt(str);
			i+=2;
			j++;
		}
		sysex.length=j;

		/* MIDI 出力 */
		for(i=0; i<numMidiOut; i++){
			/* Flagの確認 */
			if(ftg1.toggle[outputs[i].id][BrowserOut]==1){
				outputs[i].send(sysex);
			}
		}

//		output.send(sysex);
		return;
	}
}
