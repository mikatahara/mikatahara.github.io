    // Find all transparent/opaque transitions between two points
    // Uses http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
function edges(ctx,p1,p2,cutoff){

	if (!cutoff) cutoff = 220; // alpha threshold

	var dx = Math.abs(p2.x - p1.x), dy = Math.abs(p2.y - p1.y),
	sx = p2.x > p1.x ? 1 : -1,  sy = p2.y > p1.y ? 1 : -1;
	var x0 = Math.min(p1.x,p2.x), y0=Math.min(p1.y,p2.y);
	var pixels = ctx.getImageData(x0,y0,dx+1,dy+1).data;
	var hits=[], over=null;
	
	for (x=p1.x,y=p1.y,e=dx-dy; x!=p2.x||y!=p2.y;){
		var alpha = pixels[((y-y0)*(dx+1)+x-x0)*4 + 3];
		if (over!=null && (over ? alpha<cutoff : alpha>=cutoff)){
			hits.push({x:x,y:y});
		}
		var e2 = 2*e;
		if (e2 > -dy){ e-=dy; x+=sx }
		if (e2 <  dx){ e+=dx; y+=sy  }
		over = alpha>=cutoff;
	}
	return hits;
}

function arrow(ctx,p1,p2,size){
	ctx.save();

	// Rotate the context to point along the path
	var dx = p2.x-p1.x, dy=p2.y-p1.y, len=Math.sqrt(dx*dx+dy*dy);
	ctx.translate(p2.x,p2.y);
	ctx.rotate(Math.atan2(dy,dx));

	// line
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo(-len,0);
	ctx.closePath();
	ctx.stroke();

	// arrowhead
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo(-size,-size);
	ctx.lineTo(-size, size);
	ctx.closePath();
	ctx.fill();

	ctx.restore();
}

/* Draw Graph Constructor */

function DrawGraph(iWxs,iWxe,iWys,iWye){

	var i,j;
	this.cv=null;	//Canvas
	this.ctx=null; 	//Canvas Context

	//Window lefttop(Wxs,Wys) - Right Bottom(Wxe,Wye)
	//Normally Wye > Wys
	this.iWxs=iWxs;
	this.iWxe=iWxe;
	this.iWys=iWys;
	this.iWye=iWye;
	this.iWxw=iWxe-iWxs;
	this.iWyh=Math.abs(iWye-iWys);

	this.iVxs=0.0;
	this.iVxe=1024.0;
	this.iVys=-10.0;
	this.iVye=1.0;

	this.fAx = (this.iWxe-this.iWxs)/(this.iVxe-this.iVxs);
	this.fBx = this.iWxs-this.fAx*this.iVxs;
	this.fAy = (this.iWye-this.iWys)/(this.iVye-this.iVys);	/* This value is pulse */
	this.fBy = this.iWye-this.fAy*this.iVys;

	this.log=0;
	this.dxw = new Array();
	this.img = new Image();

	this.iPx=0;		/* window 座標 */
	this.iPy=0;		/* window 座標 */

	this.iVx=0;		/* viewport 座標 */
	this.iVy=0;		/* viewport 座標 */

	this.mcX = 0;	/* mouse axis */
	this.mcY = 0;	/* mouse axis */
	this.mMf = 0;	/* mouse flag 1:Down 0:Up */

	this.tmp=0;
}

DrawGraph.prototype={
	/* *******************************************	*/
	/*	Canvas の設定				 				*/
	/* *******************************************	*/
	fSetCanvas : function(canvas) {
		this.cv=canvas;
		this.ctx = this.cv.getContext('2d');
//		this.cv.addEventListener('click', this.fMouseClick.bind(this),false);
		this.cv.addEventListener('mousedown', this.fMouseClick.bind(this),false);
		this.cv.addEventListener('mouseup', this.fMouseUp.bind(this),false);
		this.cv.addEventListener('mousemove', this.fMouseMove.bind(this),false);
	},

	fSetCanvasX : function(canvas) {
		this.cv=canvas;
		this.ctx = this.cv.getContext('2d');
//		this.cv.addEventListener('click', this.fMouseClick.bind(this),false);
		this.cv.addEventListener('mousedown', this.fMouseClick.bind(this),false);
		this.cv.addEventListener('mouseup', this.fMouseUp.bind(this),false);
		this.cv.addEventListener('mousemove', this.fMouseMove.bind(this),false);

		this.iWxs=0;
		this.iWxe=this.cv.clientWidth;
		this.iWys=0;
		this.iWye=this.cv.clientHeight;
		this.fCalcCoef();

		this.cv.width=this.iWxe;
		this.cv.height=this.iWye;
	},

	/* *******************************************	*/
	/*	viewport 座標設定			 				*/
	/* *******************************************	*/
	fSetViewPort: function(iVxs,iVxe,iVys,iVye){
		this.iVxs=iVxs;
		this.iVxe=iVxe;
		this.iVys=iVys;
		this.iVye=iVye;
		this.fCalcCoef();
	},

//add 2015/8/22
	fSetViewPortX: function(iVxs,iVxe){
		this.iVxs=iVxs;
		this.iVxe=iVxe;
		this.fCalcCoef();
	},

	/* *******************************************	*/
	/*	window 座標設定			 					*/
	/* *******************************************	*/
	fSetWindowXY: function(iWxs,iWxe,iWys,iWye){
		this.iWxs=iWxs;
		this.iWxe=iWxe;
		this.iWys=iWys;
		this.iWye=iWye;
		this.iWxw=iWxe-iWxs;
		this.iWyh=Math.abs(iWye-iWys);
		this.fCalcCoef();
	},


	/* *******************************************	*/
	/*	viewport 座標を window 座標に 				*/
	/* 	変換するための係数計算						*/
	/* *******************************************	*/
	fCalcCoef: function(){
		this.fAx = (this.iWxe-this.iWxs)/(this.iVxe-this.iVxs);
		this.fBx = this.iWxs-this.fAx*this.iVxs;
		this.fAy = -(this.iWye-this.iWys)/(this.iVye-this.iVys);
		this.fBy = this.iWye-this.fAy*this.iVys;
	},

	/* *******************************************	*/
	/*	viewport 座標を window 座標に変換 			*/
	/* *******************************************	*/
	fConvWPos: function(x,y){ this.fConvPos(x,y); },
	fConvPos: function(x,y){
		if(y<this.iVys) y=this.iVys;
		if(y>this.iVye) y=this.iVye;
		this.iPx = Math.floor(this.fAx*x+this.fBx);
		this.iPy = Math.floor(this.fAy*y+this.fBy);
	},

	/* *******************************************	*/
	/*	viewport 座標を Viewport 座標に変換 		*/
	/* *******************************************	*/
	fConvVPos: function(x,y){
		this.iVx = (x-this.fBx)/this.fAx;
		this.iVy = (y-this.fBy)/this.fAy;
	},

	/* *******************************************	*/
	/*	Mouseをクリックした位置の座標を表示			*/
	/*	Mouseの座標は、mcX, mcYに保存				*/
	/* *******************************************	*/
	fMouseClick: function(e){
		var mouseX,mouseY;
		var rect = e.target.getBoundingClientRect();
		mouseX = e.clientX-rect.left;
		mouseY = e.clientY-rect.top;
		mouseX*=this.cv.width/this.cv.clientWidth
		mouseY*=this.cv.height/this.cv.clientHeight;
		mouseX=Math.floor(mouseX);
		mouseY=Math.floor(mouseY);

		this.mcX = mouseX;
		this.mcY = mouseY;
		this.fConvVPos(this.mcX,this.mcY);	//Viewport座標に変換
		this.mMf=1;
		goAnimation();
	},


	/* *******************************************	*/
	/*	Mouseをアップした位置の座標を表示			*/
	/*	Mouseの座標は、mcX, mcYに保存				*/
	/* *******************************************	*/
	fMouseUp: function(e){
		var mouseX,mouseY;
		if (!log) log = document.getElementById("log");
		var rect = e.target.getBoundingClientRect();
		mouseX = e.clientX-rect.left;
		mouseY = e.clientY-rect.top;
		mouseX*=this.cv.width/this.cv.clientWidth
		mouseY*=this.cv.height/this.cv.clientHeight;
		mouseX=Math.floor(mouseX);
		mouseY=Math.floor(mouseY);

		this.mcX = mouseX;
		this.mcY = mouseY;
		this.fConvVPos(this.mcX,this.mcY);	//Viewport座標に変換
		this.mMf=0;
		goMouseUp();
	},

	/* *******************************************	*/
	/*	Mouseをドラッグした位置の座標を表示			*/
	/*	Mouseの座標は、mcX, mcYに保存				*/
	/* *******************************************	*/
	fMouseMove: function(e){
		if(this.mMf==0) return;

		var mouseX,mouseY;
		var rect = e.target.getBoundingClientRect();
		mouseX = e.clientX-rect.left;
		mouseY = e.clientY-rect.top;
		mouseX*=this.cv.width/this.cv.clientWidth
		mouseY*=this.cv.height/this.cv.clientHeight;
		mouseX=Math.floor(mouseX);
		mouseY=Math.floor(mouseY);

		this.mcX = mouseX;
		this.mcY = mouseY;
		this.fConvVPos(this.mcX,this.mcY);	//Viewport座標に変換
		goMouseMove();
	},

	/* *******************************************	*/
	/*	枠を残して窓内を消去						*/
	/* *******************************************	*/
	fClearWindowInside: function(){
		this.ctx.clearRect(this.iWxs+1,Math.min(this.iWys,this.iWye)+1,this.iWxw-2,this.iWyh-2);
	},

	/* *******************************************	*/
	/*	Canvas全体を消去							*/
	/* *******************************************	*/
	fClearWindowAll: function(){
		this.ctx.clearRect(this.iWxs,Math.min(this.iWys,this.iWye),this.iWxw,this.iWyh);
	},

	/* *******************************************	*/
	/*	Imageを貼り付ける							*/
	/* *******************************************	*/
	fDrawImage: function(d,x,y){
		this.ctx.drawImage(d,x,y);
	},

	fDrawImageW: function(d,x,y,w,h){
		this.ctx.drawImage(d,x,y,w,h);
	},

	/* *******************************************	*/
	/*				文字を記入	 					*/
	/*	Window (x,y)								*/
	/*	fVWriteText("abcdef",x,y)					*/
	/* *******************************************	*/
	fWriteText: function(d,x,y){
		this.ctx.textAlign = "start";
		this.ctx.fillText(d, x, y);
	},

	/* *******************************************	*/
	/*				文字を記入	 					*/
	/*	View Port (vxs,vys)							*/
	/*	fVWriteText("abcdef",vxs,vxy)				*/
	/* *******************************************	*/
	fVWriteText: function(d,vxs, vys){
		this.ctx.textAlign = "start";
		this.fConvPos(vxs, vys);
		this.ctx.fillText(d, this.iPx, this.iPy);
	},

	/* *******************************************	*/
	/*				Window の枠を描く				*/
	/* *******************************************	*/
	fStrokeRect: function(){
		this.ctx.fillStyle = "rgb(200, 0, 0)";
		this.ctx.strokeRect(this.iWxs, this.iWys, this.iWxe-this.iWxs, this.iWye-this.iWys);
	},

	/* *******************************************	*/
	/*					四角形を描く 				*/
	/* View Port (vxs,vys) -> (vxe,vye) の四角を描く*/
	/* *******************************************	*/
	fVRect: function(vxs,vys,vxe,vye){
		this.fConvPos(vxs, vys);
		var xs = this.iPx;
		var ys = this.iPy;
		this.fConvPos(vxe, vye);
		var xd = this.iPx-xs;
		var yd = this.iPy-ys;
		this.ctx.strokeRect(xs, ys, xd, yd);
	},

	/* *******************************************	*/
	/*					四角形を描く 				*/
	/* View Port (vxs,vys) -> (vxe,vye) の四角を描く*/
	/* 四角形を color で塗りつぶす					*/
	/* *******************************************	*/
	fVFillRect: function(vxs,vys,vxe,vye,color){
		this.fConvPos(vxs, vys);
		var xs = this.iPx;
		var ys = this.iPy;
		this.fConvPos(vxe, vye);
		var xd = this.iPx-xs;
		var yd = this.iPy-ys;
		this.ctx.fillStyle = color;
		this.ctx.fillRect(xs, ys, xd, yd);
	},

	/* *******************************************	*/
	/*					線を引く 					*/
	/* View Port (vxs,vys) -> (vxe,vye) に線を引く	*/
	/* *******************************************	*/
	fVLine: function(vxs,vys,vxe,vye){
		this.ctx.beginPath();
		this.fConvPos(vxs, vys);
		this.ctx.moveTo(this.iPx, this.iPy);
		this.fConvPos(vxe, vye);
		this.ctx.lineTo(this.iPx, this.iPy);
		this.ctx.stroke();
	},

	fLine: function(xs,ys,xe,ye){
		this.ctx.beginPath();
		this.ctx.moveTo(xs, ys);
		this.ctx.lineTo(xe, ye);
		this.ctx.stroke();
	},

	fFillColor: function(e){
		this.ctx.fillStyle = this.ctx.strokeStyle = e;
	},

	/* *******************************************	*/
	/* キャンバスを、Windowのサイズに広げる			*/
	/* *******************************************	*/

	fResize: function(){
		this.cv.height = window.innerHeight;
		this.cv.width = window.innerWidth;
	},

	fResizeX: function(){
		this.cv.width = window.innerWidth;
		this.cv.height = window.innerHeight;
		this.fSetWindowXY(0,this.cv.width,0,this.cv.height);
	},

	fDrawLine: function(d){
		this.fSetViewPortX( 0, d.length);
		this.ctx.beginPath();
		this.fConvPos(0,d[0]);
		this.ctx.moveTo(this.iPx, this.iPy);
		for(var i=0; i<d.length; i++){
			this.fConvPos(i,d[i]);
			this.ctx.lineTo(this.iPx, this.iPy);
		}
		this.ctx.stroke();
	},

	fDrawLineSize: function(d,size){
		this.fSetViewPortX( 0, size);
		this.ctx.beginPath();
		this.fConvPos(0,d[0]);
		this.ctx.moveTo(this.iPx, this.iPy);
		for(var i=0; i<size; i++){
			this.fConvPos(i,d[i]);
			this.ctx.lineTo(this.iPx, this.iPy);
		}
		this.ctx.stroke();
	},

	fDrawLineXY: function(d,size){
		this.ctx.beginPath();
		this.fConvPos(d[0][0],d[0][1]);
		this.ctx.moveTo(this.iPx, this.iPy);
		for(var i=0; i<size; i++){
			this.fConvPos(d[i][0],d[i][1]);
			this.ctx.lineTo(this.iPx, this.iPy);
		}
		this.ctx.stroke();
	},

	/* *******************************************	*/
	/* 点線を引く	Window 座標						*/
	/* *******************************************	*/
	fStrokeDottedLine: function (p1x, p1y, p2x, p2y) {
		var d = Math.sqrt(Math.pow(p2x - p1x, 2) + Math.pow(p2y - p1y, 2));
		var rad = Math.atan2(p2y - p1y, p2x - p1x);
		var space = 5;
		var dotted = Math.round(d / space / 2);

		for (var i = 0; i < dotted; i++) {
			var p3x = Math.cos(rad) * space * (i * 2) + p1x;
			var p3y = Math.sin(rad) * space * (i * 2) + p1y;
			var p4x = Math.cos(rad) * space * (i * 2 + 1) + p1x;
			var p4y = Math.sin(rad) * space * (i * 2 + 1) + p1y;

			this.ctx.beginPath();
			this.ctx.moveTo(p3x, p3y);
			this.ctx.lineTo(p4x, p4y);
			this.ctx.stroke();
			this.ctx.closePath();
		}
	},

	/* Viewport 座標								*/
	/* グラフ座標系で点線を描く						*/

	fVStrokeDottedLine: function(vxs,vys,vxe,vye){
		this.fConvPos(vxs, vys);
		var ixs = this.iPx;
		var iys = this.iPy;
		this.fConvPos(vxe, vye);
		var ixe = this.iPx;
		var iye = this.iPy;
		this.fStrokeDottedLine(ixs,iys,ixe,iye);
	},

	/* *******************************************	*/
	/* Window座標系で円を描く */
	/* *******************************************	*/
	fDrawArc: function(xc,yc,radix){
		this.ctx.beginPath();
  		this.ctx.arc(xc, yc, radix, 0, Math.PI*2, false);
  		this.ctx.fill();
	},

	/* *******************************************	*/
	/* グラフ座標系で円を描く */
	/* *******************************************	*/
	fDrawArcXY: function(x,y,radix){
		this.ctx.beginPath();
		this.fConvPos(x,y);
  		this.ctx.arc(this.iPx, this.iPy, radix, 0, Math.PI*2, false);
		this.ctx.fill();
	},

}

function goAnimation(){}
function goMouseUp(){}
function goMouseMove(){}
