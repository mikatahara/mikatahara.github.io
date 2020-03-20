/* M x N の枠を書いて、それぞれにオン、オフできるトグルスイッチ */
function FToggleSW(ixo,ixa,iyo,iya,n,m){
	var i,j;
	this.cv=null;	//Canvas
	this.ctx=null; 	//Canvas Context

	this.ixo=ixo;
	this.ixa=ixa;
	this.iyo=iyo;
	this.iya=iya;

	this.yoko=n;
	this.tate=m;
	this.ixe=this.ixo+this.ixa*this.yoko;
	this.iye=this.iyo+this.iya*this.tate;

	this.toggle=Array(this.yoko);
	for(i=0; i<this.yoko; i++) this.toggle[i]=Array(this.tate);
	for(i=0; i<this.yoko; i++) for(j=0; j<this.tate; j++) this.toggle[i][j]=0;
}

FToggleSW.prototype={
	fSetCanvas : function(canvas) {
		this.cv=canvas;
		this.ctx = this.cv.getContext('2d');
		this.cv.addEventListener('click', this.fMouseClick.bind(this),false);
	},

	fDraw : function(){
		var i,j;
		for(j=0,iy=this.iyo; j<this.tate; j++){
			for(i=0,ix=this.ixo; i<this.yoko; i++){
				this.ctx.rect(ix, iy, this.ixa, this.iya);
				ix+=this.ixa;
			}
			iy+=this.iya;
		}
		this.ctx.stroke();

	},

	/* Mouse をクリックした時の挙動 */
	/* Mouse クリックの範囲は ixo->ixe, iyo->iye */
	fMouseClick : function(e){
		var ipx,ipy;
		var bt = e.target.getBoundingClientRect();
		mouseX = e.clientX - bt.left;
		mouseY = e.clientY - bt.top;
		ipx = Math.floor((mouseX - this.ixo)/this.ixa);
		ipy = Math.floor((mouseY - this.iyo)/this.iya);

		if(this.ixo < mouseX && mouseX < this.ixe){
			if(this.iyo < mouseY && mouseY < this.iye){

				if(this.toggle[ipx][ipy]==0){
					this.draw1(ipx,ipy);
					this.toggle[ipx][ipy]= 1;
				}else{
					this.clear(ipx,ipy);
					this.toggle[ipx][ipy]= 0;
				}
			}
		}
	},

	/* -------------------------------------------------------------------------- */
	/* 円を消す */
	clear : function(jp,jpy){
		this.ctx.clearRect(this.ixo+jp*this.ixa+1, this.iyo+jpy*this.iya+1, this.ixa-2, this.iya-2);
	},

	/* 円を描く */
	draw1 : function(jp,jpy) {
  		this.ctx.beginPath();
  		this.ctx.arc(this.ixo+jp*this.ixa+this.ixa/2, this.iyo+jpy*this.iya+this.iya/2, 10, 0, Math.PI*2, false);
  		this.ctx.stroke();
	}


}

ftg1 = new FToggleSW(100,120,100,24,4,3);
