	var PlayerStateState = ["-1:unstarted", "0:ended", "1:playing", "2:paused", "3:buffering中", "5:video cued"];
	var tag = document.createElement('script');
	var firstScriptTag = document.getElementsByTagName('script')[0];
	var youtubeData = null;
	var mWidth;
	var mHeight;
	var mFlag=0;
	var mMaxV=8;

//window.onload = function()
function youtube_init()
{
	tag.src = "https://www.youtube.com/iframe_api";
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	youtubeData = new Array(mMaxV);

    var v1 = document.getElementById("id1").value;
    var v2 = document.getElementById("id2").value;
    var v3 = document.getElementById("id3").value;
    var v4 = document.getElementById("id4").value;
    var v5 = document.getElementById("id5").value;
    var v6 = document.getElementById("id6").value;
    var v7 = document.getElementById("id7").value;
    var v8 = document.getElementById("id8").value;

	youtubeData[0] = new YoutubePlayer(v1,"view1");
	youtubeData[1] = new YoutubePlayer(v2,"view2");
	youtubeData[2] = new YoutubePlayer(v3,"view3");
	youtubeData[3] = new YoutubePlayer(v4,"view4");
	youtubeData[4] = new YoutubePlayer(v5,"view5");
	youtubeData[5] = new YoutubePlayer(v6,"view6");
	youtubeData[6] = new YoutubePlayer(v7,"view7");
	youtubeData[7] = new YoutubePlayer(v8,"view8");

	mWidth = window.parent.screen.width;
	mHeight = window.parent.screen.height;

	var hoge = setInterval(function() {

		if(mFlag==8){
			clearInterval(hoge);
			for(var i=0; i<8; i++) youtubeData[i].fMute();
			youtubeData[3].fUnmute();
		}

	}, 400);

}

// サムネイルの埋め込み
function onYouTubeIframeAPIReady() {
	for(var i=0; i<mMaxV; i++){
		youtubeData[i].fEmbedYoutube();
	}

}


function YoutubePlayer(id,area)
{

	this.youtubeData = {
        youtubeIid:	id,
        embedArea:	area
	};

	this.ytPlayer=null;
    this.log = document.getElementById(area);
	this.area=area;
}

YoutubePlayer.prototype=
{
// YouTubeの埋め込みの準備
	fEmbedYoutube	: function() {
		// サムネイルクリックでYouTubeを埋め込むようにする
		this.ytPlayer = new YT.Player(
			this.youtubeData['embedArea'],					// 埋め込む場所の指定
			{
//		width: 960,		// プレーヤーの幅
                width:document.body.clientWidth,
				height: 720,	// プレーヤーの高さ
                disablekb:1,    //キーボード操作に応答しない
				videoId: this.youtubeData['youtubeIid'],	// YouTubeのID
				events: {
					'onReady': this.onPlayerReady,
					'onStateChange': this.onPlayerStateChange
				},
				playerVars: {
					loop: 1, 	// ループの設定
					playlist: this.youtubeData['youtubeIid'] // 再生する動画のリスト
				}
		});
	},

	onPlayerReady	:function (event) {
		event.target.playVideo();
		mFlag++;
	},
	
	onPlayerStateChange	:function(event) {
		if (event.data == YT.PlayerState.PLAYING) {

		} else if(event.data == YT.PlayerState.ENDED){
	
		}
	},

	fSetvideoID		:function (newid){
		if(this.youtubeData['youtubeIid']!=newid){
			this.youtubeData['youtubeIid']=newid;
			this.ytPlayer.stopVideo();
			this.ytPlayer.loadVideoById(newid);
//			this.ytPlayer.playVideo();
		}
	},

	fPlayVideo		:function(){
		this.ytPlayer.playVideo();
	},

	fStopVideo		:function() {
		this.ytPlayer.stopVideo();
	},

	fPauseVideo		:function() {
		this.ytPlayer.pauseVideo();
	},

	fVolume_up		:function()
	{
		var currentVol = this.ytPlayer.getVolume();
		currentVol+=10;
		if(currentVol>100) currentVol=100;
		this.ytPlayer.setVolume(currentVol);
	},

	fVolume_down	:function()
	{
		var currentVol = this.ytPlayer.getVolume();
		currentVol-=10;
		if(currentVol<0) currentVol=0;
		this.ytPlayer.setVolume(currentVol);
	},

	fSkip10			:function()
	{
		var currentTime = this.ytPlayer.getCurrentTime();
		this.ytPlayer.seekTo(currentTime + 10);
	},

	fSkipm10		:function()
	{
		var currentTime = this.ytPlayer.getCurrentTime();
		currentTime-=10;
		if(currentTime<0) currentTime=0;
		this.ytPlayer.seekTo(currentTime);
	},

	fSettime		:function( itime )
	{
		var videolength = this.ytPlayer.getDuration();
		if( itime > videolength ) itime = videolength;
		this.ytPlayer.seekTo( itime );
	},

	fMute		:function()
	{
		this.ytPlayer.mute();
	},

	fUnmute		:function()
	{
		this.ytPlayer.unMute();
	},

	fOpacity	:function(opa)
	{
		this.log=document.getElementById(this.area);
		this.log.style.opacity = opa; 
	}

//	fTimeChage	:function()
//	{
//		if (timeout_id) {
//			clearTimeout(timeout_id);
//			timeout_id=null;
//		}

//		var csecond = document.getElementsByName("inptime");
//		var ctime = csecond[0].valueAsNumber*60+csecond[1].valueAsNumber;
//		settime(ctime);
//	}

}

function setvideoID(){

	youtubeData[0].fSetvideoID(form1.id1.value)
	youtubeData[1].fSetvideoID(form1.id2.value)
	youtubeData[2].fSetvideoID(form1.id3.value)
	youtubeData[3].fSetvideoID(form1.id4.value)
	youtubeData[4].fSetvideoID(form1.id5.value)
	youtubeData[5].fSetvideoID(form1.id6.value)
	youtubeData[6].fSetvideoID(form1.id7.value)
	youtubeData[7].fSetvideoID(form1.id8.value)
}


