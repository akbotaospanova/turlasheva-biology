/* Жеңіл 3D қозғалтқыш (Canvas 2D): эллипсоидтар, көпбұрыштар, сызықтар, белгілер */
(function(){
'use strict';
const V={
  add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],
  sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
  mul:(a,s)=>[a[0]*s,a[1]*s,a[2]*s],
  dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  len:a=>Math.hypot(a[0],a[1],a[2]),
  norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];},
  lerp:(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]
};
// Эйлер бұрыштарынан айналу матрицасы (бағандары — осьтер)
function rotM(rx,ry,rz){
  rx=rx||0;ry=ry||0;rz=rz||0;
  const cx=Math.cos(rx),sx=Math.sin(rx),cy=Math.cos(ry),sy=Math.sin(ry),cz=Math.cos(rz),sz=Math.sin(rz);
  // R = Rz*Ry*Rx
  return [
    [cz*cy, cz*sy*sx - sz*cx, cz*sy*cx + sz*sx],
    [sz*cy, sz*sy*sx + cz*cx, sz*sy*cx - cz*sx],
    [-sy,   cy*sx,            cy*cx]
  ];
}
function mv(M,v){return [M[0][0]*v[0]+M[0][1]*v[1]+M[0][2]*v[2],M[1][0]*v[0]+M[1][1]*v[1]+M[1][2]*v[2],M[2][0]*v[0]+M[2][1]*v[1]+M[2][2]*v[2]];}
// Бағыт векторынан басис (ось a бойымен)
function basisFrom(dir){
  const a=V.norm(dir);const t=Math.abs(a[1])<0.9?[0,1,0]:[1,0,0];
  const b=V.norm(V.cross(a,t));const c=V.cross(a,b);
  return [[a[0],b[0],c[0]],[a[1],b[1],c[1]],[a[2],b[2],c[2]]];
}
function rng(seed){let s=seed>>>0;return function(){s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
// Түстер
function hex2rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return [(n>>16)&255,(n>>8)&255,n&255];}
const ccache={};
function rgb(c){if(Array.isArray(c))return c;return ccache[c]||(ccache[c]=hex2rgb(c));}
function shade(c,k){const r=rgb(c);if(k>=0)return r.map(v=>Math.round(v+(255-v)*k));return r.map(v=>Math.round(v*(1+k)));}
function css(r,a){return a===undefined||a>=1?`rgb(${r[0]},${r[1]},${r[2]})`:`rgba(${r[0]},${r[1]},${r[2]},${a})`;}

const LIGHT=V.norm([-0.5,0.7,0.6]);

function Viewer(host,scene,opts){
  opts=opts||{};
  this.host=host;this.scene=scene;this.opts=opts;
  host.innerHTML='';
  const wrap=document.createElement('div');wrap.className='v3d';host.appendChild(wrap);
  const cv=document.createElement('canvas');wrap.appendChild(cv);
  const lab=document.createElement('div');lab.className='v3d-labels';wrap.appendChild(lab);host=wrap;this.host=wrap;
  this.cv=cv;this.ctx=cv.getContext('2d');this.labLayer=lab;this.labEls={};
  this.yaw=scene.yaw!==undefined?scene.yaw:-0.5;this.pitch=scene.pitch!==undefined?scene.pitch:0.35;
  this.zoom=1;this.auto=opts.auto!==false&&!scene.noAuto;this.showLabels=opts.labels!==false;
  this.t=0;this.playing=false;this.step=0;this.stepT=0;this.highlight=null;this.dimOthers=false;
  this.parts=scene.parts||{};
  this.state={};
  if(scene.init)scene.init(this.state);
  this._bind();
  this._resize();
  this._ro=new ResizeObserver(()=>this._resize());this._ro.observe(host);
  this._last=performance.now();
  this._alive=true;
  const loop=(now)=>{if(!this._alive)return;const dt=Math.min(0.05,(now-this._last)/1000);this._last=now;this._tick(dt);this.raf=requestAnimationFrame(loop);};
  this.raf=requestAnimationFrame(loop);
}
Viewer.prototype._resize=function(){
  const r=this.host.getBoundingClientRect();const d=Math.min(window.devicePixelRatio||1,2);
  this.W=Math.max(10,r.width);this.H=Math.max(10,r.height);
  this.cv.width=this.W*d;this.cv.height=this.H*d;this.cv.style.width=this.W+'px';this.cv.style.height=this.H+'px';
  this.ctx.setTransform(d,0,0,d,0,0);
};
Viewer.prototype._bind=function(){
  const cv=this.cv;let drag=null;const pts=new Map();
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);drag={x:e.clientX,y:e.clientY,yaw:this.yaw,pitch:this.pitch};this.userTouched=true;});
  cv.addEventListener('pointermove',e=>{
    if(!pts.has(e.pointerId))return;
    const prev=pts.get(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);
    if(pts.size===2){const a=[...pts.values()];const d1=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);
      const other=[...pts.entries()].find(([k])=>k!==e.pointerId)[1];const d0=Math.hypot(prev[0]-other[0],prev[1]-other[1]);
      if(d0>0)this.zoom=Math.max(0.5,Math.min(2.6,this.zoom*d1/d0));return;}
    if(drag){this.yaw=drag.yaw+(e.clientX-drag.x)*0.01;this.pitch=Math.max(-1.4,Math.min(1.4,drag.pitch+(e.clientY-drag.y)*0.01));}
  });
  const up=e=>{pts.delete(e.pointerId);if(pts.size===0)drag=null;};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{e.preventDefault();this.zoom=Math.max(0.5,Math.min(2.6,this.zoom*Math.exp(-e.deltaY*0.0012)));},{passive:false});
  cv.addEventListener('dblclick',()=>{this.zoom=1;this.yaw=this.scene.yaw!==undefined?this.scene.yaw:-0.5;this.pitch=this.scene.pitch!==undefined?this.scene.pitch:0.35;});
};
Viewer.prototype.destroy=function(){this._alive=false;cancelAnimationFrame(this.raf);this._ro&&this._ro.disconnect();};
Viewer.prototype.play=function(){this.playing=true;if(this.step>=this.steps().length-1&&this.stepT>=this.steps()[this.step].dur){this.step=0;this.stepT=0;}};
Viewer.prototype.pause=function(){this.playing=false;};
Viewer.prototype.steps=function(){return this.scene.steps||[{cap:'',dur:8}];};
Viewer.prototype.goStep=function(i){const s=this.steps();this.step=Math.max(0,Math.min(s.length-1,i));this.stepT=0;if(this.onStep)this.onStep(this.step);};
Viewer.prototype._tick=function(dt){
  this.t+=dt;
  if(this.auto&&!this.dragging)this.yaw+=dt*0.18;
  const S=this.steps();
  if(this.playing){
    this.stepT+=dt;
    if(this.stepT>=S[this.step].dur){
      if(this.step<S.length-1){this.step++;this.stepT=0;if(this.onStep)this.onStep(this.step);}
      else{this.stepT=S[this.step].dur;this.playing=false;if(this.onEnd)this.onEnd();}
    }
  }
  if(this.onProgress){let tot=0,done=0;S.forEach((s,i)=>{tot+=s.dur;if(i<this.step)done+=s.dur;});done+=Math.min(this.stepT,S[this.step].dur);this.onProgress(done/tot);}
  this.render();
};
// Сахна құрастыру API
Viewer.prototype.render=function(){
  const ctx=this.ctx,W=this.W,H=this.H;
  ctx.clearRect(0,0,W,H);
  const prims=[];const labels=[];
  const S=this.steps();const st=S[this.step];
  const k=Math.min(1,this.stepT/(st.anim||st.dur));
  const self=this;
  const api={
    t:this.t,step:this.step,k:k,ease:k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,state:this.state,
    ell(c,r,rot,color,o){prims.push({type:'e',c,r:Array.isArray(r)?r:[r,r,r],m:Array.isArray(rot)&&Array.isArray(rot[0])?rot:rotM.apply(null,rot||[0,0,0]),color,o:o||{}});},
    ball(c,r,color,o){prims.push({type:'e',c,r:[r,r,r],m:null,color,o:o||{}});},
    rod(a,b,r,color,o){const d=V.sub(b,a);const L=V.len(d);prims.push({type:'e',c:V.lerp(a,b,.5),r:[L/2+r*0.6,r,r],m:basisFrom(d),color,o:o||{}});},
    poly(pts,color,o){prims.push({type:'p',pts,color,o:o||{}});},
    line(a,b,color,w,o){prims.push({type:'l',a,b,color,w:w||1.5,o:o||{}});},
    label(id,p,txt){labels.push({id,p,txt:txt||self.parts[id]||id});},
    text(p,txt,o){prims.push({type:'t',c:p,txt,o:o||{}});}
  };
  this.scene.build(api);
  const pp={};for(const pr of prims)if(pr.o&&pr.o.part)pp[pr.o.part]=1;this.presentParts=pp;
  // камера
  const cy=Math.cos(this.yaw),sy=Math.sin(this.yaw),cp=Math.cos(this.pitch),sp=Math.sin(this.pitch);
  const view=p=>{const x=p[0]*cy+p[2]*sy;const z0=-p[0]*sy+p[2]*cy;const y=p[1]*cp-z0*sp;const z=p[1]*sp+z0*cp;return [x,y,z];};
  const viewDir=v=>{const x=v[0]*cy+v[2]*sy;const z0=-v[0]*sy+v[2]*cy;return [x,v[1]*cp-z0*sp,v[1]*sp+z0*cp];};
  const F=this.scene.persp||9;const scale=Math.min(W,H)/(this.scene.size||6)*this.zoom;const cx=W/2,cyS=H/2+(this.scene.offY||0)*scale+(this.opts.shift||0);
  const proj=v=>{const p=F/(F-v[2]);return [cx+v[0]*scale*p,cyS-v[1]*scale*p,p];};
  const hl=this.highlight;
  const items=[];
  for(const pr of prims){
    if(pr.type==='e'){
      const vc=view(pr.c);const P=proj(vc);
      let u;
      if(!pr.m){const rr=pr.r[0];items.push({z:vc[2],pr,P,rx:rr*scale*P[2],ry:rr*scale*P[2],ang:0,vc});continue;}
      const ax=[0,1,2].map(i=>viewDir(V.mul([pr.m[0][i],pr.m[1][i],pr.m[2][i]],pr.r[i])));
      let a=0,b=0,c=0;for(const v of ax){a+=v[0]*v[0];b+=v[0]*v[1];c+=v[1]*v[1];}
      const tr=a+c,det=a*c-b*b,disc=Math.sqrt(Math.max(0,tr*tr/4-det));
      const l1=tr/2+disc,l2=Math.max(1e-6,tr/2-disc);
      const ang=Math.atan2(l1-a,b)||0;
      const ang2=Math.abs(b)<1e-9?(a>=c?0:Math.PI/2):Math.atan2(l1-a,b);
      items.push({z:vc[2],pr,P,rx:Math.sqrt(l1)*scale*P[2],ry:Math.sqrt(l2)*scale*P[2],ang:-ang2,vc});
    }else if(pr.type==='p'){
      const vs=pr.pts.map(view);const z=vs.reduce((s,v)=>s+v[2],0)/vs.length;
      let n=[0,0,1];if(vs.length>=3){n=V.norm(V.cross(V.sub(vs[1],vs[0]),V.sub(vs[2],vs[0])));}
      items.push({z:z+(pr.o.zb||0),pr,P:vs.map(proj),n});
    }else if(pr.type==='l'){
      const va=view(pr.a),vb=view(pr.b);items.push({z:(va[2]+vb[2])/2+(pr.o.zb||0),pr,A:proj(va),B:proj(vb)});
    }else if(pr.type==='t'){const vc=view(pr.c);items.push({z:vc[2]+5,pr,P:proj(vc)});}
  }
  items.sort((a,b)=>a.z-b.z);
  const Lv=LIGHT;
  for(const it of items){
    const o=it.pr.o;let alpha=o.alpha===undefined?1:o.alpha;
    const isHL=hl&&o.part===hl;
    if(hl&&this.dimOthers&&!isHL)alpha*=0.18;
    if(it.pr.type==='e'){
      if(it.rx<0.3)continue;
      const col=isHL?shade(it.pr.color,.3):rgb(it.pr.color);
      ctx.save();ctx.translate(it.P[0],it.P[1]);ctx.rotate(it.ang);
      ctx.beginPath();ctx.ellipse(0,0,it.rx,it.ry,0,0,Math.PI*2);
      const R=Math.max(it.rx,it.ry);
      if(o.flat){ctx.fillStyle=css(col,alpha);}
      else{
        const dx=-0.35,dy=-0.4,ca=Math.cos(it.ang),sa=Math.sin(it.ang);
        const g=ctx.createRadialGradient((dx*ca+dy*sa)*it.rx,(-dx*sa+dy*ca)*it.ry,R*0.05,0,0,R*1.05);
        if(o.shell){g.addColorStop(0,css(shade(col,.35),alpha*.25));g.addColorStop(.75,css(col,alpha*.35));g.addColorStop(1,css(shade(col,-.1),alpha));}
        else{g.addColorStop(0,css(shade(col,.55),alpha));g.addColorStop(.45,css(col,alpha));g.addColorStop(1,css(shade(col,-.45),alpha));}
        ctx.fillStyle=g;
      }
      ctx.fill();
      if(o.stroke||o.shell||isHL){ctx.lineWidth=isHL?2.6:(o.lw||1.4);ctx.strokeStyle=isHL?'#ffcf33':css(shade(col,o.shell?-.2:-.35),Math.min(1,alpha*(o.shell?1.6:1)));ctx.stroke();}
      ctx.restore();
    }else if(it.pr.type==='p'){
      const col=isHL?shade(it.pr.color,.3):rgb(it.pr.color);
      const d=Math.abs(V.dot(it.n,Lv));const k=o.flat?0:(-.35+d*.6);
      ctx.beginPath();it.P.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();
      ctx.fillStyle=css(shade(col,k),alpha);ctx.fill();
      if(o.stroke!==false&&(o.stroke||isHL)){ctx.lineWidth=isHL?2.5:(o.lw||1);ctx.strokeStyle=isHL?'#ffcf33':css(shade(col,-.4),Math.min(1,alpha+.2));ctx.stroke();}
    }else if(it.pr.type==='l'){
      const col=isHL?shade(it.pr.color,.45):rgb(it.pr.color);
      ctx.beginPath();ctx.moveTo(it.A[0],it.A[1]);ctx.lineTo(it.B[0],it.B[1]);ctx.lineWidth=it.pr.w*(it.A[2]+it.B[2])/2*(this.zoom);ctx.lineCap='round';ctx.strokeStyle=css(col,alpha);ctx.stroke();
    }else if(it.pr.type==='t'){
      ctx.font=`${o.weight||600} ${(o.size||13)}px Inter,system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillStyle=css(rgb(o.color||'#ffffff'),alpha);ctx.fillText(it.pr.txt,it.P[0],it.P[1]);
    }
  }
  // белгілер
  const seen={};
  for(const L of labels){
    const v=view(L.p);const P=proj(v);seen[L.id]=1;
    let el=this.labEls[L.id];
    if(!el){el=document.createElement('div');el.className='v3d-lab';el.innerHTML='<i></i><span></span>';this.labLayer.appendChild(el);this.labEls[L.id]=el;}
    el.querySelector('span').textContent=L.txt;
    const show=this.showLabels&&!this.quizMode;
    el.style.display=show?'':'none';
    el.style.transform=`translate(${P[0]}px,${P[1]}px)`;
    el.style.opacity=v[2]<-2.5?0.55:1;
    el.classList.toggle('hl',hl===L.id);
    el.style.zIndex=Math.round(100+v[2]*10);
  }
  for(const id in this.labEls)if(!seen[id])this.labEls[id].style.display='none';
};
window.E3D={Viewer,V,rotM,basisFrom,rng,shade};
})();
