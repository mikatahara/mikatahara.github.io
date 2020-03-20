//-- 	------------------------------------------------------------------	-->
// 選択したテキストファイルの内容を表示
window.addEventListener("load", function(){
	// 情報を表示する領域の要素
	var ele = document.getElementById("log");
	// 進捗状況を表示するプログレスバーの要素を特定
	var prog = document.getElementById("loadstatus");
	// ファイルを読み込むためのFile Readerオブジェクトを入れる変数
	var reader;
	// File APIが使えるか調べる
	if (!window.File){
		ele.innerHTML = "File APIが使用できません";
		return;
	}

	// 「保存する」ボタンがクリックされた時の処理
	document.getElementById("read").addEventListener("click", function(){
		var textFile = document.getElementById("filedata").files[0];
		// 選択されたファイル情報
		ele.innerText = "ファイル名：\n";
		ele.innerText += textFile.name;
		ele.innerText += "\n";
		ele.innerText += "ファイルサイズ：";
		ele.innerText += textFile.size;
		ele.innerText += " バイト\n";
		ele.innerText += "MIME Type：";
		ele.innerText += textFile.type;
		ele.innerText += "\n";
		ele.innerText += "---------------\n";

		// テキストかどうか調べる
		if (textFile.type.indexOf("text/") != 0){
			ele.innerText += "選択したファイルはテキスト形式ではありません\n";
			return;
		}
		// テキストファイルなら処理を行う
		reader = new FileReader();
		reader.onload = function(evt){
			var text = evt.target.result;
			exectext(text);
			var text = text.substr(0, 100);	// 先頭100文字だけ表示
			ele.textContent += text;
			
		}
		reader.onerror = function(evt){
			var errorNo = evt.target.error.code
			ele.innerText += "エラー発生："+errorNo;
		}
		reader.onabort = function(evt){
			ele.innerText += "読み込みが中断されました\n";
		}
		reader.onprogress = function(evt){
//			var loadData = evt.loaded;
//			var totalData = evt.total;
//			var per = (loadData/totalData) * 100;
//			per = per.toFixed(1);	// 小数点第一位までの表示にする
//			prog.innerHTML = per+"% ("+loadData+"/"+totalData+" バイト)";
//			prog.value = per;
		}
		reader.readAsText(textFile, "utf-8");
	}, true);

}, true);

function readfile(textFile)
{
	// テキストかどうか調べる
	if (textFile.type.indexOf("text/") != 0){
		console.log("選択したファイルはテキスト形式ではありません");
		return;
	}
	var reader = new FileReader();
	reader.onload = function(evt){
		var text = evt.target.result;
		exectext(text);
	}
	reader.onerror = function(evt){
		var errorNo = evt.target.error.code
		console.log("エラー発生："+errorNo);
	}
	reader.onabort = function(evt){
		console.log("読み込みが中断されました");
	}
	reader.onprogress = function(evt){
	}
	reader.readAsText(textFile, "utf-8");
}

//-- 	------------------------------------------------------------------	-->

	function download(blob, filename) {
		var objectURL = (window.URL || window.webkitURL).createObjectURL(blob),

// createElementはその名前の通り、エレメント(オブジェクト)を生成します。
// ここでのエレメントというのは、HTMLのタグのことです
		a = document.createElement('a');

// a要素のdownload属性にファイル名を設定
		a.download = filename;
		a.href = objectURL;

// 指定されたタイプの イベント を作成します。返されるオブジェクトは初めに初期
// 化する必要があり、その後で element.dispatchEvent へ渡すことができます。
		e = document.createEvent('MouseEvent');

// clickイベントを着火
// event.initMouseEvent(type, canBubble, cancelable, view,
//                      detail, screenX, screenY, clientX, clientY,
//                      ctrlKey, altKey, shiftKey, metaKey,
//                      button, relatedTarget);

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/initMouseEvent

		e.initEvent("click", true, true, window,
				1, 0, 0, 0, 0,
				false, false, false, false,
				0, null);

	a.dispatchEvent(e);
	}

function exportfile(){
	var fn=document.getElementById("file_name");
	var fname=fn.value;
	var dc=document.getElementById("doc_ment");
	var aaa=new Blob([dc.value]);
	download(aaa, fname);
}

/* 読み込んだtextの処理は、この関数と同じ名前の関数をhtmlの最後に書く*/

function exectext(text){
//	console.log(text);
}
