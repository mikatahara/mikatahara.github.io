
var mViews=["view1","view2","view3","view4","view5","view6","view7","view8"];

window.addEventListener('load', function (){

	document.onkeydown = keydown;
	document.onkeyup = keyup;

}, false);

function keydown(event) {

	var l_keycode=event.keyCode;

	switch(l_keycode){
		case 83:
		case 115:
			for(var i=0; i<8; i++) youtubeData[i].fStopVideo();
			break;
		case 80:
		case 112:
			for(var i=0; i<8; i++) youtubeData[i].fPlayVideo();
			break;
		case 49:
		case 50:
		case 51:
		case 52:
		case 53:
		case 54:
		case 55:
		case 56:
			yonview(l_keycode-49);
			break;
	}

/*
	switch(l_keycode){
		case 49:
			youtubeData[0].fPlayVideo();
			youtubeData[1].fPauseVideo();
			youtubeData[2].fPauseVideo();
			youtubeData[3].fPauseVideo();
			youtubeData[0].fUnmute();
			youtubeData[1].fMute();
			youtubeData[2].fMute();
			youtubeData[3].fMute();
	 		youtubeData[0].fOpacity(1.0);
			youtubeData[1].fOpacity(0.0);
			youtubeData[2].fOpacity(0.0);
			youtubeData[3].fOpacity(0.0);
//			document.getElementById("view1").style.opacity = 1.0;
//			document.getElementById("view2").style.opacity = 0.0;
//			document.getElementById("view3").style.opacity = 0.0;
//			document.getElementById("view4").style.opacity = 0.0;/
			break;
		case 50:
			youtubeData[1].fPlayVideo();
			youtubeData[0].fPauseVideo();
			youtubeData[2].fPauseVideo();
			youtubeData[3].fPauseVideo();
			youtubeData[1].fUnmute();
			youtubeData[0].fMute();
			youtubeData[2].fMute();
			youtubeData[3].fMute();
	 		youtubeData[1].fOpacity(1.0);
			youtubeData[0].fOpacity(0.0);
			youtubeData[2].fOpacity(0.0);
			youtubeData[3].fOpacity(0.0);
//			document.getElementById("view1").style.opacity = 0.0;
//			document.getElementById("view2").style.opacity = 1.0;
//			document.getElementById("view3").style.opacity = 0.0;
//			document.getElementById("view4").style.opacity = 0.0;
			break;
		case 51:
			youtubeData[2].fPlayVideo();
			youtubeData[0].fPauseVideo();
			youtubeData[1].fPauseVideo();
			youtubeData[3].fPauseVideo();
			youtubeData[2].fUnmute();
			youtubeData[0].fMute();
			youtubeData[1].fMute();
			youtubeData[3].fMute();
	 		youtubeData[2].fOpacity(1.0);
			youtubeData[0].fOpacity(0.0);
			youtubeData[1].fOpacity(0.0);
			youtubeData[3].fOpacity(0.0);
//			document.getElementById("view1").style.opacity = 0.0;
//			document.getElementById("view2").style.opacity = 0.0;
//			document.getElementById("view3").style.opacity = 1.0;
//			document.getElementById("view4").style.opacity = 0.0;
			break;
		case 52:
	 		youtubeData[3].fPlayVideo();
			youtubeData[0].fPauseVideo();
			youtubeData[1].fPauseVideo();
			youtubeData[2].fPauseVideo();
	 		youtubeData[3].fUnmute();
			youtubeData[0].fMute();
			youtubeData[1].fMute();
			youtubeData[2].fMute();
	 		youtubeData[3].fOpacity(1.0);
			youtubeData[0].fOpacity(0.0);
			youtubeData[1].fOpacity(0.0);
			youtubeData[2].fOpacity(0.0);
//			document.getElementById("view1").style.opacity = 0.0;
//			document.getElementById("view2").style.opacity = 0.0;
//			document.getElementById("view3").style.opacity = 0.0;
//			document.getElementById("view4").style.opacity = 1.0;
			break;
	}
*/
}

function yonview(n)
{
    if(n<0 || n>=8) return;
	for(var i=0; i<8; i++){
	    youtubeData[i].fPauseVideo();
	    youtubeData[i].fMute();
	    youtubeData[i].fOpacity(0.0);
		document.getElementById(mViews[i]).style.opacity = 0.0;
	}
    youtubeData[n].fPlayVideo();
	youtubeData[n].fOpacity(1.0);
	youtubeData[n].fUnmute();
	document.getElementById(mViews[n]).style.opacity = 1.0;
}


function keyup(event) 
{
}
