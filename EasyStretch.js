// ============================================================
//  EasyStretch.js  v1.0.0
//
//  Copyright (C) 2026 Dean Linic
//
//  Redistribution and use in source and binary forms, with or
//  without modification, is permitted provided that the source
//  code retains the above copyright notice.
//
//  EasyStretch is a PixInsight script for interactive
//  stretching of RGB/OSC astronomical images with live preview.
//
//  Features:
//    - Live preview at 1/4 resolution for fast response
//    - Blackpoint, General Stretch, Contrast
//    - Background, Midtones, Highlights adjustments
//    - Multi-layer stretching via Apply & Continue
//    - Image selector for multiple open windows
//    - Create New Photo output
// ============================================================

#feature-id    Utilities > EasyStretch
#feature-info  Interactive stretching for RGB/OSC images with live preview.<br/>\
               Supports multi-layer stretching via Apply and Continue.<br/>\
               <br/>\
               Copyright &copy; 2026 Dean Linic

#feature-icon  @script_icons_dir/EasyStretch.png

var EASYSTRETCH_VERSION = "1.0.0";

var G_TMP = null;

function cloneImg(src) {
   var d=new Image(src.width,src.height,src.numberOfChannels,
                   src.colorSpace,src.bitsPerSample,src.sampleType);
   d.assign(src); return d;
}

function ensureTmp(img) {
   if (G_TMP===null||G_TMP.isNull) {
      G_TMP=new ImageWindow(img.width,img.height,
         img.numberOfChannels,img.bitsPerSample,img.isReal,
         img.numberOfChannels>1,"_es_tmp_");
      G_TMP.hide();
   }
}

function runHT(img,lo,mid,hi) {
   lo=Math.max(0,Math.min(0.98,lo));
   hi=Math.max(lo+0.005,Math.min(1,hi));
   mid=Math.max(0.001,Math.min(0.999,mid));
   ensureTmp(img);
   G_TMP.mainView.beginProcess(0);
   G_TMP.mainView.image.assign(img);
   G_TMP.mainView.endProcess();
   var ht=new HistogramTransformation;
   ht.H=[[lo,mid,hi,0,1],[lo,mid,hi,0,1],[lo,mid,hi,0,1],[0,0.5,1,0,1],[lo,mid,hi,0,1]];
   ht.executeOn(G_TMP.mainView);
   img.assign(G_TMP.mainView.image);
}

function scaleImage(img,f) {
   var nw=Math.max(1,Math.round(img.width*f));
   var nh=Math.max(1,Math.round(img.height*f));
   var out=new Image(nw,nh,img.numberOfChannels,img.colorSpace,img.bitsPerSample,img.sampleType);
   out.assign(img); out.resample(f); return out;
}

// ============================================================
//  PROCESS
// ============================================================
function processImage(src, p) {
   var img = cloneImg(src);

   if (p.blackpoint > 0)
      runHT(img, p.blackpoint*0.15, 0.5, 1);

   if (p.stretch > 0) {
      var m = Math.pow(2, -(1+p.stretch*0.35));
      runHT(img, 0, Math.max(0.001,Math.min(0.49,m)), 1);
   }

   if (p.contrast !== 0) {
      var lo = p.contrast>0 ? p.contrast*0.03 : 0;
      var hi = p.contrast>0 ? 1 : 1+p.contrast*0.03;
      runHT(img, lo, 0.5, hi);
   }

   if (p.background !== 0) {
      var blo = p.background<0 ? -p.background*0.04 : 0;
      var bhi = p.background>0 ? 1-p.background*0.04 : 1;
      runHT(img, blo, 0.5, bhi);
   }

   if (Math.abs(p.midtones-0.5) > 0.001) {
      var mMid = 1.0-p.midtones;
      runHT(img, 0, Math.max(0.05,Math.min(0.95,mMid)), 1);
   }

   if (p.highlights < 0.49) {
      img.invert();
      var hStr = (0.5-p.highlights)*3.0;
      runHT(img, 0, Math.max(0.05,Math.min(0.45,0.5-hStr*0.08)), 1);
      img.invert();
   } else if (p.highlights > 0.51) {
      var hStr2 = (p.highlights-0.5)*3.0;
      runHT(img, 0.6, Math.max(0.05,Math.min(0.45,0.5-hStr2*0.08)), 1);
   }

   return img;
}

// ============================================================
//  RENDER — pixel loop on 25% preview image
// ============================================================
function renderBitmap(res, PW, PH) {
   var scaleW=PW/res.width, scaleH=PH/res.height;
   var scale=Math.min(scaleW,scaleH);
   var dw=Math.max(1,Math.round(res.width*scale));
   var dh=Math.max(1,Math.round(res.height*scale));
   var scaled=scaleImage(res,scale);

   var med=res.median(), lo, range;
   if (med>0.05) {
      lo=0; range=1.0;
   } else {
      var mad=res.MAD(); if(mad<1e-7) mad=0.001;
      var sigma=mad*1.4826;
      lo=Math.max(0,med-2.8*sigma);
      range=Math.min(1.0,med+20.0*sigma)-lo;
      if(range<0.0001) range=0.0001;
   }

   var bmp=new Bitmap(dw,dh);
   var ch=scaled.numberOfChannels;
   for(var y=0;y<dh;y++) {
      for(var x=0;x<dw;x++) {
         var r,g,b;
         if(ch===1) {
            var v=Math.min(1,Math.max(0,(scaled.sample(x,y,0)-lo)/range));
            r=g=b=Math.round(v*255);
         } else {
            r=Math.min(255,Math.max(0,Math.round((scaled.sample(x,y,0)-lo)/range*255)));
            g=Math.min(255,Math.max(0,Math.round((scaled.sample(x,y,1)-lo)/range*255)));
            b=Math.min(255,Math.max(0,Math.round((scaled.sample(x,y,2)-lo)/range*255)));
         }
         bmp.setPixel(x,y,(0xFF<<24)|(r<<16)|(g<<8)|b);
      }
   }
   return bmp;
}

// ============================================================
//  DIALOG
// ============================================================
function EasyStretchDialog() {
   this.__base__=Dialog;
   this.__base__();
   this.windowTitle="EasyStretch v"+EASYSTRETCH_VERSION;
   this.userResizable=true;

   var self=this;

   // Collect open image windows (exclude internal temp windows)
   var windows=ImageWindow.windows;
   this.imageWindows=[];
   for(var i=0;i<windows.length;i++){
      var w=windows[i];
      if(!w.isNull&&!w.mainView.isNull
         &&w.mainView.id.indexOf("_es_")<0
         &&w.mainView.id.indexOf("EasyStretch")<0){
         this.imageWindows.push(w);
      }
   }
   if(this.imageWindows.length===0){this.srcView=null;return;}

   this.srcWin =this.imageWindows[0];
   this.srcView=this.srcWin.mainView;
   this.origImg=cloneImg(this.srcView.image);
   this.busy=false;
   this.appliedLayers=0;

   var SCALE=0.25;
   this.SCALE=SCALE;
   this.previewImg=scaleImage(this.origImg,SCALE);
   ensureTmp(this.previewImg);

   this.p={blackpoint:0,stretch:5,contrast:0,
           background:0,midtones:0.5,highlights:0.5};

   // Canvas dimensions based on image aspect ratio
   var PW=820;
   var PH=Math.round(PW*this.origImg.height/this.origImg.width);
   if(PH>620){PH=620;PW=Math.round(PH*this.origImg.width/this.origImg.height);}
   this.PW=PW; this.PH=PH;
   this.previewBitmap=null;
   this.lastRes=null;

   this.canvas=new Control(this);
   this.canvas.setFixedSize(PW,PH);
   this.canvas.onPaint=function(){
      var g=new VectorGraphics(self.canvas);
      var cw=self.canvas.width, ch=self.canvas.height;
      g.fillRect(0,0,cw,ch,new Brush(0xFF111111));
      if(self.previewBitmap!==null){
         var bw=self.previewBitmap.width, bh=self.previewBitmap.height;
         g.drawBitmap(Math.max(0,Math.round((cw-bw)/2)),
                      Math.max(0,Math.round((ch-bh)/2)),
                      self.previewBitmap);
      }
      g.end();
   };

   // ── Slider helper ────────────────────────────────────────
   function mkSlider(lbl,lo,hi,def,prec,key){
      var label=new Label(self); label.text=lbl+":"; label.minWidth=160;
      var sld=new Slider(self); sld.minWidth=200; sld.setRange(0,500);
      var edt=new Edit(self); edt.readOnly=true; edt.minWidth=64; edt.maxWidth=64;
      function v2s(v){return Math.round((v-lo)/(hi-lo)*500);}
      function s2v(s){return lo+s/500*(hi-lo);}
      sld.value=v2s(def); edt.text=def.toFixed(prec);
      sld.onValueUpdated=function(s){
         var v=parseFloat(s2v(s).toFixed(prec));
         edt.text=v.toFixed(prec); self.p[key]=v; self.doRefresh();
      };
      var row=new Sizer(false); row.spacing=4;
      row.add(label); row.add(sld); row.add(edt);
      row.setValue=function(v){edt.text=v.toFixed(prec);sld.value=v2s(v);self.p[key]=v;};
      row.setEnabled=function(v){sld.enabled=v;edt.enabled=v;label.enabled=v;};
      return row;
   }
   function mkGroup(t){
      var g=new GroupBox(self); g.title=t;
      g.sizer=new Sizer(true); g.sizer.margin=6; g.sizer.spacing=5;
      return g;
   }

   // ── Image selector ───────────────────────────────────────
   var imgLbl=new Label(this); imgLbl.text="Image:"; imgLbl.minWidth=45;
   this.imgCombo=new ComboBox(this);
   for(var i=0;i<this.imageWindows.length;i++)
      this.imgCombo.addItem(this.imageWindows[i].mainView.id);
   this.imgCombo.currentItem=0;
   this.imgCombo.onItemSelected=function(idx){
      self.srcWin=self.imageWindows[idx];
      self.srcView=self.srcWin.mainView;
      self.origImg=cloneImg(self.srcView.image);
      self.previewImg=scaleImage(self.origImg,self.SCALE);
      if(G_TMP&&!G_TMP.isNull){G_TMP.forceClose();G_TMP=null;}
      ensureTmp(self.previewImg);
      self.appliedLayers=0;
      self.windowTitle="EasyStretch v"+EASYSTRETCH_VERSION;
      var nPW=820;
      var nPH=Math.round(nPW*self.origImg.height/self.origImg.width);
      if(nPH>620){nPH=620;nPW=Math.round(nPH*self.origImg.width/self.origImg.height);}
      self.PW=nPW; self.PH=nPH;
      self.canvas.setFixedSize(nPW,nPH);
      self.adjustToContents();
      self.doRefresh();
   };
   var imgRow=new Sizer(false); imgRow.spacing=6;
   imgRow.add(imgLbl); imgRow.add(this.imgCombo); imgRow.addStretch();

   // ── GROUP 1 — General Stretch ─────────────────────────────
   this.g1=mkGroup("1 · General Stretch");
   this.slBlackpoint=mkSlider("Blackpoint",      0,  1, 0,  3,"blackpoint");
   this.slStretch   =mkSlider("General Stretch", 0, 30, 5,  2,"stretch"   );
   this.slContrast  =mkSlider("Contrast",        -8, 8, 0,  2,"contrast"  );
   this.g1.sizer.add(this.slBlackpoint);
   this.g1.sizer.add(this.slStretch);
   this.g1.sizer.add(this.slContrast);

   // ── GROUP 2 — Background / Midtones / Highlights ─────────
   this.g2=mkGroup("2 · Background · Midtones · Highlights");
   this.slBackground=mkSlider("Background",                 -3,   3, 0,   3,"background");
   this.slMidtones  =mkSlider("Midtones  (L=dark R=light)", 0.02,0.98,0.5, 3,"midtones"  );
   this.slHighlights=mkSlider("Highlights (L=dark R=light)", 0.2, 0.8,0.5, 3,"highlights");
   this.g2.sizer.add(this.slBackground);
   this.g2.sizer.add(this.slMidtones);
   this.g2.sizer.add(this.slHighlights);

   // ── BUTTONS ───────────────────────────────────────────────
   this.btnReset=new PushButton(this);
   this.btnReset.text="↺  Reset";
   this.btnReset.toolTip="Reset all sliders to default values.";
   this.btnReset.onClick=function(){
      self.slBlackpoint.setValue(0); self.slStretch.setValue(5);
      self.slContrast.setValue(0);   self.slBackground.setValue(0);
      self.slMidtones.setValue(0.5); self.slHighlights.setValue(0.5);
      self.doRefresh();
   };

   this.btnApply=new PushButton(this);
   this.btnApply.text="▶  Apply & Continue";
   this.btnApply.toolTip=
      "Bake current parameters into the image and reset sliders.\n"+
      "Use this for multi-layer stretching, like GHS apply.";
   this.btnApply.onClick=function(){
      self.previewImg=processImage(self.previewImg,self.p);
      self.origImg=processImage(self.origImg,self.p);
      self.appliedLayers++;
      self.slBlackpoint.setValue(0); self.slStretch.setValue(0);
      self.slContrast.setValue(0);   self.slBackground.setValue(0);
      self.slMidtones.setValue(0.5); self.slHighlights.setValue(0.5);
      if(G_TMP&&!G_TMP.isNull){G_TMP.forceClose();G_TMP=null;}
      ensureTmp(self.previewImg);
      self.windowTitle="EasyStretch v"+EASYSTRETCH_VERSION+
                       "  [layer "+self.appliedLayers+"]";
      self.doRefresh();
   };

   this.btnCreate=new PushButton(this);
   this.btnCreate.text="✅  Create New Photo";
   this.btnCreate.toolTip=
      "Apply all parameters and create a new image window.\n"+
      "The original image is not modified.";
   this.btnCreate.onClick=function(){
      if(G_TMP&&!G_TMP.isNull){G_TMP.forceClose();G_TMP=null;}
      ensureTmp(self.origImg);
      var res=processImage(self.origImg,self.p);
      var nid=self.srcView.id+"_EasyStretch";
      var nw=new ImageWindow(res.width,res.height,res.numberOfChannels,
         res.bitsPerSample,res.isReal,res.numberOfChannels>1,nid);
      nw.mainView.beginProcess(0);
      nw.mainView.image.assign(res);
      nw.mainView.endProcess();
      nw.show(); nw.bringToFront();
      if(G_TMP&&!G_TMP.isNull){G_TMP.forceClose();G_TMP=null;}
      ensureTmp(self.previewImg);
   };

   this.btnClose=new PushButton(this);
   this.btnClose.text="Close";
   this.btnClose.onClick=function(){
      if(G_TMP&&!G_TMP.isNull) G_TMP.forceClose();
      self.cancel();
   };

   var btnRow=new Sizer(false); btnRow.spacing=6;
   btnRow.add(this.btnReset);
   btnRow.add(this.btnApply);
   btnRow.addStretch();
   btnRow.add(this.btnCreate);
   btnRow.add(this.btnClose);

   // ── LAYOUT ────────────────────────────────────────────────
   var rightPanel=new Sizer(true); rightPanel.spacing=8;
   rightPanel.add(imgRow);
   rightPanel.add(this.g1);
   rightPanel.add(this.g2);
   rightPanel.addStretch();
   rightPanel.add(btnRow);

   var mainRow=new Sizer(false); mainRow.spacing=8;
   mainRow.add(this.canvas);
   mainRow.add(rightPanel);

   this.sizer=new Sizer(true);
   this.sizer.margin=8;
   this.sizer.add(mainRow);

   this.adjustToContents();
   this.doRefresh();
}

EasyStretchDialog.prototype=new Dialog;

EasyStretchDialog.prototype.doRefresh=function(){
   if(this.busy) return;
   this.busy=true;
   try{
      this.lastRes=processImage(this.previewImg,this.p);
      this.previewBitmap=renderBitmap(this.lastRes,this.PW,this.PH);
      this.canvas.repaint();
   }catch(e){Console.writeln("Error: "+e);}
   this.busy=false;
};

function main(){
   Console.hide();
   if(Parameters.isViewTarget){
      // Called from Process container — not supported
      Console.criticalln("EasyStretch must be run as a Script, not a Process.");
      return;
   }
   var dlg=new EasyStretchDialog();
   if(!dlg.srcView){
      Console.criticalln("EasyStretch: No open images found. Please open an image first.");
      return;
   }
   dlg.execute();
}

main();
