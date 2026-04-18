// ============================================================
//  AstroMaxEasyStretchOSC.js  v1.2.0
//  Copyright (C) 2026 Dean Linic
//  RGB/OSC stretching — single preview with optional zoom
// ============================================================

#feature-id    Utilities > AstroMax Easy Stretch OSC
#feature-info  AstroMax Easy Stretch OSC — Interactive stretching for RGB/OSC images with live preview.<br/>

// ============================================================
//  LICENSE & TRIAL SYSTEM  (HWID-based, SHA-256 validation)
//  Trial: 30 days from first run, shared across all AstroMax scripts
//  Key:   sha256(HWID + "|ASTROMAX-V1|" + SECRET)[0..19] in 5x4 hex groups
// ============================================================
var LIC_PRODUCT_NAME = "AstroMaxEasyStretchOSC";
var LIC_SETTINGS_KEY = "/AstroMax/AstroMaxEasyStretchOSC/licenseKey";
var LIC_TRIAL_KEY    = "/AstroMax/trialStart";
var LIC_HWID_KEY     = "/AstroMax/hwid";
var LIC_TRIAL_DAYS   = 30;
var LIC_SECRET       = "AstroMax2025#Nebula$7x9qK!mP";

// ── Compact SHA-256 (pure JS, no dependencies) ─────────────
function licSHA256(str) {
   function rr(x,n){return(x>>>n)|(x<<(32-n));}
   var K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
          0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
          0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
          0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
          0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
          0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
          0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
          0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
   var H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,
          0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
   // UTF-8 encode
   var b=[];
   for(var i=0;i<str.length;i++){
      var c=str.charCodeAt(i);
      if(c<0x80)b.push(c);
      else if(c<0x800){b.push(0xC0|(c>>6));b.push(0x80|(c&0x3F));}
      else{b.push(0xE0|(c>>12));b.push(0x80|((c>>6)&0x3F));b.push(0x80|(c&0x3F));}
   }
   var bl=b.length*8;
   b.push(0x80);
   while(b.length%64!==56)b.push(0);
   for(var i=7;i>=0;i--)b.push((bl/Math.pow(2,i*8))&0xFF);
   // Process blocks
   for(var blk=0;blk<b.length;blk+=64){
      var W=[];
      for(var i=0;i<16;i++)
         W[i]=(b[blk+i*4]<<24)|(b[blk+i*4+1]<<16)|(b[blk+i*4+2]<<8)|b[blk+i*4+3];
      for(var i=16;i<64;i++){
         var s0=rr(W[i-15],7)^rr(W[i-15],18)^(W[i-15]>>>3);
         var s1=rr(W[i-2],17)^rr(W[i-2],19)^(W[i-2]>>>10);
         W[i]=(W[i-16]+s0+W[i-7]+s1)>>>0;
      }
      var a=H[0],b_=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
      for(var i=0;i<64;i++){
         var S1=rr(e,6)^rr(e,11)^rr(e,25);
         var ch=(e&f)^(~e&g);
         var t1=(h+S1+ch+K[i]+W[i])>>>0;
         var S0=rr(a,2)^rr(a,13)^rr(a,22);
         var mj=(a&b_)^(a&c)^(b_&c);
         var t2=(S0+mj)>>>0;
         h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b_;b_=a;a=(t1+t2)>>>0;
      }
      H[0]=(H[0]+a)>>>0;H[1]=(H[1]+b_)>>>0;H[2]=(H[2]+c)>>>0;H[3]=(H[3]+d)>>>0;
      H[4]=(H[4]+e)>>>0;H[5]=(H[5]+f)>>>0;H[6]=(H[6]+g)>>>0;H[7]=(H[7]+h)>>>0;
   }
   var hex="";
   for(var i=0;i<8;i++)hex+=("00000000"+H[i].toString(16)).slice(-8);
   return hex.toUpperCase();
}

// ── HWID — username + computername from env vars ───────────
function licGetHWID() {
   var user = getEnvironmentVariable("USERNAME") || getEnvironmentVariable("USER") || "";
   var host = getEnvironmentVariable("COMPUTERNAME") || getEnvironmentVariable("HOSTNAME") || "";
   var raw  = (user + "_" + host).toUpperCase().replace(/[^A-Z0-9_]/g,"");
   if (raw.length >= 4) {
      // Store once for consistency
      if (!Settings.read(LIC_HWID_KEY, 13))
         Settings.write(LIC_HWID_KEY, 13, raw);
      return raw;
   }
   // Fallback: random ID stored in settings
   var stored = Settings.read(LIC_HWID_KEY, 13);
   if (stored && stored.length >= 4) return stored;
   var id = ""; var hx = "0123456789ABCDEF";
   for (var i = 0; i < 16; i++) id += hx[Math.floor(Math.random()*16)];
   Settings.write(LIC_HWID_KEY, 13, id);
   return id;
}

// ── Key validation ─────────────────────────────────────────
function licKeyForHWID(hwid) {
   var hash = licSHA256(hwid.trim().toUpperCase() + "|ASTROMAX-V1|" + LIC_SECRET);
   var groups = [];
   for (var i = 0; i < 20; i += 4) groups.push(hash.substring(i, i+4));
   return groups.join("-");
}

function licValidateKey(key) {
   if (!key) return false;
   var hwid = licGetHWID();
   var expected = licKeyForHWID(hwid);
   return key.trim().toUpperCase().replace(/\s/g,"") === expected.replace(/-/g,"").substring(0,20)
          || key.trim().toUpperCase() === expected;
}

// ── Trial ──────────────────────────────────────────────────
function licTrialDaysLeft() {
   var stored = Settings.read(LIC_TRIAL_KEY, 13);
   if (stored === null || stored === undefined) {
      Settings.write(LIC_TRIAL_KEY, 13, new Date().getTime().toString());
      return LIC_TRIAL_DAYS;
   }
   var startMs = parseFloat(stored);
   if (isNaN(startMs)) {
      Settings.write(LIC_TRIAL_KEY, 13, new Date().getTime().toString());
      return LIC_TRIAL_DAYS;
   }
   return Math.max(0, Math.floor(LIC_TRIAL_DAYS - (new Date().getTime()-startMs)/86400000));
}

function licIsActivated() {
   var key = Settings.read(LIC_SETTINGS_KEY, 13);
   return licValidateKey(key);
}

function licCheck() {
   if (licIsActivated()) return "ok";
   var d = licTrialDaysLeft();
   return d > 0 ? "trial:" + d : "expired";
}

// ── License / Activation dialog (works for trial, expired, activated) ─
function licShowActivationDialog() {
   var hwid      = licGetHWID();
   var activated = licIsActivated();
   var daysLeft  = activated ? -1 : licTrialDaysLeft();

   var dlg = new Dialog();
   dlg.windowTitle = "AstroMax \u2014 License";
   dlg.userResizable = false;

   // Status line
   var statusTitleLbl = new Label(dlg);
   if (activated) {
      statusTitleLbl.text = "\u2705  License activated";
   } else if (daysLeft > 0) {
      statusTitleLbl.text = "\u23F3  Trial active \u2014 " + daysLeft + " day" + (daysLeft !== 1 ? "s" : "") + " remaining";
   } else {
      statusTitleLbl.text = "\u274C  Trial expired \u2014 activation required";
   }

   var msgLbl = new Label(dlg);
   msgLbl.text = "Send your HWID to the author together with proof of purchase.\nYou will receive a license key by email.";
   msgLbl.wordWrapping = true; msgLbl.minWidth = 380;

   // HWID display
   var hwidLbl = new Label(dlg);
   hwidLbl.text = "Your HWID:";
   var hwidEdit = new Edit(dlg);
   hwidEdit.text = hwid; hwidEdit.readOnly = true; hwidEdit.minWidth = 380;
   hwidEdit.toolTip = "Select all and copy (Ctrl+A, Ctrl+C)";

   // Key input — hide if already activated
   var keyLbl = new Label(dlg);
   keyLbl.text = activated ? "License key (activated):" : "Enter license key:";
   var keyEdit = new Edit(dlg); keyEdit.minWidth = 380;
   if (activated) {
      var storedKey = Settings.read(LIC_SETTINGS_KEY, 13);
      keyEdit.text = storedKey ? storedKey : "";
      keyEdit.readOnly = true;
   }

   var feedbackLbl = new Label(dlg);
   feedbackLbl.text = ""; feedbackLbl.minWidth = 380;

   // Buttons
   var btnActivate = new PushButton(dlg);
   btnActivate.text = activated ? "  Re-activate  " : "  Activate  ";
   btnActivate.enabled = !activated;
   btnActivate.onClick = function() {
      var k = keyEdit.text.trim();
      if (licValidateKey(k)) {
         Settings.write(LIC_SETTINGS_KEY, 13, k);
         feedbackLbl.text = "\u2705  Activated successfully! Close and reopen the script.";
         btnActivate.enabled = false;
         keyEdit.readOnly = true;
      } else {
         feedbackLbl.text = "\u274C  Invalid key \u2014 make sure you sent the exact HWID above.";
      }
   };

   var btnClose = new PushButton(dlg);
   btnClose.text = "Close";
   btnClose.onClick = function() { dlg.ok(); };

   var btnRow = new Sizer(false); btnRow.spacing = 6;
   if (!activated) btnRow.add(btnActivate);
   btnRow.addStretch(); btnRow.add(btnClose);

   dlg.sizer = new Sizer(true); dlg.sizer.margin = 14; dlg.sizer.spacing = 8;
   dlg.sizer.add(statusTitleLbl);
   dlg.sizer.add(msgLbl);
   dlg.sizer.add(hwidLbl);  dlg.sizer.add(hwidEdit);
   dlg.sizer.add(keyLbl);   dlg.sizer.add(keyEdit);
   dlg.sizer.add(feedbackLbl);
   dlg.sizer.add(btnRow);
   dlg.adjustToContents();
   return dlg.execute() === Dialog.Ok;
}

var EASYSTRETCH_VERSION = "1.2.0";
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

function processImage(src,p) {
   var img=cloneImg(src);
   if (p.blackpoint>0) runHT(img,p.blackpoint*0.15,0.5,1);
   if (p.stretch>0) {
      var m=Math.pow(2,-(1+p.stretch*0.35));
      runHT(img,0,Math.max(0.001,Math.min(0.49,m)),1);
   }
   if (p.contrast!==0) {
      var lo=p.contrast>0?p.contrast*0.03:0;
      var hi=p.contrast>0?1:1+p.contrast*0.03;
      runHT(img,lo,0.5,hi);
   }
   if (p.background!==0) {
      var blo=p.background<0?-p.background*0.04:0;
      var bhi=p.background>0?1-p.background*0.04:1;
      runHT(img,blo,0.5,bhi);
   }
   if (Math.abs(p.midtones-0.5)>0.001) {
      var mMid=1.0-p.midtones;
      runHT(img,0,Math.max(0.05,Math.min(0.95,mMid)),1);
   }
   if (p.highlights<0.49) {
      img.invert();
      var hStr=(0.5-p.highlights)*3.0;
      runHT(img,0,Math.max(0.05,Math.min(0.45,0.5-hStr*0.08)),1);
      img.invert();
   } else if (p.highlights>0.51) {
      var hStr2=(p.highlights-0.5)*3.0;
      runHT(img,0.6,Math.max(0.05,Math.min(0.45,0.5-hStr2*0.08)),1);
   }
   return img;
}

function normParams(img) {
   var med=img.median(), lo, range;
   if (med>0.05) { lo=0; range=1.0; }
   else {
      var mad=img.MAD(); if(mad<1e-7) mad=0.001;
      var s=mad*1.4826;
      lo=Math.max(0,med-2.8*s);
      range=Math.min(1.0,med+20.0*s)-lo;
      if(range<0.0001) range=0.0001;
   }
   return {lo:lo,range:range};
}

// Render full image into W x H bitmap
function renderFull(img,W,H) {
   var scale=Math.min(W/img.width,H/img.height);
   var dw=Math.max(1,Math.round(img.width*scale));
   var dh=Math.max(1,Math.round(img.height*scale));
   var sc=scaleImage(img,scale);
   var n=normParams(img);
   var bmp=new Bitmap(dw,dh);
   var ch=sc.numberOfChannels;
   for(var y=0;y<dh;y++) for(var x=0;x<dw;x++) {
      var r,g,b;
      if(ch===1){var v=Math.min(1,Math.max(0,(sc.sample(x,y,0)-n.lo)/n.range));r=g=b=Math.round(v*255);}
      else{r=Math.min(255,Math.max(0,Math.round((sc.sample(x,y,0)-n.lo)/n.range*255)));
           g=Math.min(255,Math.max(0,Math.round((sc.sample(x,y,1)-n.lo)/n.range*255)));
           b=Math.min(255,Math.max(0,Math.round((sc.sample(x,y,2)-n.lo)/n.range*255)));}
      bmp.setPixel(x,y,(0xFF<<24)|(r<<16)|(g<<8)|b);
   }
   return bmp;
}

// Render zoomed crop — pure pixel reads, no temp windows
function renderZoom(img,cx,cy,level,W,H) {
   var cw=1.0/level, ch=1.0/level;
   var x0=Math.max(0,Math.min(1-cw,cx-cw/2));
   var y0=Math.max(0,Math.min(1-ch,cy-ch/2));
   var sw=img.width, sh=img.height;
   var px0=Math.max(0,Math.min(sw-1,Math.round(x0*sw)));
   var py0=Math.max(0,Math.min(sh-1,Math.round(y0*sh)));
   var pw=Math.max(1,Math.round(cw*sw));
   var ph=Math.max(1,Math.round(ch*sh));
   var scale=Math.min(W/pw,H/ph);
   var dw=Math.max(1,Math.round(pw*scale));
   var dh=Math.max(1,Math.round(ph*scale));
   var n=normParams(img);
   var bmp=new Bitmap(dw,dh);
   var ich=img.numberOfChannels;
   for(var y=0;y<dh;y++){
      var sy=Math.max(0,Math.min(sh-1,py0+Math.round(y/scale)));
      for(var x=0;x<dw;x++){
         var sx=Math.max(0,Math.min(sw-1,px0+Math.round(x/scale)));
         var r,g,b;
         if(ich===1){var v=Math.min(1,Math.max(0,(img.sample(sx,sy,0)-n.lo)/n.range));r=g=b=Math.round(v*255);}
         else{r=Math.min(255,Math.max(0,Math.round((img.sample(sx,sy,0)-n.lo)/n.range*255)));
              g=Math.min(255,Math.max(0,Math.round((img.sample(sx,sy,1)-n.lo)/n.range*255)));
              b=Math.min(255,Math.max(0,Math.round((img.sample(sx,sy,2)-n.lo)/n.range*255)));}
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
   this.windowTitle="AstroMax Easy Stretch OSC v"+EASYSTRETCH_VERSION;
   this.userResizable=true;

   var self=this;

   var windows=ImageWindow.windows;
   this.imageWindows=[];
   for(var i=0;i<windows.length;i++){
      var w=windows[i];
      if(!w.isNull&&!w.mainView.isNull
         &&w.mainView.id.indexOf("_es_")<0
         &&w.mainView.id.indexOf("AstroMax")<0)
         this.imageWindows.push(w);
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

   this.lastRes=null;
   this.previewBitmap=null;
   this.zoomMode=false;   // false=full, true=zoomed
   this.zoomCX=0.5; this.zoomCY=0.5;
   this.zoomLevel=4;
   this.dragStart=null;
   this.dragRect=null;    // {x,y,w,h} in canvas pixels while dragging

   // Canvas size
   var PW=750;
   var PH=Math.round(PW*this.origImg.height/this.origImg.width);
   if(PH>600){PH=600;PW=Math.round(PH*this.origImg.width/this.origImg.height);}
   this.PW=PW; this.PH=PH;

   // ── Single canvas ────────────────────────────────────────
   this.canvas=new Control(this);
   this.canvas.setFixedSize(PW,PH);

   this.canvas.onPaint=function(){
      var g=new VectorGraphics(self.canvas);
      var cw=self.canvas.width, ch=self.canvas.height;
      g.fillRect(0,0,cw,ch,new Brush(0xFF111111));

      if(self.previewBitmap!==null){
         var bw=self.previewBitmap.width, bh=self.previewBitmap.height;
         var ox=Math.max(0,Math.round((cw-bw)/2));
         var oy=Math.max(0,Math.round((ch-bh)/2));
         g.drawBitmap(ox,oy,self.previewBitmap);

         // Draw drag rectangle while selecting zoom area
         if(!self.zoomMode && self.dragRect!==null){
            g.pen=new Pen(0xFFFFFF00,1);
            g.drawRect(self.dragRect.x, self.dragRect.y,
                       self.dragRect.x+self.dragRect.w,
                       self.dragRect.y+self.dragRect.h);
         }

         // In zoom mode show small crosshair only
         if(self.zoomMode){
            var label="Zoom "+self.zoomLevel+"x  —  click 'Reset Zoom' to go back";
            g.pen=new Pen(0xFFFFFF88,1);
            g.drawText(8,18,label);
         }
      }
      g.end();
   };

   // Mouse: drag rectangle to zoom in, only when NOT in zoom mode
   this.canvas.onMousePress=function(x,y,btn){
      if(self.zoomMode) return;
      self.dragStart={x:x,y:y};
      self.dragRect=null;
   };

   this.canvas.onMouseMove=function(x,y,btn){
      if(self.dragStart===null||self.zoomMode) return;
      self.dragRect={
         x:Math.min(self.dragStart.x,x),
         y:Math.min(self.dragStart.y,y),
         w:Math.abs(x-self.dragStart.x),
         h:Math.abs(y-self.dragStart.y)
      };
      self.canvas.repaint();
   };

   this.canvas.onMouseRelease=function(x,y,btn){
      if(self.zoomMode||self.dragStart===null) return;
      if(self.dragRect!==null && self.dragRect.w>15 && self.dragRect.h>15
         && self.previewBitmap!==null){
         // Convert drag rect to normalized image coords
         var bw=self.previewBitmap.width, bh=self.previewBitmap.height;
         var ox=Math.max(0,Math.round((self.PW-bw)/2));
         var oy=Math.max(0,Math.round((self.PH-bh)/2));
         var rx=(self.dragRect.x-ox)/bw;
         var ry=(self.dragRect.y-oy)/bh;
         var rw=self.dragRect.w/bw;
         var rh=self.dragRect.h/bh;
         // Center of rect
         self.zoomCX=Math.max(0,Math.min(1,rx+rw/2));
         self.zoomCY=Math.max(0,Math.min(1,ry+rh/2));
         // Choose zoom level based on rect size
         var avgSize=(rw+rh)/2;
         self.zoomLevel=avgSize<0.15?8:avgSize<0.35?4:2;
         self.btnZoomReset.enabled=true;
         self.zoomMode=true;
         self.updateLevelButtons();
         self.renderPreview();
      }
      self.dragStart=null; self.dragRect=null;
   };

   // ── Slider helper ────────────────────────────────────────
   function mkSlider(lbl,lo,hi,def,prec,key){
      var label=new Label(self); label.text=lbl+":"; label.minWidth=165;
      var sld=new Slider(self); sld.minWidth=190; sld.setRange(0,500);
      var edt=new Edit(self); edt.readOnly=true; edt.minWidth=62; edt.maxWidth=62;
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
      self.zoomMode=false;
      self.btnZoomReset.enabled=false;
      self.windowTitle="AstroMax Easy Stretch OSC v"+EASYSTRETCH_VERSION;
      var nPW=750;
      var nPH=Math.round(nPW*self.origImg.height/self.origImg.width);
      if(nPH>600){nPH=600;nPW=Math.round(nPH*self.origImg.width/self.origImg.height);}
      self.PW=nPW; self.PH=nPH;
      self.canvas.setFixedSize(nPW,nPH);
      self.adjustToContents();
      self.doRefresh();
   };
   var imgRow=new Sizer(false); imgRow.spacing=6;
   imgRow.add(imgLbl); imgRow.add(this.imgCombo); imgRow.addStretch();

   // ── Zoom controls ────────────────────────────────────────
   var zHint=new Label(this);
   zHint.text="Drag rectangle on preview to zoom in";

   this.btnZoomReset=new PushButton(this);
   this.btnZoomReset.text="⊡  Reset Zoom";
   this.btnZoomReset.enabled=false;
   this.btnZoomReset.onClick=function(){
      self.zoomMode=false;
      self.btnZoomReset.enabled=false;
      self.updateLevelButtons();
      self.renderPreview();
   };

   var zLbl=new Label(this); zLbl.text="Level:";
   this.btnZ2=new PushButton(this); this.btnZ2.text="2x"; this.btnZ2.minWidth=36;
   this.btnZ4=new PushButton(this); this.btnZ4.text="4x"; this.btnZ4.minWidth=36;
   this.btnZ8=new PushButton(this); this.btnZ8.text="8x"; this.btnZ8.minWidth=36;
   this.btnZ2.onClick=function(){self.zoomLevel=2;if(self.zoomMode)self.renderPreview();};
   this.btnZ4.onClick=function(){self.zoomLevel=4;if(self.zoomMode)self.renderPreview();};
   this.btnZ8.onClick=function(){self.zoomLevel=8;if(self.zoomMode)self.renderPreview();};

   var zRow=new Sizer(false); zRow.spacing=6;
   zRow.add(zHint); zRow.addStretch();
   zRow.add(this.btnZoomReset);
   zRow.add(zLbl);
   zRow.add(this.btnZ2); zRow.add(this.btnZ4); zRow.add(this.btnZ8);

   // ── Groups ───────────────────────────────────────────────
   this.g1=mkGroup("1 · General Stretch");
   this.slBlackpoint=mkSlider("Blackpoint",      0,  1, 0,  3,"blackpoint");
   this.slStretch   =mkSlider("General Stretch", 0, 30, 5,  2,"stretch"   );
   this.slContrast  =mkSlider("Contrast",       -8,  8, 0,  2,"contrast"  );
   this.g1.sizer.add(this.slBlackpoint);
   this.g1.sizer.add(this.slStretch);
   this.g1.sizer.add(this.slContrast);

   this.g2=mkGroup("2 · Background · Midtones · Highlights");
   this.slBackground=mkSlider("Background",                 -3,   3, 0,   3,"background");
   this.slMidtones  =mkSlider("Midtones  (L=dark R=light)", 0.02,0.98,0.5, 3,"midtones"  );
   this.slHighlights=mkSlider("Highlights (L=dark R=light)", 0.2, 0.8,0.5, 3,"highlights");
   this.g2.sizer.add(this.slBackground);
   this.g2.sizer.add(this.slMidtones);
   this.g2.sizer.add(this.slHighlights);

   // ── Buttons ──────────────────────────────────────────────
   this.btnReset=new PushButton(this); this.btnReset.text="↺  Reset";
   this.btnReset.onClick=function(){
      self.slBlackpoint.setValue(0); self.slStretch.setValue(5);
      self.slContrast.setValue(0);   self.slBackground.setValue(0);
      self.slMidtones.setValue(0.5); self.slHighlights.setValue(0.5);
      self.doRefresh();
   };

   this.btnApply=new PushButton(this); this.btnApply.text="▶  Apply & Continue";
   this.btnApply.toolTip="Bake parameters and reset sliders for next layer.";
   this.btnApply.onClick=function(){
      self.previewImg=processImage(self.previewImg,self.p);
      self.origImg=processImage(self.origImg,self.p);
      self.appliedLayers++;
      self.slBlackpoint.setValue(0); self.slStretch.setValue(0);
      self.slContrast.setValue(0);   self.slBackground.setValue(0);
      self.slMidtones.setValue(0.5); self.slHighlights.setValue(0.5);
      if(G_TMP&&!G_TMP.isNull){G_TMP.forceClose();G_TMP=null;}
      ensureTmp(self.previewImg);
      self.windowTitle="AstroMax Easy Stretch OSC v"+EASYSTRETCH_VERSION+
                       "  [layer "+self.appliedLayers+"]";
      self.doRefresh();
   };

   this.btnCreate=new PushButton(this); this.btnCreate.text="✅  Create New Photo";
   this.btnCreate.toolTip="Apply all parameters and create new image. Original untouched.";
   this.btnCreate.onClick=function(){
      if(G_TMP&&!G_TMP.isNull){G_TMP.forceClose();G_TMP=null;}
      ensureTmp(self.origImg);
      var res=processImage(self.origImg,self.p);
      var nid=self.srcView.id+"_AstroMax";
      var nw=new ImageWindow(res.width,res.height,res.numberOfChannels,
         res.bitsPerSample,res.isReal,res.numberOfChannels>1,nid);
      nw.mainView.beginProcess(0); nw.mainView.image.assign(res); nw.mainView.endProcess();
      nw.show(); nw.bringToFront();
      if(G_TMP&&!G_TMP.isNull){G_TMP.forceClose();G_TMP=null;}
      ensureTmp(self.previewImg);
   };

   this.btnClose=new PushButton(this); this.btnClose.text="Close";
   this.btnClose.onClick=function(){
      if(G_TMP&&!G_TMP.isNull) G_TMP.forceClose();
      self.cancel();
   };

   this.btnLicense=new PushButton(this); this.btnLicense.text="\uD83D\uDD11  License";
   this.btnLicense.toolTip="Show your HWID and activate license";
   this.btnLicense.onClick=function(){licShowActivationDialog();};

   var btnRow=new Sizer(false); btnRow.spacing=6;
   btnRow.add(this.btnLicense);
   btnRow.add(this.btnReset); btnRow.add(this.btnApply);
   btnRow.addStretch();
   btnRow.add(this.btnCreate); btnRow.add(this.btnClose);

   // ── Right control panel ───────────────────────────────────
   var ctrlPanel=new Sizer(true); ctrlPanel.spacing=8;
   ctrlPanel.add(imgRow);
   ctrlPanel.add(zRow);
   ctrlPanel.add(this.g1);
   ctrlPanel.add(this.g2);
   ctrlPanel.addStretch();
   ctrlPanel.add(btnRow);

   // ── Main layout: canvas left, controls right ──────────────
   var mainRow=new Sizer(false); mainRow.spacing=8;
   mainRow.add(this.canvas);
   mainRow.add(ctrlPanel);

   this.sizer=new Sizer(true);
   this.sizer.margin=8;
   this.sizer.add(mainRow);

   this.adjustToContents();
   this.doRefresh();
}

EasyStretchDialog.prototype=new Dialog;

EasyStretchDialog.prototype.updateLevelButtons=function(){
   this.btnZ2.enabled=this.zoomMode;
   this.btnZ4.enabled=this.zoomMode;
   this.btnZ8.enabled=this.zoomMode;
};

EasyStretchDialog.prototype.renderPreview=function(){
   if(this.lastRes===null) return;
   if(this.zoomMode){
      this.previewBitmap=renderZoom(this.lastRes,
         this.zoomCX,this.zoomCY,this.zoomLevel,this.PW,this.PH);
   } else {
      this.previewBitmap=renderFull(this.lastRes,this.PW,this.PH);
   }
   this.canvas.repaint();
};

EasyStretchDialog.prototype.doRefresh=function(){
   if(this.busy) return;
   this.busy=true;
   try{
      this.lastRes=processImage(this.previewImg,this.p);
      this.renderPreview();
   }catch(e){Console.writeln("Error: "+e);}
   this.busy=false;
};

function main() {
   Console.hide();
   var lic = licCheck();
   if (lic === "expired") {
      if (!licShowActivationDialog()) return;
   }
   var dlg = new EasyStretchDialog();
   if (dlg.srcView === undefined || dlg.srcView === null) {
      // Mono has no srcView check, skip
   }
   if (lic.indexOf("trial:") === 0) {
      var daysLeft = parseInt(lic.split(":")[1]);
      dlg.windowTitle = dlg.windowTitle + "  •  Trial: " + daysLeft + " day" + (daysLeft !== 1 ? "s" : "") + " left";
   }
   dlg.execute();
}

main();

