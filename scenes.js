/* 3D сахналар — әр сабаққа арналған анимациялық модельдер */
(function(){
'use strict';
const {V,rotM,rng}=E3D;
const C={mem:'#e98aa8',cyto:'#fde2ea',nuc:'#8a6bd1',nucl:'#4b2e83',chr:'#c5b3f0',mito:'#f08a4b',crist:'#b9501c',er:'#4f9fd4',golgi:'#f2c14e',lyso:'#d64f6b',ribo:'#3a3f58',vac:'#7cc6e8',chl:'#4caf50',gran:'#1b6e2d',wall:'#8fc35d',cent:'#8d6e63',dark:'#2d3142'};
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
function T(o,s){return v=>[o[0]+v[0]*s,o[1]+v[1]*s,o[2]+v[2]*s];}
function local(c,M,v){const r=[M[0][0]*v[0]+M[0][1]*v[1]+M[0][2]*v[2],M[1][0]*v[0]+M[1][1]*v[1]+M[1][2]*v[2],M[2][0]*v[0]+M[2][1]*v[1]+M[2][2]*v[2]];return [c[0]+r[0],c[1]+r[1],c[2]+r[2]];}
function box(g,c,h,color,o){
  const P=[];for(const sx of[-1,1])for(const sy of[-1,1])for(const sz of[-1,1])P.push([c[0]+sx*h[0],c[1]+sy*h[1],c[2]+sz*h[2]]);
  const F=[[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]];
  for(const f of F)g.poly(f.map(i=>P[i]),color,o);
}
function fib(n,i){const y=1-(i+.5)/n*2;const r=Math.sqrt(1-y*y);const th=i*2.39996;return [Math.cos(th)*r,y,Math.sin(th)*r];}
/* ---------- органоидтар ---------- */
const O={
  nucleus(g,c,r,o){o=o||{};
    g.ball(c,r,C.nuc,{shell:1,alpha:o.alpha!==undefined?o.alpha:.55,part:'nucleus'});
    g.ball(c,r*.9,'#b49be8',{shell:1,alpha:(o.alpha!==undefined?o.alpha:.55)*.4,part:'nucleus'});
    if(!o.noPores)for(let i=0;i<16;i++){const d=fib(16,i);g.ball(V.add(c,V.mul(d,r)),r*.07,C.nucl,{part:'pores',alpha:o.alpha!==undefined?o.alpha*1.6:1});}
    const nc=V.add(c,[r*.2,r*.15,r*.1]);
    if(!o.noNucleolus)g.ball(nc,r*.34,C.nucl,{part:'nucleolus'});
    const R=rng(7);if(!o.noChromatin)for(let i=0;i<22;i++){const d=fib(22,i);const p=V.add(c,V.mul(d,r*(.35+R()*.4)));g.ball(p,r*.06,C.chr,{part:'chromatin'});}
  },
  mito(g,c,L,rot,o){o=o||{};const M=rotM(...rot);const w=L*.42;
    g.ell(c,[L,w,w],M,C.mito,{shell:1,alpha:.6,part:'mito'});
    const n=Math.max(3,Math.round(L*5));
    for(let i=0;i<n;i++){const x=(i/(n-1)*2-1)*L*.72;const sh=Math.sqrt(Math.max(0,1-(x/L)**2));
      g.ell(local(c,M,[x,(i%2?.12:-.12)*w,0]),[L*.035,w*.62*sh,w*.75*sh],M,C.crist,{part:'mito'});}
  },
  chloro(g,c,L,rot,o){o=o||{};const M=rotM(...rot);const w=L*.45;
    g.ell(c,[L,w,w*.9],M,o.color||C.chl,{shell:1,alpha:.7,part:o.part||'chloro'});
    if(o.noGrana)return;
    for(let i=-2;i<=2;i++)for(let k=0;k<4;k++){
      g.ell(local(c,M,[i*L*.34,(k-1.5)*w*.16,((i+2)%2?.18:-.18)*w]),[L*.15,w*.05,L*.15],M,C.gran,{part:o.part||'chloro'});
    }
  },
  er(g,c,s,rot,rough,o){o=o||{};const M=rotM(...rot);const part=o.part||(rough?'rer':'ser');
    for(let j=0;j<3;j++)for(let i=0;i<7;i++){
      const lp=[(i-3)*.24*s,j*.22*s,Math.sin(i*.9+j*1.3)*.12*s];
      g.ell(local(c,M,lp),[.16*s,.045*s,.32*s],M,C.er,{part,alpha:.9});
      if(rough)for(const dz of[-.2,0,.2])g.ball(local(c,M,[lp[0]+(dz*.3)*s,lp[1]+.07*s,lp[2]+dz*s]),.035*s,C.ribo,{part:o.riboPart||part});
    }
  },
  golgi(g,c,s,rot,o){o=o||{};const M=rotM(...rot);
    for(let j=0;j<5;j++){const w=(.55-Math.abs(j-2)*.04)*s;
      for(let q=-1;q<=1;q++){g.ell(local(c,M,[q*w*.62,j*.14*s-Math.abs(q)*.07*s,0]),[w*.42,.045*s,.3*s],rotM(rot[0],rot[1],(rot[2]||0)+q*.35),C.golgi,{part:'golgi'});}
    }
    const R=rng(3);for(let i=0;i<6;i++){const sgn=i%2?1:-1;g.ball(local(c,M,[sgn*(.6+R()*.15)*s,(R()*.6-.05)*s,(R()-.5)*.4*s]),.07*s,'#f7d77c',{part:'golgi'});}
  },
  lyso(g,p,r){g.ball(p,r,C.lyso,{part:'lyso'});},
  ribo(g,p,s,part){g.ball(p,s,C.ribo,{part:part||'ribo'});g.ball(V.add(p,[0,s*.9,0]),s*.72,'#5c6385',{part:part||'ribo'});},
  centriole(g,c,s){g.rod(V.add(c,[-.18*s,0,0]),V.add(c,[.18*s,0,0]),.07*s,C.cent,{part:'centriole'});g.rod(V.add(c,[0,-.18*s,.12*s]),V.add(c,[0,.18*s,.12*s]),.07*s,C.cent,{part:'centriole'});},
  vacuole(g,c,r,o){g.ell(c,r,[0,0,0],C.vac,{shell:1,alpha:(o&&o.alpha)||.55,part:'vacuole'});}
};
/* ---------- жасушалар ---------- */
function animalCell(g,o,s,opt){opt=opt||{};const P=T(o,s);const R=rng(11);
  g.ell(P([0,0,0]),[2.5*s,2.15*s,2.2*s],[0,0,0],C.mem,{shell:1,alpha:.42,part:'membrane',lw:2});
  O.nucleus(g,P([-.15,.1,0]),.85*s);
  const mp=[[1.3,.6,.5,0,.4,.3],[-1.3,-.7,.6,.5,1.2,0],[.9,-1.1,-.6,0,-.8,.6],[-1,1,-.8,.4,0,-.5]];
  mp.forEach(m=>O.mito(g,P(m.slice(0,3)),.45*s,m.slice(3)));
  O.er(g,P([-1.25,-.1,-.9]),.9*s,[.2,.4,1.4],true);
  O.er(g,P([1.4,-.35,-.4]),.7*s,[.1,-.5,1.8],false);
  O.golgi(g,P([.75,.85,-.55]),.85*s,[.4,.3,-.4]);
  [[.3,-1.35,.5],[-.6,-1.1,-1.2],[1.6,.2,-1.1]].forEach(p=>O.lyso(g,P(p),.2*s));
  O.centriole(g,P([.4,-.4,1.3]),1*s);
  for(let i=0;i<24;i++){const d=fib(24,i);const rr=1.2+R()*.75;const p=[d[0]*rr*1.15,d[1]*rr*.95,d[2]*rr];g.ball(P(p),.045*s,C.ribo,{part:'ribo'});}
  if(opt.labels!==false){
    g.label('membrane',P([0,2.15,0]));g.label('nucleus',P([-.15,.95,0]));g.label('nucleolus',P([.02,.25,.1]));
    g.label('mito',P([1.3,.6,.5]));g.label('rer',P([-1.25,.15,-.9]));g.label('ser',P([1.4,-.2,-.4]));g.label('golgi',P([.75,1.15,-.55]));
    g.label('lyso',P([.3,-1.35,.5]));g.label('centriole',P([.4,-.2,1.3]));g.label('ribo',P([-1.6,-1.2,.6]));g.label('cytoplasm',P([.2,-.6,-1.7]));
  }
}
function plantCell(g,o,s,opt){opt=opt||{};const P=T(o,s);const vs=opt.vacScale||1;const ps=opt.proto||1;
  box(g,P([0,0,0]),[2.6*s,1.75*s,1.75*s],C.wall,{alpha:.28,stroke:true,lw:1.5,part:'wall'});
  box(g,P([0,0,0]),[2.45*s*ps,1.6*s*ps,1.6*s*ps],C.mem,{alpha:.08,stroke:true,part:'membrane'});
  O.vacuole(g,P([.3*ps,-.05,0]),[1.55*s*ps*vs,1.15*s*ps*vs,1.1*s*ps*vs]);
  O.nucleus(g,P([-1.75*ps,.75*ps,.6*ps]),.55*s,{noChromatin:1});
  const R=rng(5);const cl=opt.chloroPos||[];
  const pts=[[-1.9,-.9,.9],[-1.2,1.3,-1],[.6,1.35,1],[1.9,.9,-.9],[2,-.9,.8],[.8,-1.35,-1.1],[-.6,-1.35,1],[-2,.2,-1],[1.3,1.3,.2],[-.4,1.35,.3]];
  pts.forEach((p,i)=>{let q=p.map(v=>v*ps);if(cl[i])q=cl[i];O.chloro(g,P(q),.32*s,[R()*3,R()*3,R()*3]);});
  O.mito(g,P([-1.9*ps,-.2,-.9*ps]),.3*s,[0,.5,.4]);O.mito(g,P([1.8*ps,-.2,1.05*ps]),.3*s,[0,1.2,0]);
  O.golgi(g,P([-1.6*ps,-.9*ps,-.5]),.55*s,[.3,.2,.3]);
  O.er(g,P([-1.9*ps,.1*ps,1.2*ps]),.5*s,[.3,1,1.2],true);
  if(opt.labels!==false){
    g.label('wall',P([2.6,1.75,0]));g.label('membrane',P([2.45*ps,-1.3*ps,1.6*ps]));g.label('vacuole',P([.3,.2,0]));g.label('nucleus',P([-1.75*ps,1.25*ps,.6*ps]));
    g.label('chloro',P(pts[3].map(v=>v*ps)));g.label('mito',P([-1.9*ps,-.2,-.9*ps]));g.label('golgi',P([-1.6*ps,-.6*ps,-.5]));g.label('rer',P([-1.9*ps,.35*ps,1.2*ps]));g.label('cytoplasm',P([1.6*ps,-1*ps,-1.2*ps]));
  }
}
const CELL_PARTS={membrane:'Жасуша қабықшасы',nucleus:'Ядро',nucleolus:'Ядрошық',mito:'Митохондрия',rer:'Түйіршікті ЭПТ',ser:'Тегіс ЭПТ',golgi:'Гольджи кешені',lyso:'Лизосома',centriole:'Жасуша орталығы',ribo:'Рибосома',cytoplasm:'Цитоплазма',wall:'Жасуша қабырғасы (целлюлоза)',vacuole:'Вакуоль',chloro:'Хлоропласт',pores:'Ядро тесіктері',chromatin:'Хроматин'};
function pick(ids){const o={};ids.forEach(i=>o[i]=CELL_PARTS[i]);return o;}
/* ---------- хромосома элементтері ---------- */
function chromatid(g,c,ang,L,color,tip,r,part){
  const d=[Math.sin(ang),Math.cos(ang),0];const a=V.add(c,V.mul(d,-L/2)),b=V.add(c,V.mul(d,L/2));
  r=r||.075;
  if(tip){const m=V.lerp(a,b,.62);g.rod(a,m,r,color,{part:part||'chromosome'});g.rod(m,b,r,tip,{part:part||'chromosome'});}
  else g.rod(a,b,r,color,{part:part||'chromosome'});
}
function helix(g,o){ // o: {c, axis:'y'|'x', len, R, turns, phase, pairs, colors, part, from,to, n}
  const n=o.n||24;const out=[];
  for(let i=0;i<n;i++){const u=i/(n-1);if(o.from!==undefined&&(u<o.from||u>o.to))continue;
    const s=(u-.5)*o.len;const th=u*o.turns*Math.PI*2+(o.phase||0);
    const p1=[Math.cos(th)*o.R,s,Math.sin(th)*o.R],p2=[Math.cos(th+Math.PI*.8)*o.R,s,Math.sin(th+Math.PI*.8)*o.R];
    const map=p=>o.axis==='x'?[o.c[0]+p[1],o.c[1]+p[0],o.c[2]+p[2]]:[o.c[0]+p[0],o.c[1]+p[1],o.c[2]+p[2]];
    const A=map(p1),B=map(p2);out.push([A,B,i]);
    g.ball(A,o.R*.2,o.c1||'#5b6c8f',{part:o.part||'backbone'});g.ball(B,o.R*.2,o.c2||'#5b6c8f',{part:o.part||'backbone'});
    if(o.pairs!==false){const m=V.lerp(A,B,.5);const pc=PAIRC[i%4];g.rod(A,m,o.R*.09,pc[0],{part:'bases'});g.rod(m,B,o.R*.09,pc[1],{part:'bases'});}
  }
  return out;
}
const PAIRC=[['#e4572e','#3b8ea5'],['#4caf50','#f4c430'],['#3b8ea5','#e4572e'],['#f4c430','#4caf50']];
const BASEC={'А':'#e4572e','Т':'#3b8ea5','У':'#8e6bd1','Г':'#4caf50','Ц':'#f4c430'};

/* ================= САХНАЛАР ================= */
const S={};
S.hero={size:6.2,pitch:.3,parts:{},build(g){animalCell(g,[0,0,0],1,{labels:false});}};

S.microscope={size:7.6,offY:.2,pitch:.15,yaw:-.9,offY:-.1,
  parts:{eyepiece:'Окуляр',tube:'Тубус',objective:'Объективтер',stage:'Заттық үстел',mirror:'Айна (жарық көзі)',arm:'Штатив',screw:'Макро/микро бұрандалар',base:'Негіз',slide:'Препарат'},
  steps:[{cap:'Жарық микроскопы — биологияның негізгі зерттеу құралы. Модельді айналдырып, бөліктерін қара.',dur:5},
    {cap:'Окуляр — көз жанасатын линза. Әдетте 10× үлкейтеді.',dur:4,hl:'eyepiece'},
    {cap:'Тубус — окуляр мен объективті жалғайтын түтік.',dur:4,hl:'tube'},
    {cap:'Объективтер — 10×, 40×, 90× үлкейтетін линзалар. Жалпы үлкейту = окуляр × объектив.',dur:5,hl:'objective'},
    {cap:'Заттық үстелге препарат (зерттелетін нысан) қойылады.',dur:4,hl:'stage'},
    {cap:'Айна жарықты препарат арқылы объективке бағыттайды.',dur:4,hl:'mirror'},
    {cap:'Бұрандалар арқылы бейненің анықтығы реттеледі.',dur:4,hl:'screw'}],
  build(g){
    box(g,[0,-2.3,0],[1.3,.14,.9],'#37474f',{part:'base',stroke:true});
    box(g,[.95,-.6,0],[.17,1.6,.22],'#455a64',{part:'arm',stroke:true});
    box(g,[.55,1.05,0],[.45,.17,.2],'#455a64',{part:'arm',stroke:true});
    box(g,[0,-.7,0],[.95,.06,.8],'#263238',{part:'stage',stroke:true});
    box(g,[0,-.62,0],[.55,.015,.18],'#cfe8f5',{part:'slide',alpha:.85,stroke:true});
    g.ball([0,-.6,0],.07,'#e98aa8',{part:'slide'});
    g.rod([0,.15,0],[0,1.9,0],.22,'#546e7a',{part:'tube'});
    g.rod([0,1.9,0],[0,2.45,0],.15,'#263238',{part:'eyepiece'});
    g.ell([0,.12,0],[.34,.1,.34],[0,0,0],'#78909c',{part:'objective'});
    g.rod([0,.1,0],[0,-.35,0],.08,'#b0bec5',{part:'objective'});
    g.rod([.15,.1,.1],[.3,-.25,.2],.07,'#b0bec5',{part:'objective'});
    g.rod([-.15,.1,-.1],[-.28,-.2,-.2],.07,'#b0bec5',{part:'objective'});
    g.ell([0,-1.55,0],[.4,.05,.4],[.45,0,0],'#cfd8dc',{part:'mirror'});
    g.ell([1.2,.25,0],[.07,.28,.28],[0,0,0],'#90a4ae',{part:'screw'});g.ell([1.2,-.35,0],[.06,.17,.17],[0,0,0],'#90a4ae',{part:'screw'});
    const a=.35+.25*Math.sin(g.t*3);g.line([0,-1.5,0],[0,2.4,0],'#fff59d',5,{alpha:a,zb:.01});
    g.label('eyepiece',[0,2.45,0]);g.label('tube',[0,1.3,.2]);g.label('objective',[.3,-.25,.2]);g.label('stage',[-.9,-.7,.8]);
    g.label('mirror',[.4,-1.55,0]);g.label('arm',[.95,-1.3,.22]);g.label('screw',[1.25,.25,0]);g.label('base',[-1.1,-2.3,.9]);
  }};

S.levels={size:8.6,offY:.35,pitch:.25,parts:{l1:'Молекулалық',l2:'Жасушалық',l3:'Ұлпалық',l4:'Мүшелік',l5:'Организмдік',l6:'Популяциялық-түрлік',l7:'Экожүйелік',l8:'Биосфералық'},
  steps:[{cap:'Тірі табиғаттың ұйымдасу деңгейлері — қарапайымнан күрделіге қарай.',dur:4},
    {cap:'1. Молекулалық деңгей: нәруыздар, ДНҚ, көмірсулар.',dur:3.5,hl:'l1'},{cap:'2. Жасушалық: тіршіліктің ең кіші бірлігі — жасуша.',dur:3.5,hl:'l2'},
    {cap:'3. Ұлпалық: құрылысы мен қызметі ұқсас жасушалар тобы.',dur:3.5,hl:'l3'},{cap:'4. Мүшелік: бірнеше ұлпадан тұратын мүше.',dur:3.5,hl:'l4'},
    {cap:'5. Организмдік: тұтас тірі ағза.',dur:3.5,hl:'l5'},{cap:'6. Популяциялық-түрлік: бір түрдің дарақтары тобы.',dur:3.5,hl:'l6'},
    {cap:'7. Экожүйелік (биогеоценоз): организмдер мен ортаның бірлігі.',dur:3.5,hl:'l7'},{cap:'8. Биосфералық: Жердің барлық тірі қабығы.',dur:4,hl:'l8'}],
  build(g){
    for(let i=0;i<8;i++){const a=i*.82;const c=[Math.cos(a)*2,-2.7+i*.75,Math.sin(a)*2];const id='l'+(i+1);
      g.ell(c,[.55,.06,.55],[0,0,0],'#cfd8dc',{part:id,alpha:.9});const u=V.add(c,[0,.32,0]);
      if(i===0){g.ball(u,.13,'#e4572e',{part:id});g.ball(V.add(u,[.17,.08,0]),.09,'#eeeeee',{part:id});g.ball(V.add(u,[-.17,.08,0]),.09,'#eeeeee',{part:id});}
      if(i===1){g.ball(u,.28,C.mem,{part:id,shell:1,alpha:.6});g.ball(u,.1,C.nuc,{part:id});}
      if(i===2){for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++)g.ball(V.add(u,[x*.17,0,z*.17]),.09,'#f48fb1',{part:id});}
      if(i===3){g.ball(V.add(u,[-.1,0,0]),.22,'#c62828',{part:id});g.ball(V.add(u,[.12,.02,0]),.2,'#d84343',{part:id});g.rod(V.add(u,[0,.18,0]),V.add(u,[.05,.4,0]),.06,'#b71c1c',{part:id});}
      if(i===4){g.rod(V.add(u,[0,-.25,0]),V.add(u,[0,.05,0]),.05,'#795548',{part:id});g.ball(V.add(u,[0,.2,0]),.22,'#43a047',{part:id});}
      if(i===5){for(let q=0;q<3;q++){const p=V.add(u,[(q-1)*.25,-.1,(q%2)*.15]);g.rod(p,V.add(p,[0,.15,0]),.03,'#795548',{part:id});g.ball(V.add(p,[0,.25,0]),.12,'#43a047',{part:id});}}
      if(i===6){g.ell(V.add(u,[.1,-.25,.1]),[.25,.02,.18],[0,0,0],'#4fc3f7',{part:id});g.ball(V.add(u,[-.2,0,-.1]),.15,'#43a047',{part:id});g.ball(V.add(u,[.25,-.05,-.15]),.08,'#ff8a65',{part:id});}
      if(i===7){g.ball(V.add(u,[0,.05,0]),.3,'#1e88e5',{part:id});g.ell(V.add(u,[.05,.1,.12]),[.15,.12,.12],[0,0,.4],'#66bb6a',{part:id});}
      g.label(id,V.add(c,[0,.75,0]));
    }
  }};

S.cork={size:7.2,pitch:.7,parts:{cell:'Жасуша (ұяшық)',wall:'Жасуша қабырғасы'},
  steps:[{cap:'1665 ж. Роберт Гук тығынның жұқа кесіндісін микроскоппен қарап, ұяшықтарды көрді және оларды «cellula» — жасуша деп атады.',dur:6,hl:'cell'},
    {cap:'Гук көрген — тірі жасушалар емес, өлі жасушалардың қабырғалары еді.',dur:5,hl:'wall'},
    {cap:'Левенгук (1670-ж.) бір жасушалы тірі организмдерді, Р. Броун (1831) ядроны ашты.',dur:5},
    {cap:'Шлейден (1838) мен Шванн (1839) жасуша теориясын тұжырымдады; Р. Вирхов (1855): «Әрбір жасуша — жасушадан».',dur:6}],
  build(g){
    const r=.42,h=.35;
    for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++){
      const x=i*r*1.75+(j%2?r*.87:0),z=j*r*1.5;if(Math.hypot(x,z)>3)continue;
      const top=[],bot=[];for(let k=0;k<6;k++){const a=k*Math.PI/3+Math.PI/6;top.push([x+Math.cos(a)*r,h,z+Math.sin(a)*r]);bot.push([x+Math.cos(a)*r,-h,z+Math.sin(a)*r]);}
      for(let k=0;k<6;k++){const n=(k+1)%6;g.poly([top[k],top[n],bot[n],bot[k]],'#a1693c',{part:'wall',alpha:.95,stroke:true,lw:.8});}
      g.poly(bot,'#5d3a1a',{part:'cell',alpha:.9,zb:-.5});
    }
    g.label('cell',[0,h,0]);g.label('wall',[r*1.75,h,0]);
  }};

S.onion={size:6.4,pitch:1.0,yaw:-.2,parts:{wall:'Жасуша қабырғасы',nucleus:'Ядро',cytoplasm:'Цитоплазма',vacuole:'Вакуоль'},
  steps:[{cap:'Пияз қабықшасының жасушалары микроскоппен қарағанда осылай көрінеді. Сызба салғанда қабырғаны, ядроны, цитоплазманы белгілейміз.',dur:6},
    {cap:'Жасуша қабырғасы — жасушаның пішінін сақтайды.',dur:4,hl:'wall'},{cap:'Ядро — дөңгелек, айқын көрінеді (йодпен боялғанда).',dur:4,hl:'nucleus'},
    {cap:'Сызбаны қарындашпен, анық сызықпен саламыз, бөліктерін сызықшамен белгілеп, үлкейтуін жазамыз.',dur:6}],
  build(g){
    for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){
      const x=i*1.05+(j%2?.5:0),z=j*.5;const c=[x,0,z];
      box(g,c,[.5,.08,.23],C.wall,{part:'wall',alpha:.55,stroke:true,lw:1.2});
      g.ell(V.add(c,[.05,.02,0]),[.36,.05,.14],[0,0,0],C.vac,{part:'vacuole',alpha:.35});
      g.ell(V.add(c,[(i+j)%2?.25:-.25,.1,.04]),[.08,.05,.08],[0,0,0],C.nuc,{part:'nucleus'});
    }
    g.label('wall',[.5,.1,.23]);g.label('nucleus',[-.25,.15,.04]);g.label('vacuole',[1.1,.1,0]);g.label('cytoplasm',[-1,.1,-.4]);
  }};

const animalParts=pick(['membrane','cytoplasm','nucleus','nucleolus','mito','rer','ser','golgi','lyso','ribo','centriole']);
S.animal={size:6.9,pitch:.3,parts:animalParts,
  steps:[{cap:'Жануар жасушасы: сыртын қабықша қаптайды, ішінде цитоплазма мен органоидтар бар.',dur:5},
    {cap:'Жасуша қабықшасы — заттардың өтуін реттейді, жасушаны қорғайды.',dur:4,hl:'membrane'},
    {cap:'Ядро — тұқым қуалау ақпаратын сақтайды және жасушаны басқарады.',dur:4,hl:'nucleus'},
    {cap:'Митохондрия — АТФ түзеді, «энергия станциясы».',dur:4,hl:'mito'},
    {cap:'Түйіршікті ЭПТ бетінде рибосомалар бар — нәруыз түзіледі.',dur:4,hl:'rer'},
    {cap:'Гольджи кешені — заттарды жинақтап, сұрыптап, жасушадан шығарады.',dur:4,hl:'golgi'},
    {cap:'Лизосома — ферменттері арқылы заттарды ыдыратады.',dur:4,hl:'lyso'},
    {cap:'Жасуша орталығы (центриольдер) — жасуша бөлінуіне қатысады. Өсімдік жасушасында жоқ!',dur:5,hl:'centriole'}],
  build(g){animalCell(g,[0,0,0],1);}};
S.tour=Object.assign({},S.animal,{steps:[{cap:'Қорытынды саяхат: жасушаның құпия әлемін еске түсірейік!',dur:4},
  ...Object.keys(animalParts).map(k=>({cap:animalParts[k]+' — бұл органоидтың қызметін ауызша айтып көр.',dur:3.5,hl:k}))]});

S.plant={size:7.6,pitch:.35,parts:pick(['wall','membrane','cytoplasm','vacuole','nucleus','chloro','mito','golgi','rer']),
  steps:[{cap:'Өсімдік жасушасы: пішіні тұрақты, сыртында целлюлозалы жасуша қабырғасы бар.',dur:5,hl:'wall'},
    {cap:'Орталық үлкен вакуоль жасуша шырынына толы, тургорды сақтайды.',dur:4,hl:'vacuole'},
    {cap:'Хлоропластарда фотосинтез жүреді — тек өсімдікке тән!',dur:4,hl:'chloro'},
    {cap:'Ядро үлкен вакуольдің әсерінен шетке ығысқан.',dur:4,hl:'nucleus'},
    {cap:'Өсімдік жасушасында да митохондрия, ЭПТ, Гольджи кешені бар.',dur:5,hl:'mito'}],
  build(g){plantCell(g,[0,0,0],1);}};

S.compare={size:8.6,pitch:.35,parts:{pc:'Өсімдік жасушасы',ac:'Жануар жасушасы',wall:'Жасуша қабырғасы',vacuole:'Үлкен вакуоль',chloro:'Хлоропласт',centriole:'Жасуша орталығы',nucleus:'Ядро',mito:'Митохондрия'},
  steps:[{cap:'Сол жақта — өсімдік, оң жақта — жануар жасушасы. Ортақ белгілерін тап: ядро, цитоплазма, митохондрия, ЭПТ...',dur:6,hl:'nucleus'},
    {cap:'Айырмашылық 1: өсімдікте целлюлозалы қабырға бар.',dur:4,hl:'wall'},{cap:'Айырмашылық 2: өсімдікте хлоропласт бар.',dur:4,hl:'chloro'},
    {cap:'Айырмашылық 3: өсімдікте орталық үлкен вакуоль бар.',dur:4,hl:'vacuole'},{cap:'Айырмашылық 4: жануар жасушасында жасуша орталығы бар, қор зат — гликоген (өсімдікте — крахмал).',dur:5,hl:'centriole'}],
  build(g){plantCell(g,[-2.1,0,0],.62,{labels:false});animalCell(g,[2.2,0,0],.68,{labels:false});
    g.label('pc',[-2.1,1.5,0]);g.label('ac',[2.2,1.75,0]);g.label('wall',[-.5,-1.1,1.1]);g.label('vacuole',[-1.9,0,0]);g.label('chloro',[-.9,.55,-.55]);g.label('centriole',[2.47,-.27,.88]);g.label('nucleus',[2.1,.65,0]);g.label('mito',[3.08,.4,.34]);}};

S.prok={size:8.4,pitch:.3,parts:{capsule:'Капсула',wall:'Жасуша қабырғасы (муреин)',nucleoid:'Нуклеоид (сақина ДНҚ)',plasmid:'Плазмида',ribo:'Рибосомалар (ұсақ)',flag:'Талшық (жгутик)',pili:'Кірпікшелер (пили)',euk:'Эукариот жасуша (ядросы бар)'},
  steps:[{cap:'Прокариот (бактерия) жасушасында қалыптасқан ядро жоқ. ДНҚ цитоплазмада — нуклеоид аймағында.',dur:6,hl:'nucleoid'},
    {cap:'Плазмидалар — қосымша кішкентай сақина ДНҚ.',dur:4,hl:'plasmid'},{cap:'Мембраналы органоидтар (митохондрия, ЭПТ, Гольджи) жоқ, тек ұсақ рибосомалар бар.',dur:5,hl:'ribo'},
    {cap:'Сыртында муреинді қабырға, көбінде капсула болады. Талшық арқылы қозғалады.',dur:5,hl:'flag'},
    {cap:'Эукариот жасушасы әлдеқайда ірі: 10–100 мкм, ядросы мен мембраналы органоидтары бар. Прокариот — 1–10 мкм.',dur:6,hl:'euk'}],
  build(g){
    const c=[-1.6,0,0];
    g.ell(c,[1.75,.72,.72],[0,0,0],'#a5d6a7',{shell:1,alpha:.35,part:'capsule'});
    g.ell(c,[1.55,.58,.58],[0,0,0],'#66bb6a',{shell:1,alpha:.55,part:'wall'});
    for(let i=0;i<40;i++){const a=i/40*Math.PI*2;const p=V.add(c,[Math.cos(a)*.6+Math.sin(a*5)*.15,Math.sin(a*3)*.15,Math.sin(a)*.3]);g.ball(p,.045,'#3949ab',{part:'nucleoid'});}
    for(const pc of[[-.9,.25,.2],[.95,-.2,-.15]])for(let i=0;i<10;i++){const a=i/10*Math.PI*2;g.ball(V.add(V.add(c,pc),[Math.cos(a)*.13,Math.sin(a)*.13,0]),.03,'#e4572e',{part:'plasmid'});}
    const R=rng(9);for(let i=0;i<26;i++){const p=V.add(c,[(R()*2-1)*1.25,(R()*2-1)*.4,(R()*2-1)*.4]);g.ball(p,.035,C.ribo,{part:'ribo'});}
    for(let i=0;i<22;i++){const x=-1.75-i*.12;g.ball(V.add([x,0,0],[0,Math.sin(i*.8-g.t*6)*.18,Math.cos(i*.8-g.t*6)*.06]),.03,'#5d4037',{part:'flag'});}
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const b=V.add(c,[Math.cos(a)*1.2,Math.sin(a)*.6,Math.sin(a*2)*.4]);g.line(b,V.add(b,[Math.cos(a)*.35,Math.sin(a)*.3,0]),'#795548',1.2,{part:'pili'});}
    animalCell(g,[2.4,0,0],.48,{labels:false});
    g.ell([2.4,0,0],[1.28,1.1,1.12],[0,0,0],'#ffffff',{shell:1,alpha:.02,part:'euk'});
    g.label('capsule',V.add(c,[0,.72,0]));g.label('wall',V.add(c,[1.55,0,0]));g.label('nucleoid',V.add(c,[.2,.1,.3]));g.label('plasmid',V.add(c,[-.9,.38,.2]));
    g.label('ribo',V.add(c,[.6,-.35,.2]));g.label('flag',[-4.1,0,0]);g.label('pili',V.add(c,[1.4,.55,.2]));g.label('euk',[2.4,1.15,0]);
  }};

S.cyto={size:7.4,pitch:.45,parts:{cytoplasm:'Гиалоплазма (цитозоль)',chloro:'Хлоропласт (ағынмен қозғалады)',starch:'Крахмал дәндері',fat:'Май тамшылары',protein:'Нәруыз түйіршіктері',cytosk:'Цитоқаңқа',nucleus:'Ядро'},
  steps:[{cap:'Цитоплазма — жасушаның ішкі жартылай сұйық ортасы. Ол үнемі қозғалыста болады — бұл циклоз (цитоплазма ағысы).',dur:6,hl:'chloro'},
    {cap:'Гиалоплазма — органоидтарды біріктіретін тұтқыр ерітінді: су, тұздар, нәруыздар.',dur:5,hl:'cytoplasm'},
    {cap:'Қосындылар — уақытша құрылымдар: крахмал дәндері, май тамшылары, нәруыз түйіршіктері.',dur:5,hl:'starch'},
    {cap:'Цитоқаңқа — микротүтікшелер мен микрожіпшелер торы, жасуша пішінін сақтайды.',dur:5,hl:'cytosk'}],
  build(g){
    box(g,[0,0,0],[2.6,1.6,1.4],C.wall,{alpha:.25,stroke:true,part:'wall'});
    box(g,[0,0,0],[2.45,1.45,1.25],'#fde2ea',{alpha:.12,stroke:false,part:'cytoplasm'});
    O.vacuole(g,[.2,0,0],[1.6,.85,.75],{alpha:.35});
    O.nucleus(g,[-1.9,.8,.7],.45,{noChromatin:1});
    // циклоз: хлоропластар қабырға бойымен айналады
    const loop=u=>{u=((u%1)+1)%1;const W=2.1,H=1.15;const per=2*(W+H);let d=u*per*2;
      let x,y;if(d<2*W){x=-W+d;y=H;}else if((d-=2*W)<2*H){x=W;y=H-d;}else if((d-=2*H)<2*W){x=W-d;y=-H;}else{d-=2*W;x=-W;y=-H+d;}return [x,y];};
    for(let i=0;i<14;i++){const u=i/14+g.t*.035;const [x,y]=loop(u);O.chloro(g,[x,y,i%2?.8:-.8],.24,[0,0,i]);}
    const R=rng(21);
    for(let i=0;i<5;i++)g.ell([(R()-.5)*3,(R()-.5)*1.8,(R()-.5)*1.8],[.14,.1,.1],[R(),R(),0],'#f5f5f5',{part:'starch',stroke:true});
    for(let i=0;i<6;i++)g.ball([(R()-.5)*3.6,(R()-.5)*2,(R()-.5)*2],.09,'#ffd54f',{part:'fat'});
    for(let i=0;i<6;i++)g.ball([(R()-.5)*3.6,(R()-.5)*2,(R()-.5)*2],.06,'#a1887f',{part:'protein'});
    for(let i=0;i<10;i++){const a=[(R()-.5)*4.6,(R()-.5)*2.6,(R()-.5)*2.2],b=[(R()-.5)*4.6,(R()-.5)*2.6,(R()-.5)*2.2];g.line(a,b,'#9575cd',1,{part:'cytosk',alpha:.6});}
    g.label('cytoplasm',[1.9,-1.2,1.2]);g.label('chloro',[0,1.15,.8]);g.label('nucleus',[-1.9,1.25,.7]);g.label('cytosk',[-1.5,-1.1,-.9]);
    const R2=rng(21);for(let i=0;i<5;i++){const p=[(R2()-.5)*3,(R2()-.5)*1.8,(R2()-.5)*1.8];R2();R2();if(i===0)g.label('starch',p);}
    const R3=rng(21);for(let i=0;i<20;i++)R3();g.label('fat',[(R3()-.5)*3.6,(R3()-.5)*2,(R3()-.5)*2]);
  }};

S.vacuole={size:7.6,pitch:.35,parts:{wall:'Жасуша қабырғасы',membrane:'Цитоплазмалық мембрана',vacuole:'Вакуоль (жасуша шырыны)',water:'Су молекулалары',nucleus:'Ядро',chloro:'Хлоропласт'},
  steps:[{cap:'Вакуоль — тонопласт мембранасымен қапталған, жасуша шырынына толы көпіршік. Ол жасушаға тургор (серпімділік) береді.',dur:6,hl:'vacuole'},
    {cap:'Жасушаны тұзды (гипертониялық) ерітіндіге салсақ, су жасушадан шығады — вакуоль кішірейіп, протопласт қабырғадан ажырайды. Бұл — плазмолиз.',dur:7,hl:'water',anim:5},
    {cap:'Таза суға қайта салсақ, су жасушаға енеді, вакуоль қалпына келеді — деплазмолиз.',dur:7,hl:'vacuole',anim:5}],
  build(g){
    const st=g.step,k=ease(g.k);let p=1;if(st===1)p=lerp(1,.62,k);if(st===2)p=lerp(.62,1,k);
    plantCell(g,[0,0,0],1,{proto:p,labels:false});
    const R=rng(4);for(let i=0;i<16;i++){const d=fib(16,i);let r;
      if(st===1)r=lerp(1.2,3.2,(g.k*1.3+R()*.3)%1);else if(st===2)r=lerp(3.2,1.2,(g.k*1.3+R()*.3)%1);else{R();r=0;}
      if(r>0){const p2=[d[0]*r*1.3,d[1]*r*.8,d[2]*r*.8];g.ball(p2,.07,'#29b6f6',{part:'water'});g.ball(V.add(p2,[.07,.05,0]),.04,'#ffffff',{part:'water'});}}
    g.label('wall',[2.6,1.75,0]);g.label('membrane',[2.45*p,-1.6*p,1.6*p]);g.label('vacuole',[.3*p,.3,0]);g.label('nucleus',[-1.75*p,1.25*p,.6*p]);
    if(st>0)g.label('water',[3.2,0,0]);
  }};

S.plastids={size:7.4,pitch:.3,parts:{chloro:'Хлоропласт (жасыл)',chromo:'Хромопласт (сары, қызыл)',leuco:'Лейкопласт (түссіз)',grana:'Граналар (тилакоидтар)',stroma:'Строма',starch:'Крахмал дәні'},
  steps:[{cap:'Пластидтер — тек өсімдік жасушасына тән органоидтар. Үш түрі бар.',dur:4},
    {cap:'Хлоропласт: хлорофилл пигменті бар, фотосинтез жүреді. Ішінде тилакоидтардан тұратын граналар мен строма бар.',dur:6,hl:'chloro'},
    {cap:'Хромопласт: каротиноидтар (сары, қызғылт сары, қызыл). Гүл, жеміс, күзгі жапырақтарға түс береді.',dur:5,hl:'chromo'},
    {cap:'Лейкопласт: түссіз, қор заттар (крахмал) жинайды — мысалы, картоп түйнегінде.',dur:5,hl:'leuco'},
    {cap:'Пластидтер бір-біріне айнала алады: жарықта картоп көгереді (лейко → хлоро), қызанақ піскенде қызарады (хлоро → хромо).',dur:7,anim:5}],
  build(g){
    const k=g.step===4?ease(g.k):0;
    const mix=(a,b,t)=>{const A=E3D.shade(a,0),B=E3D.shade(b,0);return A.map((v,i)=>Math.round(v+(B[i]-v)*t));};
    O.chloro(g,[-2.4,0,0],.95,[0,.3,0],{color:mix('#4caf50','#ef6c00',k),part:'chloro'});
    // хромопласт
    g.ell([0,0,0],[.85,.5,.48],[0,-.3,.2],'#ff9800',{shell:1,alpha:.7,part:'chromo'});
    const R=rng(2);for(let i=0;i<14;i++)g.ball([(R()-.5)*1.1,(R()-.5)*.55,(R()-.5)*.5],.09,i%2?'#e53935':'#ffb300',{part:'chromo'});
    // лейкопласт
    g.ell([2.4,0,0],[.85,.55,.5],[0,.4,0],mix('#eceff1','#66bb6a',k),{shell:1,alpha:.7,part:'leuco'});
    g.ell([2.35,0,.05],[.42,.3,.28],[0,0,.5],'#ffffff',{part:'starch',stroke:true});
    g.label('chloro',[-2.4,.6,0]);g.label('grana',[-2.1,0,.2]);g.label('stroma',[-2.9,-.3,.3]);g.label('chromo',[0,.6,0]);g.label('leuco',[2.4,.65,0]);g.label('starch',[2.35,0,.35]);
  }};

S.nucleus={size:6.6,pitch:.3,parts:{nucleus:'Ядро қабықшасы (екі мембрана)',pores:'Ядро тесіктері',chromatin:'Хроматин',nucleolus:'Ядрошық',nplasm:'Ядро шырыны (кариоплазма)',rer:'Түйіршікті ЭПТ',ribo:'Рибосома суббірліктері'},
  steps:[{cap:'Ядро — жасушаның басқару орталығы. Тұқым қуалау ақпараты (ДНҚ) осында сақталады.',dur:5},
    {cap:'Ядро қабықшасы екі мембранадан тұрады, сыртқы мембранасы ЭПТ-мен жалғасады.',dur:5,hl:'nucleus'},
    {cap:'Ядро тесіктері (поралары) арқылы ядро мен цитоплазма арасында зат алмасу жүреді (мысалы, иРНҚ шығады).',dur:5,hl:'pores'},
    {cap:'Хроматин — ДНҚ мен нәруыз кешені. Бөліну кезінде хромосомаға айналады.',dur:5,hl:'chromatin'},
    {cap:'Ядрошықта рРНҚ түзіліп, рибосома суббірліктері құрастырылады.',dur:5,hl:'nucleolus'}],
  build(g){O.nucleus(g,[0,0,0],1.8);g.ball([0,0,0],1.6,'#e8e0fb',{shell:1,alpha:.06,part:'nplasm'});
    O.er(g,[1.9,-.6,-.6],1,[.3,.6,1.2],true);
    for(let i=0;i<5;i++){const u=(g.t*.25+i/5)%1;const d=fib(16,i*3);const p=V.add(V.mul(d,1.8*(.4+u*1.1)),[0,0,0]);O.ribo(g,p,.05,'ribo');}
    g.label('nucleus',[0,1.8,0]);g.label('pores',V.mul(fib(16,3),1.85));g.label('nucleolus',[.36,.27,.18]);g.label('chromatin',V.mul(fib(22,9),1.1));g.label('rer',[1.9,-.35,-.6]);g.label('nplasm',[-.6,-.7,.4]);
  }};

S.chromo={size:7,pitch:.2,parts:{dna:'ДНҚ қос тізбегі',histone:'Гистон нәруыздары (нуклеосома)',fiber:'Хроматин жіпшесі',chromatid:'Хроматида',centromere:'Центромера',arm:'Хромосома иықтары',telomere:'Теломера'},
  steps:[{cap:'ДНҚ молекуласы өте ұзын жіпше. Ол жасуша ядросына сыю үшін бірнеше рет ширатылады.',dur:5,hl:'dna'},
    {cap:'ДНҚ гистон нәруыздарына оралып, нуклеосомалар түзеді — «моншақ тізбегі» сияқты.',dur:5,hl:'histone'},
    {cap:'Нуклеосомалар тығыз ширатылып, хроматин жіпшесін құрайды.',dur:5,hl:'fiber'},
    {cap:'Бөліну алдында хроматин барынша ширатылып, хромосомаға айналады. Хромосома екі хроматидадан тұрады, олар центромерада жалғасады.',dur:7,hl:'centromere'}],
  build(g){const st=g.step;
    if(st===0){helix(g,{c:[0,0,0],len:5,R:.35,turns:4,n:60,part:'dna'});g.label('dna',[0,2.5,0]);}
    if(st===1){for(let i=0;i<7;i++){const c=[(i-3)*.75,Math.sin(i*1.3)*.4,0];g.ell(c,[.26,.2,.26],[0,0,.3],'#ab47bc',{part:'histone'});
        for(let j=0;j<14;j++){const a=j/14*Math.PI*3.4;g.ball(V.add(c,[Math.cos(a)*.3,(j/14-.5)*.4,Math.sin(a)*.3]),.035,'#4fc3f7',{part:'dna'});}
        if(i<6){g.line(V.add(c,[.3,.1,0]),[(i-2)*.75-.3,Math.sin((i+1)*1.3)*.4-.1,0],'#4fc3f7',2,{part:'dna'});}}
      g.label('histone',[-2.25,.6,0]);g.label('dna',[.75,.8,0]);}
    if(st===2){for(let i=0;i<80;i++){const u=i/80;const a=u*Math.PI*2*7;g.ball([Math.cos(a)*.45,(u-.5)*4.4,Math.sin(a)*.45],.14,'#ab47bc',{part:'fiber'});}g.label('fiber',[.5,2.2,0]);}
    if(st===3){const e=ease(g.k);
      for(const sgn of[-1,1])for(let i=0;i<46;i++){const y=(i/45-.5)*3.6+.3;const dy=y-.45;const cen=Math.abs(dy)<.18;
        const x=sgn*(.13+Math.abs(dy)*.2*e);g.ball([x,y,0],cen?.12:.22,sgn<0?'#7e57c2':'#9575cd',{part:cen?'centromere':(Math.abs(y)>1.85?'telomere':'chromatid')});}
      g.label('chromatid',[-.45,-.7,0]);g.label('centromere',[0,.45,.15]);g.label('arm',[.5,1.3,0]);g.label('telomere',[.55,2.05,0]);}
  }};

S.er={size:7.4,pitch:.4,parts:{rer:'Түйіршікті (бүдірлі) ЭПТ',ser:'Тегіс ЭПТ',ribo:'Рибосомалар',nucleus:'Ядро',protein:'Түзілген нәруыз',lipid:'Липидтер'},
  steps:[{cap:'Эндоплазмалық тор — цитоплазманы торлайтын түтікшелер мен қуыстар жүйесі. Ол ядро қабықшасымен жалғасады.',dur:6,hl:'nucleus'},
    {cap:'Түйіршікті ЭПТ бетінде рибосомалар орналасқан — мұнда нәруыздар түзіледі.',dur:5,hl:'rer'},
    {cap:'Тегіс ЭПТ-да рибосома жоқ: липидтер мен көмірсулар түзіледі, улы заттар залалсызданады (бауыр жасушасында көп).',dur:6,hl:'ser'},
    {cap:'ЭПТ арналары арқылы заттар жасуша ішінде тасымалданады.',dur:5,hl:'protein'}],
  build(g){
    g.ball([-3.2,0,0],1.4,C.nuc,{shell:1,alpha:.4,part:'nucleus'});
    O.er(g,[-1.1,-.4,0],1.6,[0,0,0],true,{part:'rer',riboPart:'ribo'});
    for(let k=0;k<5;k++){for(let i=0;i<22;i++){const u=i/21;const p=[.7+u*2.2,Math.sin(u*5+k)*.5+(k-2)*.35,Math.cos(u*4+k*1.7)*.6];g.ball(p,.1,'#7ab8e0',{part:'ser'});}}
    for(let i=0;i<6;i++){const u=(g.t*.2+i/6)%1;g.ball([-1.8+u*2.2,-.25+((i%3)*.35),Math.sin(u*6)*.15],.06,'#ff7043',{part:'protein'});}
    for(let i=0;i<5;i++){const u=(g.t*.15+i/5)%1;g.ball([1+u*1.8,(i-2)*.35+Math.sin(u*5+i)*.5,.05],.06,'#ffd54f',{part:'lipid'});}
    g.label('rer',[-1.1,.25,0]);g.label('ser',[2,.5,.3]);g.label('nucleus',[-3.2,1.4,0]);g.label('ribo',[-1.6,-.3,.4]);
  }};

S.golgi={size:7.4,pitch:.35,parts:{er:'ЭПТ',vesicle:'Тасымалдаушы көпіршіктер',golgi:'Гольджи кешені (цистерналар)',membrane:'Жасуша қабықшасы',secret:'Секреция (заттың шығуы)',lyso:'Лизосома'},
  steps:[{cap:'Гольджи кешені — жалпақ қуыстар (цистерналар) мен көпіршіктер жиынтығы. 1898 ж. Камилло Гольджи ашқан.',dur:6,hl:'golgi'},
    {cap:'ЭПТ-да түзілген заттар көпіршіктермен Гольджи кешеніне жеткізіледі.',dur:5,hl:'vesicle'},
    {cap:'Мұнда заттар жинақталып, өзгертіліп, сұрыпталып «қапталады».',dur:5,hl:'golgi'},
    {cap:'Дайын көпіршіктер жасуша қабықшасына қосылып, затты сыртқа шығарады — секреция. Лизосомалар да осында түзіледі.',dur:6,hl:'secret'}],
  build(g){
    O.er(g,[-2.5,-.3,0],1.1,[0,0,1.57],true,{part:'er'});
    O.golgi(g,[0,0,0],1.7,[0,0,1.57]);
    g.poly([[2.9,-2,-1.6],[2.9,2,-1.6],[2.9,2,1.6],[2.9,-2,1.6]],C.mem,{alpha:.3,stroke:true,part:'membrane'});
    for(let i=0;i<4;i++){const u=(g.t*.3+i/4)%1;g.ball([-2+u*1.6,(i-1.5)*.45,(i%2)*.3],.12,'#90caf9',{part:'vesicle'});}
    for(let i=0;i<4;i++){const u=(g.t*.3+i/4+.12)%1;const x=.6+u*2.3;g.ball([x,(i-1.5)*.5,(i%2-.5)*.4],u>.92?.12*(1-(u-.92)*12):.12,'#f7d77c',{part:'secret'});}
    O.lyso(g,[1.2,-1.4,.6],.2);
    g.label('er',[-2.5,.4,0]);g.label('golgi',[0,1,0]);g.label('vesicle',[-1.2,.7,.3]);g.label('membrane',[2.9,1.8,0]);g.label('secret',[2.4,.25,0]);g.label('lyso',[1.2,-1.2,.6]);
  }};

S.lyso={size:6.6,pitch:.3,parts:{membrane:'Жасуша қабықшасы',bact:'Бактерия (тағам бөлшегі)',phago:'Фагоцитоздық көпіршік',lyso:'Лизосома (ферменттер)',golgi:'Гольджи кешені'},
  steps:[{cap:'Лизосома — бір мембраналы көпіршік, ішінде 40-тан астам ыдыратушы (гидролиздік) фермент бар. 1955 ж. К. де Дюв ашқан.',dur:6,hl:'lyso'},
    {cap:'Жасуша бактерияны қамтып алады — фагоцитоз. Ол көпіршік ішіне түседі.',dur:6,hl:'bact',anim:5},
    {cap:'Лизосома көпіршікпен қосылып, ферменттерін құяды.',dur:5,hl:'lyso',anim:4},
    {cap:'Бактерия ыдырайды — жасушаішілік қорыту. Ескірген органоидтарды да лизосома жояды (аутофагия).',dur:6,hl:'phago',anim:5}],
  build(g){const st=g.step,k=ease(g.k);
    g.ell([0,0,0],[2.6,2.1,2.1],[0,0,0],C.mem,{shell:1,alpha:.35,part:'membrane'});
    O.golgi(g,[-1.2,.8,-.6],.8,[.3,.2,.2]);O.nucleus(g,[-1.2,-.6,.3],.6,{noChromatin:1});
    let bx=3.4,ls=[-.3,.9,0],bs=1;
    if(st===1)bx=lerp(3.4,1.1,k);if(st>=2)bx=1.1;if(st===2)ls=V.lerp([-.3,.9,0],[.85,.25,0],k);if(st===3){ls=[.85,.25,0];bs=lerp(1,0,k);}
    if(st>=1){const vk=st===1?Math.max(0,(k-.6)/.4):1;if(vk>0)g.ball([bx,0,0],.62,'#e1bee7',{shell:1,alpha:.5*vk,part:'phago'});}
    if(bs>.05){g.ell([bx,0,0],[.45*bs,.22*bs,.22*bs],[0,0,.4],'#66bb6a',{part:'bact'});}
    if(st===3)for(let i=0;i<8;i++){const d=fib(8,i);g.ball(V.add([bx,0,0],V.mul(d,.25*k+.05)),.05,'#81c784',{part:'bact',alpha:k});}
    if(st<3)O.lyso(g,ls,.24);
    if(st===3&&k<.4)O.lyso(g,ls,.24*(1-k*2.5));
    g.label('membrane',[0,2.1,0]);g.label('golgi',[-1.2,1.1,-.6]);g.label('lyso',st<3?ls:[bx,.62,0]);g.label('bact',[bx,.3,0]);if(st>=1)g.label('phago',[bx,-.62,0]);
  }};

S.mito={size:6.4,pitch:.35,parts:{outer:'Сыртқы мембрана (тегіс)',inner:'Ішкі мембрана',cristae:'Кристалар',matrix:'Матрикс',mdna:'Митохондрия ДНҚ-сы (сақина)',ribo:'Рибосомалар',atp:'АТФ молекулалары'},
  steps:[{cap:'Митохондрия — екі мембраналы органоид, жасушаның «энергия станциясы».',dur:5,hl:'outer'},
    {cap:'Ішкі мембрана қатпарланып, кристалар түзеді — бетінің ауданы ұлғаяды.',dur:5,hl:'cristae'},
    {cap:'Матриксте өз ДНҚ-сы (сақина тәрізді) мен рибосомалары бар — сондықтан митохондрия өздігінен көбейе алады.',dur:6,hl:'mdna'},
    {cap:'Кристаларда оттекпен тотығу жүріп, АТФ түзіледі. Бұлшықет пен жүрек жасушаларында митохондрия өте көп.',dur:6,hl:'atp'}],
  build(g){const L=2.6,w=1.1;
    g.ell([0,0,0],[L,w,w],[0,0,0],C.mito,{shell:1,alpha:.45,part:'outer'});
    g.ell([0,0,0],[L*.93,w*.9,w*.9],[0,0,0],'#f6a26e',{shell:1,alpha:.25,part:'inner'});
    for(let i=0;i<9;i++){const x=(i/8*2-1)*L*.75;const sh=Math.sqrt(1-(x/L)**2);
      g.ell([x,(i%2?.25:-.25),0],[.06,w*.6*sh,w*.75*sh],[0,0,0],C.crist,{part:'cristae'});}
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2;g.ball([-.4+Math.cos(a)*.3,.55,Math.sin(a)*.3],.04,'#3949ab',{part:'mdna'});}
    const R=rng(6);for(let i=0;i<14;i++)g.ball([(R()-.5)*4,(R()-.5)*1.2,(R()-.5)*1.2],.05,C.ribo,{part:'ribo'});
    for(let i=0;i<10;i++){const u=(g.t*.25+i/10)%1;const d=fib(10,i);const p=[d[0]*(1+u*1.6)*L*.5,d[1]*(.4+u*1.4),d[2]*(.4+u*1.4)];
      g.ball(p,.09,'#ffeb3b',{part:'atp',alpha:1-u*.6});if(i%3===0)g.text(V.add(p,[0,.2,0]),'АТФ',{size:10,color:'#7a5b00',alpha:1-u});}
    g.label('outer',[0,w,0]);g.label('inner',[-L*.93,0,0]);g.label('cristae',[.6,.4,.5]);g.label('matrix',[1.6,-.4,.3]);g.label('mdna',[-.4,.75,0]);g.label('atp',[2.4,1.3,0]);
  }};

function mrna(g,x0,n,step,seq,part){const out=[];for(let i=0;i<n;i++){const ch=seq?seq[i%seq.length]:'АУГЦ'[i%4];const p=[x0+i*step,0,0];out.push(p);g.ball(p,.1,BASEC[ch]||'#888',{part:part||'mrna'});if(i>0)g.line(V.add(p,[-step,0,0]),p,'#9e9e9e',2,{part:part||'mrna'});}return out;}
S.ribo={noAuto:1,size:6.4,pitch:.25,parts:{small:'Кіші суббірлік',large:'Үлкен суббірлік',mrna:'иРНҚ',chain:'Нәруыз тізбегі (амин қышқылдары)',er:'ЭПТ мембранасы'},
  steps:[{cap:'Рибосома — мембранасыз ең ұсақ органоид. Ол рРНҚ мен нәруыздан тұратын екі суббірліктен құралған.',dur:5,hl:'large'},
    {cap:'Кіші суббірлік иРНҚ-ға бекінеді, оған үлкен суббірлік қосылады.',dur:5,hl:'small',anim:4},
    {cap:'Рибосома иРНҚ бойымен жылжып, амин қышқылдарын біріктіреді — нәруыз тізбегі өседі.',dur:7,hl:'chain'},
    {cap:'Рибосомалар цитоплазмада бос немесе ЭПТ бетінде орналасады. Бір иРНҚ-да бірнеше рибосома болса — полисома.',dur:6,hl:'er'}],
  build(g){const st=g.step,k=ease(g.k);
    mrna(g,-3,31,.2,'АУГГЦАУУУГЦЦАГАУГГЦУААГЦА');
    let x=-1.4,ly=1.6,lx=-1.4;if(st===1){ly=lerp(1.6,.55,k);}if(st>=1)ly=st===1?ly:.55;if(st===0)ly=1.6;
    if(st>=2)x=lerp(-1.4,1.2,st===2?g.k:1);lx=x;
    g.ell([x,-.35,0],[.55,.3,.45],[0,0,0],'#78909c',{part:'small'});
    g.ell([lx,ly,0],[.75,.5,.6],[0,0,0],'#455a64',{part:'large'});
    if(st>=2){const n=Math.floor((x+1.4)/.6)+1;for(let i=0;i<n;i++)g.ball([x-.1-i*.12,ly+.6+i*.25,Math.sin(i)*.2],.12,['#ef5350','#ab47bc','#26a69a','#ffa726','#5c6bc0'][i%5],{part:'chain'});}
    if(st===3){g.poly([[-3.2,-1.1,-1.6],[3.2,-1.1,-1.6],[3.2,-1.1,-.3],[-3.2,-1.1,-.3]],C.er,{alpha:.45,stroke:true,part:'er'});
      for(let i=0;i<5;i++)O.ribo(g,[-2.6+i*1.3,-.95,-.95],.12,'ribo');}
    g.label('small',[x,-.65,0]);g.label('large',[lx,ly+.5,0]);g.label('mrna',[-2.8,-.2,0]);if(st>=2)g.label('chain',[x-.3,ly+1.2,0]);if(st===3)g.label('er',[2.6,-1.1,-1]);
  }};

S.chem={noAuto:1,size:7,pitch:.2,parts:{O:'Оттек ~65%',Cc:'Көміртек ~18%',H:'Сутек ~10%',N:'Азот ~3%',macro:'Макроэлементтер (K, Na, Ca, Mg, P, S, Cl, Fe)',micro:'Микроэлементтер (Zn, Cu, I, F, Mn, Co)',water:'Су молекуласы (H₂O)'},
  steps:[{cap:'Жасушада 70-тен астам химиялық элемент бар. O, C, H, N — органогендер, жасуша массасының ~98%-ы.',dur:6,hl:'O'},
    {cap:'Макроэлементтер: K, Na, Ca, Mg, P, S, Cl, Fe — жасушада көп мөлшерде (0,01%-дан жоғары).',dur:5,hl:'macro'},
    {cap:'Микроэлементтер: Zn, Cu, I, F, Mn, Co — өте аз, бірақ өте маңызды (мысалы, йод — қалқанша без гормонында).',dur:6,hl:'micro'},
    {cap:'Су — жасушаның 70–80%-ы. Ол еріткіш, тасымалдаушы, жылуды реттейді.',dur:6,hl:'water'}],
  build(g){
    const E=[['O',.85,'#e53935',-2.6],['Cc',.62,'#424242',-1.0],['H',.48,'#eceff1',.2],['N',.3,'#3949ab',1.1]];
    E.forEach(e=>{g.ball([e[3],-1.2+e[1],0],e[1],e[2],{part:e[0]});g.text([e[3],-1.2+e[1],e[1]+.05],e[0]==='Cc'?'C':e[0],{size:16,color:e[0]==='H'?'#333':'#fff'});g.label(e[0],[e[3],-1.2+e[1]*2+.1,0]);});
    ['K','Na','Ca','Mg','P','S'].forEach((s,i)=>{const p=[1.9+(i%3)*.38,-1+Math.floor(i/3)*.4,0];g.ball(p,.16,'#8e24aa',{part:'macro'});g.text(V.add(p,[0,0,.17]),s,{size:10});});
    g.label('macro',[2.3,-.25,0]);
    ['Zn','Cu','I','F'].forEach((s,i)=>{const p=[1.95+i*.3,.5,0];g.ball(p,.09,'#00897b',{part:'micro'});});g.label('micro',[2.4,.7,0]);
    for(let i=0;i<5;i++){const c=[-2+i*.95,1.8+Math.sin(g.t*1.5+i)*.15,Math.cos(i)*.4];const a=g.t*.8+i;
      g.ball(c,.22,'#e53935',{part:'water'});g.ball(V.add(c,[Math.cos(a)*.26,.15,Math.sin(a)*.26]),.13,'#ffffff',{part:'water'});g.ball(V.add(c,[Math.cos(a+1.82)*.26,.15,Math.sin(a+1.82)*.26]),.13,'#ffffff',{part:'water'});}
    g.label('water',[0,2.3,0]);
  }};

S.organic={size:8.2,pitch:.35,parts:{protein:'Нәруыз (амин қышқылдары тізбегі)',carb:'Көмірсу (глюкоза сақинасы)',lipid:'Липидтер (мембрана қос қабаты)',na:'Нуклеин қышқылы (ДНҚ)'},
  steps:[{cap:'Жасушадағы негізгі органикалық заттар: нәруыздар, көмірсулар, липидтер, нуклеин қышқылдары.',dur:5},
    {cap:'Нәруыздар — 20 түрлі амин қышқылынан тұратын полимерлер. Қызметі: құрылыс, фермент, тасымалдау, қорғаныс, қозғалыс.',dur:7,hl:'protein'},
    {cap:'Көмірсулар — негізгі энергия көзі (1 г → 17,6 кДж). Глюкоза, сахароза, крахмал, гликоген, целлюлоза.',dur:6,hl:'carb'},
    {cap:'Липидтер — ең көп энергия береді (1 г → 38,9 кДж), мембрана құрайды, жылуды сақтайды.',dur:6,hl:'lipid'},
    {cap:'Нуклеин қышқылдары (ДНҚ, РНҚ) — тұқым қуалау ақпаратын сақтайды және жеткізеді.',dur:6,hl:'na'}],
  build(g){
    const P=[[-2.2,0,-1],[0,0,-2.1],[2.2,0,-1],[0,0,1.4]];
    // нәруыз
    for(let i=0;i<30;i++){const a=i*.6;g.ball(V.add(P[0],[Math.cos(a)*.45,(i/30-.5)*2.2,Math.sin(a)*.45]),.13,['#ef5350','#ab47bc','#26a69a','#ffa726','#5c6bc0'][i%5],{part:'protein'});}
    // глюкоза
    const r=.6,ring=[];for(let i=0;i<6;i++){const a=i*Math.PI/3;ring.push(V.add(P[1],[Math.cos(a)*r,0,Math.sin(a)*r]));}
    g.poly(ring,'#ffca28',{alpha:.6,stroke:true,part:'carb'});ring.forEach((p,i)=>g.ball(p,.12,i===0?'#e53935':'#424242',{part:'carb'}));
    ring.forEach((p,i)=>{if(i)g.ball(V.add(p,[0,.35,0]),.07,'#eceff1',{part:'carb'});});
    // липидтер
    for(let i=0;i<7;i++)for(let j=0;j<3;j++)for(const s of[-1,1]){const b=V.add(P[2],[(i-3)*.22,s*.55,(j-1)*.3]);g.ball(b,.1,'#29b6f6',{part:'lipid'});g.line(b,V.add(b,[0,-s*.45,0]),'#ffb74d',2,{part:'lipid'});}
    helix(g,{c:P[3],len:2.4,R:.35,turns:1.5,n:16,part:'na'});
    g.label('protein',V.add(P[0],[0,1.3,0]));g.label('carb',V.add(P[1],[0,.6,0]));g.label('lipid',V.add(P[2],[0,.8,0]));g.label('na',V.add(P[3],[0,1.4,0]));
  }};

/* Жасуша бөлінуі */
function cellShell(g,c,r,a){g.ell(c,r,[0,0,0],C.mem,{shell:1,alpha:a===undefined?.35:a,part:'cell'});}
const CHR=[{p:'A',h:0,L:.72,c:'#e53935'},{p:'A',h:1,L:.72,c:'#1e88e5'},{p:'B',h:0,L:.44,c:'#ff8a80'},{p:'B',h:1,L:.44,c:'#82b1ff'}];
S.mitosis={noAuto:1,size:7,pitch:.15,yaw:0,parts:{cell:'Жасуша',chromosome:'Хромосомалар',spindle:'Бөліну ұршығы',centriole:'Центриольдер',nucleus:'Ядро қабықшасы'},
  steps:[{cap:'Интерфаза: жасуша өседі, ДНҚ екі еселенеді. Хромосомалар әлі ширатылмаған (2n=4).',dur:5,hl:'nucleus'},
    {cap:'Профаза: хромосомалар ширатылып, жуандайды. Ядро қабықшасы ыдырайды, бөліну ұршығы түзіледі.',dur:6,hl:'chromosome',anim:4},
    {cap:'Метафаза: хромосомалар жасушаның экваторына тізіледі. Ұршық жіпшелері центромераларға бекінеді.',dur:6,hl:'spindle',anim:4},
    {cap:'Анафаза: апалы-сіңлілі хроматидалар ажырап, қарама-қарсы полюстерге тартылады.',dur:6,hl:'chromosome',anim:5},
    {cap:'Телофаза: полюстерде ядролар түзіледі, цитоплазма бөлінеді (цитокинез).',dur:6,hl:'cell',anim:5},
    {cap:'Нәтиже: аналық жасушаға ұқсас 2 жасуша, әрқайсысында 2n=4 хромосома.',dur:5,hl:'cell'}],
  build(g){const st=g.step,k=ease(g.k);
    const lay=s=>CHR.map((ch,i)=>{const pos=[[-.35,.35,.15],[.35,-.25,-.15],[.3,.45,.1],[-.25,-.4,0]][i];
      if(s===0)return {c:pos,a:[.3,-.8,1.2,.5][i],sep:0,r:.03};
      if(s===1)return {c:V.mul(pos,1.6),a:[.3,-.8,1.2,.5][i],sep:0,r:.08};
      if(s===2)return {c:[0,[1.05,.3,-.35,-.9][i],0],a:0,sep:0,r:.09};
      const y=[1.05,.3,-.35,-.9][i]*(s>=4?.6:1);if(s===3)return {c:[0,y,0],a:0,sep:1.5,r:.09};return {c:[0,y,0],a:0,sep:1.6,r:s===5?.045:.08};});
    const A=lay(Math.max(0,st-1)),B=lay(st);const kk=st===0?1:k;
    // жасушалар
    if(st<=3){const rx=st===3?lerp(2,2.5,k):2;cellShell(g,[0,0,0],[rx,1.7,1.7]);}
    else{const e=st===4?k:1;cellShell(g,[-lerp(0,1.6,e),0,0],[lerp(2.5,1.35,e),lerp(1.7,1.35,e),lerp(1.7,1.35,e)]);cellShell(g,[lerp(0,1.6,e),0,0],[lerp(2.5,1.35,e),lerp(1.7,1.35,e),lerp(1.7,1.35,e)]);}
    // ядро
    const na=st===0?.5:st===1?.5*(1-k):0;if(na>.02)g.ball([0,0,0],1.05,C.nuc,{shell:1,alpha:na,part:'nucleus'});
    if(st>=4){const a=st===4?k*.5:.5;g.ball([-1.6,0,0],.7,C.nuc,{shell:1,alpha:a,part:'nucleus'});g.ball([1.6,0,0],.7,C.nuc,{shell:1,alpha:a,part:'nucleus'});}
    // центриольдер
    const pol=st===0?.3:st===1?lerp(.3,2,k):st>=4?lerp(2,2.4,st===4?k:1):2;
    if(st<5){O.centriole(g,[-pol,.0,0],.8);O.centriole(g,[pol,0,0],.8);}
    // хромосомалар
    CHR.forEach((ch,i)=>{const a=A[i],b=B[i];const c=V.lerp(a.c,b.c,kk),ang=lerp(a.a,b.a,kk),r=lerp(a.r,b.r,kk),sep=lerp(a.sep,b.sep,kk);
      for(const s of[-1,1]){const cc=V.add(c,[s*(.065+sep),0,0]);const cx=st>=4?V.add(cc,[s*(st===4?k*.0:0),0,0]):cc;chromatid(g,cx,ang,ch.L,ch.c,null,r);
        if(st>=2&&st<=3){const pole=[s*2,0,0];g.line(pole,cx,'#b0bec5',1,{part:'spindle',alpha:.7});}}});
    if(st===1&&k>.5||st>=2&&st<=3){for(let i=0;i<6;i++){const y=(i-2.5)*.35;g.line([-2,0,0],[0,y*1.3,0.4],'#cfd8dc',.8,{part:'spindle',alpha:.35});g.line([2,0,0],[0,y*1.3,0.4],'#cfd8dc',.8,{part:'spindle',alpha:.35});}}
    g.label('cell',[0,1.75,0]);g.label('chromosome',[st>=3?1.5:0.3,1.1,0]);if(st>=2&&st<=3)g.label('spindle',[1,.6,.3]);if(st<5)g.label('centriole',[pol,.25,0]);if(st===0)g.label('nucleus',[0,1.05,0]);
  }};

S.meiosis={noAuto:1,size:7.4,pitch:.15,yaw:0,parts:{cell:'Жасуша',chromosome:'Хромосомалар',bival:'Гомологтық хромосомалар жұбы (бивалент)',cross:'Кроссинговер',spindle:'Бөліну ұршығы'},
  steps:[{cap:'Мейоз алдында: 2n=4. Қызыл — әкеден, көк — анадан келген хромосомалар. ДНҚ екі еселенген.',dur:5,hl:'chromosome'},
    {cap:'І профаза: гомологтық хромосомалар жұптасады — конъюгация (бивалент түзіледі).',dur:6,hl:'bival',anim:4},
    {cap:'Кроссинговер: гомологтық хромосомалар өзара бөліктерімен алмасады → генетикалық әртүрлілік!',dur:6,hl:'cross',anim:3},
    {cap:'І метафаза: биваленттер экватор жазықтығына орналасады.',dur:5,hl:'spindle',anim:4},
    {cap:'І анафаза: гомологтық хромосомалар (тұтас) полюстерге ажырайды — хромосома саны екі есе азаяды.',dur:6,hl:'chromosome',anim:5},
    {cap:'І телофаза: 2 жасуша түзіледі, әрқайсысында n=2 (екі хроматидалы) хромосома.',dur:5,hl:'cell',anim:4},
    {cap:'ІІ мейоз (митозға ұқсас): хромосомалар әр жасушаның экваторына тізіледі.',dur:5,hl:'chromosome',anim:4},
    {cap:'Нәтиже: 4 гаплоидты жасуша (n=2), әрқайсысы генетикалық жағынан әртүрлі. Жыныс жасушалары осылай түзіледі.',dur:7,hl:'cell',anim:5}],
  build(g){const st=g.step,k=ease(g.k);
    // хроматидалар: ch(0..3) x sister(0,1)
    const lay=s=>{const out=[];CHR.forEach((ch,i)=>{for(const sis of[0,1]){let c,a=0;
      const sx=(sis?1:-1)*.065;
      if(s===0){c=V.add([[-.4,.35,.1],[.4,-.3,-.1],[.35,.45,.1],[-.3,-.45,0]][i],[sx,0,0]);a=[.3,-.8,1.2,.5][i];}
      else if(s<=2){const bc=ch.p==='A'?[-.5,.25,0]:[.55,-.3,0];const off=(ch.h?1:-1)*.15+sx;c=V.add(bc,[off*Math.cos(ch.p==='A'?.3:-.4),-off*Math.sin(ch.p==='A'?.3:-.4),0]);a=ch.p==='A'?.3:-.4;}
      else if(s===3){const y=ch.p==='A'?.6:-.6;c=[(ch.h?1:-1)*.15+sx,y,0];}
      else{const side=(ch.p==='A'?(ch.h?1:-1):(ch.h?-1:1));
        if(s===4)c=[side*1.4+sx,ch.p==='A'?.45:-.45,0];
        else if(s===5)c=[side*1.6+sx,ch.p==='A'?.4:-.4,0];
        else if(s===6){c=[side*1.6+(ch.p==='A'?-.3:.3),(sis?.08:-.08),0];a=Math.PI/2;}
        else {c=[side*1.6+(ch.p==='A'?-.2:.2),(sis?1.05:-1.05),0];a=Math.PI/2;}}
      out.push({c,a});}});return out;};
    const A=lay(Math.max(0,st-1)),B=lay(st),kk=st===0?1:k;
    if(st<=4)cellShell(g,[0,0,0],[st===4?lerp(2,2.6,k):2,1.7,1.7]);
    else if(st<=6){const e=st===5?k:1;for(const s of[-1,1])cellShell(g,[s*lerp(0,1.6,e),0,0],[lerp(2.6,1.3,e),lerp(1.7,1.3,e),lerp(1.7,1.3,e)]);}
    else{for(const s of[-1,1])for(const t of[-1,1])cellShell(g,[s*1.6,t*lerp(0,1.05,k),0],[lerp(1.3,.78,k),lerp(1.3,.78,k),lerp(1.3,.78,k)]);}
    if(st===0)g.ball([0,0,0],1.1,C.nuc,{shell:1,alpha:.45,part:'chromosome'});
    let j=0;CHR.forEach((ch,i)=>{for(const sis of[0,1]){const a=A[j],b=B[j];j++;
      const c=V.lerp(a.c,b.c,kk),ang=lerp(a.a,b.a,kk);
      let tip=null;const crossed=st>2||(st===2&&k>.5);
      if(crossed&&((ch.h===0&&sis===1)||(ch.h===1&&sis===0)))tip=ch.h===0?CHR[i+1].c:CHR[i-1].c;
      chromatid(g,c,ang,ch.L,ch.c,tip,.075,tip&&st===2?'cross':(st===1||st===2?'bival':'chromosome'));
      if(st===3||st===4||st===6){const pole=st===6?[c[0]>0?1.6:-1.6,c[1]>0?1.2:-1.2,0]:[c[0]>0?2.1:-2.1,0,0];g.line(pole,c,'#b0bec5',1,{part:'spindle',alpha:.6});}
    }});
    g.label('cell',[0,1.75,0]);if(st===1||st===2)g.label('bival',[-.5,.9,0]);if(st===2)g.label('cross',[-.4,.6,.2]);if(st===3||st===4)g.label('spindle',[1.5,.3,0]);
    g.label('chromosome',st>=5?[1.6,.6,0]:[.6,-.9,0]);
  }};

S.cycle={noAuto:1,size:7,pitch:.2,yaw:0,parts:{cell:'Жасуша',nucleus:'Ядро',dna:'ДНҚ (хромосомалар)',g1:'G₁ — өсу',sph:'S — ДНҚ синтезі',g2:'G₂ — бөлінуге дайындық',m:'M — бөліну'},
  steps:[{cap:'Жасушалық цикл — жасушаның пайда болуынан бөлінуіне дейінгі кезең. Ол интерфаза мен бөлінуден тұрады.',dur:5},
    {cap:'G₁ кезеңі: жасуша өседі, нәруыздар мен органоидтар түзіледі.',dur:5,hl:'g1',anim:4},
    {cap:'S кезеңі: ДНҚ екі еселенеді (репликация) — әр хромосома екі хроматидалы болады.',dur:5,hl:'sph',anim:4},
    {cap:'G₂ кезеңі: жасуша бөлінуге дайындалады, АТФ жиналады.',dur:4,hl:'g2'},
    {cap:'M кезеңі: бөліну (митоз немесе мейоз). Прокариоттар қарапайым екіге бөліну арқылы көбейеді, кейбір жасушаларда амитоз жүреді.',dur:6,hl:'m',anim:5}],
  build(g){const st=g.step,k=ease(g.k);
    const ph=['g1','sph','g2','m'];
    for(let i=0;i<4;i++){const a0=i*Math.PI/2+.05,a1=(i+1)*Math.PI/2-.05;const pts=[];for(let q=0;q<=8;q++){const a=lerp(a0,a1,q/8);pts.push([Math.cos(a)*2.9,Math.sin(a)*2.9-.0,-1.5]);}
      for(let q=0;q<8;q++)g.line(pts[q],pts[q+1],['#81c784','#4fc3f7','#ffb74d','#e57373'][i],7,{part:ph[i]});g.label(ph[i],pts[4]);}
    let s=1;if(st===0)s=.75;if(st===1)s=lerp(.75,1,k);
    if(st<4){cellShell(g,[0,0,0],[1.4*s,1.2*s,1.2*s]);g.ball([0,0,0],.6*s,C.nuc,{shell:1,alpha:.5,part:'nucleus'});
      const dup=st>=2&&(st>2||k>.3);[[-.2,.15,.1,.3],[.2,-.1,0,-.6],[.05,.2,-.1,1.1]].forEach((p,i)=>{for(const d of(dup?[-.04,.04]:[0]))chromatid(g,[p[0]+d,p[1],p[2]],p[3],.4,['#e53935','#1e88e5','#8e24aa'][i],null,.04,'dna');});}
    else{const e=k;for(const sg of[-1,1]){cellShell(g,[sg*lerp(.2,1.4,e),0,0],[lerp(1.4,1,e),lerp(1.2,1,e),lerp(1.2,1,e)]);g.ball([sg*lerp(.2,1.4,e),0,0],.45,C.nuc,{shell:1,alpha:.5*e,part:'nucleus'});
      [[-.2,.15,.1,.3],[.2,-.1,0,-.6],[.05,.2,-.1,1.1]].forEach((p,i)=>chromatid(g,[sg*lerp(.2,1.4,e)+p[0]*.7,p[1],p[2]],p[3],.35,['#e53935','#1e88e5','#8e24aa'][i],null,.04,'dna'));}}
    g.label('cell',[0,1.25,0]);g.label('nucleus',[0,.65,0]);
  }};

S.lifespan={noAuto:1,size:7.4,pitch:.3,parts:{rbc:'Эритроцит — ~120 күн',plt:'Тромбоцит — 7–10 күн',gut:'Ішек эпителийі — 3–5 күн',skin:'Тері жасушасы — 2–4 апта',liver:'Бауыр жасушасы — 300–500 күн',neuron:'Нейрон — өмір бойы'},
  steps:[{cap:'Әр жасушаның тіршілік ету ұзақтығы әртүрлі — ол қызметіне байланысты.',dur:4},
    {cap:'Эритроцит ядросыз, ~120 күн өмір сүреді, көкбауыр мен бауырда жойылады.',dur:5,hl:'rbc'},
    {cap:'Тромбоциттер 7–10 күн, ішек эпителийі 3–5 күн ғана тіршілік етеді.',dur:5,hl:'gut'},
    {cap:'Тері жасушалары шамамен 2–4 аптада жаңарады.',dur:4,hl:'skin'},
    {cap:'Нейрондар мен жүрек бұлшықет жасушалары іс жүзінде өмір бойы сақталады.',dur:5,hl:'neuron'},
    {cap:'Жасушаның бағдарламаланған өлімі — апоптоз. Жарақаттан болған өлім — некроз.',dur:5}],
  build(g){
    const P=[[-2.2,.9,0],[0,.9,0],[2.2,.9,0],[-2.2,-1.2,0],[0,-1.2,0],[2.2,-1.1,0]];
    g.ell(P[0],[.5,.18,.5],[1.2+g.t*0,0,0],'#d32f2f',{part:'rbc'});g.ell(V.add(P[0],[0,.12,-.05]),[.25,.05,.25],[1.2,0,0],'#9a1b1b',{part:'rbc'});
    g.ell(P[1],[.2,.07,.16],[.5,.4,0],'#ab47bc',{part:'plt'});g.ell(V.add(P[1],[.25,.15,0]),[.15,.06,.12],[.2,1,0],'#ab47bc',{part:'plt'});
    for(let i=0;i<3;i++){box(g,V.add(P[2],[0,(i-1)*.36,0]),[.17,.16,.17],'#f48fb1',{part:'gut',stroke:true});}
    box(g,P[3],[.42,.06,.32],'#ffcc80',{part:'skin',stroke:true});box(g,V.add(P[3],[0,.14,0]),[.42,.06,.32],'#ffcc80',{part:'skin',stroke:true});
    box(g,P[4],[.36,.32,.32],'#a1887f',{part:'liver',stroke:true,alpha:.8});g.ball(V.add(P[4],[-.12,0,.33]),.08,C.nuc,{part:'liver'});g.ball(V.add(P[4],[.12,.05,.33]),.08,C.nuc,{part:'liver'});
    g.ball(P[5],.25,'#7986cb',{part:'neuron'});
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const b=V.add(P[5],[Math.cos(a)*.6,Math.sin(a)*.6,.1]);g.line(P[5],b,'#7986cb',2.5,{part:'neuron'});g.line(b,V.add(b,[Math.cos(a+.5)*.25,Math.sin(a+.5)*.25,0]),'#7986cb',1.5,{part:'neuron'});}
    g.line(P[5],V.add(P[5],[.2,-1.5,0]),'#5c6bc0',3,{part:'neuron'});
    ['rbc','plt','gut','skin','liver','neuron'].forEach((id,i)=>g.label(id,V.add(P[i],[-.5,i===5?.75:.7,0])));
  }};

S.leaf={size:7.6,pitch:.35,yaw:-.35,parts:{cut:'Кутикула',upper:'Жоғарғы эпидерма',pal:'Бағаналы ұлпа (хлоропластар көп)',spongy:'Борпылдақ ұлпа (ауа қуыстары)',vb:'Өткізгіш шоқ (жүйке): ксилема, флоэма',lower:'Төменгі эпидерма',stoma:'Лептесік (устьице)',guard:'Ұштастырушы (қорғаныш) жасушалар'},
  steps:[{cap:'Жапырақтың көлденең кесіндісі. Сыртында тығыз жабын — эпидерма, оны кутикула қаптайды.',dur:5,hl:'upper'},
    {cap:'Бағаналы ұлпа — тығыз орналасқан ұзынша жасушалар, хлоропластар ең көп: фотосинтез негізінен осында.',dur:6,hl:'pal'},
    {cap:'Борпылдақ ұлпа — жасушалары сирек, арасында ауа қуыстары бар: газ алмасу жүреді.',dur:5,hl:'spongy'},
    {cap:'Өткізгіш шоқ (жүйке): ксилема су мен минералды заттарды, флоэма органикалық заттарды тасиды.',dur:6,hl:'vb'},
    {cap:'Төменгі эпидермада лептесіктер бар — CO₂ кіріп, O₂ мен су буы шығады.',dur:6,hl:'stoma'}],
  build(g){const D=1.2;
    g.poly([[-2.8,1.32,-D],[2.8,1.32,-D],[2.8,1.32,D],[-2.8,1.32,D]],'#c5e1a5',{alpha:.55,part:'cut',stroke:true});
    for(let i=0;i<10;i++){box(g,[-2.52+i*.56,1.12,0],[.27,.18,D],'#e8f5e9',{part:'upper',alpha:.85,stroke:true,lw:.7});}
    for(let i=0;i<14;i++)for(const z of[-.6,0,.6]){const x=-2.6+i*.4;const c=[x,.45,z];g.ell(c,[.17,.45,.17],[0,0,0],'#66bb6a',{part:'pal',alpha:.9});
      for(let q=0;q<3;q++)g.ball(V.add(c,[.12,(q-1)*.25,.12]),.05,'#1b5e20',{part:'pal'});}
    const R=rng(8);for(let i=0;i<34;i++){const c=[-2.6+R()*5.2,-.55-R()*.65,(R()-.5)*2*D*.9];if(Math.hypot(c[0]-.2,c[1]+.6)<.55)continue;g.ell(c,[.2,.16,.2],[R(),R(),R()],'#9ccc65',{part:'spongy',alpha:.85});}
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;g.ball([.2+Math.cos(a)*.38,-.6+Math.sin(a)*.38,0],.12,'#fff59d',{part:'vb'});}
    g.ball([.2,-.48,0],.14,'#8d6e63',{part:'vb'});g.ball([.05,-.65,.1],.11,'#8d6e63',{part:'vb'});g.ball([.32,-.75,.05],.08,'#ffab91',{part:'vb'});
    for(let i=0;i<10;i++){if(i===3||i===7)continue;box(g,[-2.52+i*.56,-1.48,0],[.27,.14,D],'#e8f5e9',{part:'lower',alpha:.85,stroke:true,lw:.7});}
    for(const x of[-2.52+3*.56,-2.52+7*.56]){g.ell([x-.15,-1.48,0],[.11,.13,.3],[0,0,0],'#43a047',{part:'guard'});g.ell([x+.15,-1.48,0],[.11,.13,.3],[0,0,0],'#43a047',{part:'guard'});}
    for(let i=0;i<5;i++){const u=(g.t*.25+i/5)%1;const x=-2.52+3*.56;g.ball([x,-1.9+u*1.2,(i-2)*.15],.05,'#616161',{part:'stoma',alpha:1-u});}
    g.label('cut',[-2.6,1.35,D]);g.label('upper',[2.5,1.12,D]);g.label('pal',[2.6,.6,.6]);g.label('spongy',[-2,-.8,D*.8]);g.label('vb',[.2,-.2,0]);g.label('lower',[2.5,-1.5,D]);g.label('stoma',[-2.52+3*.56,-1.7,0]);g.label('guard',[-2.52+7*.56,-1.3,.3]);
  }};

S.photo={size:7,pitch:.5,yaw:-.3,parts:{leaf:'Жапырақ тақтасы',vein:'Жүйкелер (өткізгіш шоқтар)',sun:'Күн жарығы',co2:'CO₂ (кіреді)',o2:'O₂ (бөлінеді)',h2o:'H₂O (тамырдан келеді)',petiole:'Сағақ'},
  steps:[{cap:'Фотосинтез: 6CO₂ + 6H₂O → (жарық, хлорофилл) → C₆H₁₂O₆ + 6O₂. Ол жапырақтың хлоропластарында жүреді.',dur:7,hl:'sun'},
    {cap:'Көмірқышқыл газы лептесік арқылы кіреді, су тамырдан жүйкелер арқылы келеді.',dur:6,hl:'co2'},
    {cap:'Жарық фазасы (тилакоидта): су ыдырап, O₂ бөлінеді, АТФ түзіледі. Қараңғы фаза (стромада): глюкоза түзіледі.',dur:7,hl:'o2'},
    {cap:'Тор тәрізді жүйкелену — қосжарнақтыларға тән (емен, алма).',dur:5,hl:'vein'},
    {cap:'Параллель жүйкелену — даражарнақтыларға тән (бидай, жүгері). Доғалы — бақажапырақта, інжугүлде.',dur:6,hl:'vein'}],
  build(g){const st=g.step;
    const out=[];for(let i=0;i<=24;i++){const u=i/24;const y=-2+u*4;const w=Math.sin(u*Math.PI)*1.3*(1-.25*u);out.push([w,y,0]);}
    const pts=out.concat(out.slice(1,-1).reverse().map(p=>[-p[0],p[1],p[2]]));
    g.poly(pts,'#43a047',{alpha:.9,part:'leaf',stroke:true,zb:-.2});
    g.rod([0,-2.8,0],[0,-2,0],.06,'#558b2f',{part:'petiole'});
    if(st===4){for(const x of[-.6,-.3,0,.3,.6])g.line([x*.4,-2,.02],[x,1.6,.02],'#c5e1a5',2,{part:'vein'});}
    else{g.line([0,-2,.02],[0,2,.02],'#c5e1a5',3,{part:'vein'});for(let i=1;i<7;i++){const y=-2+i*.55;for(const s of[-1,1]){const e=[s*Math.sin(i/7*Math.PI)*1.05,y+.45,.02];g.line([0,y,.02],e,'#c5e1a5',1.8,{part:'vein'});if(st===3)g.line(V.lerp([0,y,.02],e,.5),[e[0]*.7,y+.75,.02],'#c5e1a5',1,{part:'vein'});}}}
    g.ball([-2.6,2.4,1],.45,'#ffca28',{part:'sun'});for(let i=0;i<4;i++){const u=(g.t*.6+i/4)%1;g.line(V.lerp([-2.3,2.1,.9],[-.4,.5,.1],u),V.lerp([-2.3,2.1,.9],[-.4,.5,.1],Math.min(1,u+.15)),'#ffe082',3,{part:'sun'});}
    for(let i=0;i<3;i++){const u=(g.t*.3+i/3)%1;const p=V.lerp([2.6,-1.4,1.3],[.3,-.5,.05],u);g.ball(p,.1,'#424242',{part:'co2'});g.ball(V.add(p,[.12,0,0]),.08,'#e53935',{part:'co2'});g.ball(V.add(p,[-.12,0,0]),.08,'#e53935',{part:'co2'});}
    for(let i=0;i<3;i++){const u=(g.t*.3+i/3)%1;const p=V.lerp([.3,.6,.05],[2.6,2,1.4],u);g.ball(p,.09,'#e53935',{part:'o2'});g.ball(V.add(p,[.13,0,0]),.09,'#e53935',{part:'o2'});}
    for(let i=0;i<3;i++){const u=(g.t*.3+i/3)%1;const p=V.lerp([0,-2.8,.05],[0,-.6,.05],u);g.ball(p,.09,'#29b6f6',{part:'h2o'});}
    g.label('leaf',[.8,1,0]);g.label('vein',[-.5,-.6,.05]);g.label('sun',[-2.6,2.9,1]);g.label('co2',[2.6,-1.2,1.3]);g.label('o2',[2.4,2.2,1.4]);g.label('h2o',[.15,-2.4,.05]);g.label('petiole',[0,-2.8,0]);
  }};

S.energy={noAuto:1,size:7,pitch:.3,yaw:-.2,parts:{prep:'Дайындық кезең (ыдырау)',glyc:'Гликолиз (цитоплазмада)',pvk:'Пирожүзім қышқылы (ПЖҚ)',mito:'Митохондрия (оттекті кезең)',atp:'АТФ',co2:'CO₂ + H₂O'},
  steps:[{cap:'Зат алмасу = пластикалық алмасу (ассимиляция — заттар түзіледі) + энергетикалық алмасу (диссимиляция — заттар ыдырап, энергия бөлінеді).',dur:7},
    {cap:'1-кезең — дайындық: полимерлер мономерлерге ыдырайды (крахмал → глюкоза). Энергия жылу ретінде шашылады.',dur:6,hl:'prep',anim:4},
    {cap:'2-кезең — оттексіз (гликолиз): 1 глюкоза → 2 ПЖҚ + 2 АТФ. Цитоплазмада жүреді.',dur:6,hl:'glyc',anim:4},
    {cap:'3-кезең — оттекті: митохондрияда ПЖҚ CO₂ мен H₂O-ға дейін тотығады, 36 АТФ түзіледі. Барлығы: 38 АТФ.',dur:7,hl:'mito',anim:5}],
  build(g){const st=g.step,k=ease(g.k);
    O.mito(g,[2,0,0],1.1,[0,0,.2]);
    const hex=(c,r,part,col)=>{const ring=[];for(let i=0;i<6;i++){const a=i*Math.PI/3;ring.push(V.add(c,[Math.cos(a)*r,Math.sin(a)*r,0]));}g.poly(ring,col||'#ffca28',{alpha:.8,stroke:true,part});};
    if(st<=1){const sp=st===1?k:0;for(let i=0;i<5;i++){hex([-3+i*.5+(i-2)*sp*.35,1.3-sp*(i%2)*.3,0],.2,'prep');if(i<4&&sp<.5)g.line([-2.8+i*.5,1.3,0],[-2.7+i*.5,1.3,0],'#8d6e63',3,{part:'prep'});}}
    if(st>=2){const c=[-1.4,0,0];if(st===2&&k<.5)hex(c,.3,'glyc');else{const d=st===2?(k-.5)*2:1;const p1=V.add(c,[0,.4*d,0]),p2=V.add(c,[0,-.4*d,0]);
        const tgt=st===3?k:0;const q1=V.lerp(p1,[1.4,.3,0],tgt),q2=V.lerp(p2,[1.6,-.3,0],tgt);
        for(const q of[q1,q2])if(tgt<.95){for(let j=0;j<3;j++)g.ball(V.add(q,[(j-1)*.14,0,0]),.08,'#ff7043',{part:'pvk'});}
        if(st===2)for(let j=0;j<2;j++)g.ball(V.add(c,[.5+j*.25,.6*d,0]),.1,'#ffeb3b',{part:'atp'});}
    }
    if(st===3)for(let i=0;i<12;i++){const u=(g.t*.3+i/12)%1;const d=fib(12,i);g.ball(V.add([2,0,0],V.mul(d,.5+u*1.8)),.08,'#ffeb3b',{part:'atp',alpha:1-u*.5});}
    if(st===3){for(let i=0;i<3;i++){const u=(g.t*.25+i/3)%1;g.ball([2+u*1.2,1+u*.8,.2],.07,'#757575',{part:'co2'});g.ball([2.3+u*1.2,-1-u*.6,.2],.07,'#29b6f6',{part:'co2'});}}
    g.label('mito',[2,.6,0]);if(st<=1)g.label('prep',[-2,1.7,0]);if(st>=2)g.label('glyc',[-1.4,.75,0]);if(st>=2)g.label('pvk',[-1.4,-.55,0]);if(st>=2)g.label('atp',st===3?[3.3,1.3,0]:[-.6,.8,0]);if(st===3)g.label('co2',[3.4,-1.6,.2]);
  }};

S.dna={size:7,pitch:.15,parts:{backbone:'Қант-фосфат қаңқасы',bases:'Азотты негіздер жұбы',at:'А = Т (2 сутектік байланыс)',gc:'Г ≡ Ц (3 сутектік байланыс)',nucl:'Нуклеотид'},
  steps:[{cap:'ДНҚ — қос тізбекті спираль (Дж. Уотсон, Ф. Крик, 1953). Тізбектері бір-біріне оралған.',dur:6,hl:'backbone'},
    {cap:'Мономері — нуклеотид: азотты негіз + дезоксирибоза қанты + фосфат қалдығы.',dur:6,hl:'nucl'},
    {cap:'Негіздер комплементарлы жұптасады: аденин — тимин (А=Т), гуанин — цитозин (Г≡Ц).',dur:6,hl:'bases'},
    {cap:'Ген — бір нәруыздың құрылысы туралы ақпаратты сақтайтын ДНҚ бөлігі.',dur:5}],
  build(g){const pr=helix(g,{c:[0,0,0],len:4.6,R:.75,turns:1.6,n:26,phase:0});
    const nu=pr[13];if(nu){g.ball(nu[0],.24,'#ffffff',{shell:1,alpha:.4,part:'nucl'});g.label('nucl',nu[0]);}
    g.label('backbone',pr[3][0]);g.label('bases',V.lerp(pr[6][0],pr[6][1],.5));g.label('at',V.lerp(pr[20][0],pr[20][1],.3));g.label('gc',V.lerp(pr[9][0],pr[9][1],.3));
  }};

S.replic={noAuto:1,size:7.6,pitch:.15,yaw:0,parts:{old:'Аналық тізбек',neu:'Жаңа тізбек',helicase:'Геликаза (тізбектерді ажыратады)',pol:'ДНҚ-полимераза',fork:'Репликация айыры'},
  steps:[{cap:'Репликация — ДНҚ-ның екі еселенуі. Ол интерфазаның S кезеңінде жүреді.',dur:5,hl:'old'},
    {cap:'Геликаза ферменті сутектік байланыстарды үзіп, тізбектерді ажыратады — репликация айыры түзіледі.',dur:7,hl:'helicase',anim:7},
    {cap:'ДНҚ-полимераза әр аналық тізбекке комплементарлық принцип бойынша жаңа тізбек құрастырады.',dur:7,hl:'pol',anim:7},
    {cap:'Нәтиже: 2 бірдей ДНҚ, әрқайсысында бір ескі, бір жаңа тізбек — жартылай консервативті репликация.',dur:6,hl:'neu',anim:4}],
  build(g){const st=g.step,k=g.k;
    let fy=2.4;if(st===1)fy=lerp(2.4,.8,k);if(st===2)fy=lerp(.8,-1.6,k);if(st===3)fy=lerp(-1.6,-2.6,k);
    const n=34,R=.5;
    for(let i=0;i<n;i++){const u=i/(n-1);const y=(.5-u)*5;const th=u*3*Math.PI*2;
      if(y<fy){const p1=[Math.cos(th)*R,y,Math.sin(th)*R],p2=[Math.cos(th+2.5)*R,y,Math.sin(th+2.5)*R];g.ball(p1,.09,'#3949ab',{part:'old'});g.ball(p2,.09,'#3949ab',{part:'old'});
        const pc=PAIRC[i%4];const m=V.lerp(p1,p2,.5);g.rod(p1,m,.04,pc[0],{part:'bases'});g.rod(m,p2,.04,pc[1],{part:'bases'});}
      else{const d=Math.min(1.3,(y-fy)*1.1);
        for(const s of[-1,1]){const cx=s*d;const p1=[cx+Math.cos(th)*R,y,Math.sin(th)*R];g.ball(p1,.09,'#3949ab',{part:'old'});
          const lag=(y-fy)>.25;if(lag){const p2=[cx+Math.cos(th+2.5)*R,y,Math.sin(th+2.5)*R];g.ball(p2,.09,'#ffb300',{part:'neu'});const pc=PAIRC[i%4];const m=V.lerp(p1,p2,.5);g.rod(p1,m,.04,pc[0],{part:'bases'});g.rod(m,p2,.04,pc[1],{part:'bases'});}}}
    }
    if(fy>-2.5&&fy<2.5){g.ball([0,fy,0],.28,'#e91e63',{part:'helicase'});g.label('helicase',[0,fy-.35,0]);
      for(const s of[-1,1]){g.ell([s*.55,fy+.55,0],[.22,.2,.2],[0,0,0],'#00acc1',{part:'pol'});}g.label('pol',[.6,fy+.75,0]);g.label('fork',[-.4,fy+.15,0]);}
    g.label('old',[0,-2.3,0]);if(fy<2.3)g.label('neu',[1.3,2.3,0]);
  }};

S.transc={noAuto:1,size:7.2,pitch:.35,yaw:-.25,parts:{dna:'ДНҚ',temp:'Матрицалық тізбек',pol:'РНҚ-полимераза',mrna:'иРНҚ (түзіліп жатыр)',prom:'Промотор',nucleus:'Ядро'},
  steps:[{cap:'Транскрипция — ДНҚ-дағы ақпараттың иРНҚ-ға көшірілуі. Ол ядрода жүреді.',dur:5,hl:'dna'},
    {cap:'РНҚ-полимераза промоторға бекініп, ДНҚ-ның қос тізбегін ажыратады.',dur:5,hl:'prom',anim:4},
    {cap:'Матрицалық тізбекке комплементарлы иРНҚ түзіледі: А→У, Т→А, Г→Ц, Ц→Г. РНҚ-да тимин орнына — урацил!',dur:8,hl:'mrna',anim:8},
    {cap:'Дайын иРНҚ ядро тесіктері арқылы цитоплазмаға шығып, рибосомаға барады.',dur:6,hl:'nucleus',anim:5}],
  build(g){const st=g.step,k=g.k;
    let px=-2.4;if(st===2)px=lerp(-2.4,2.2,k);if(st===3)px=2.2;
    const n=40;
    for(let i=0;i<n;i++){const x=-3.5+i*.18;const th=i*.55;const open=Math.abs(x-px)<.6&&st>=1?1:0;
      const yo=open*.35;
      const p1=[x,Math.cos(th)*.3*(1-open)+yo,Math.sin(th)*.3],p2=[x,Math.cos(th+2.5)*.3*(1-open)-yo,Math.sin(th+2.5)*.3];
      g.ball(p1,.07,'#3949ab',{part:'dna'});g.ball(p2,.07,'#5c6bc0',{part:'temp'});
      if(!open){const pc=PAIRC[i%4];const m=V.lerp(p1,p2,.5);g.rod(p1,m,.03,pc[0],{part:'dna'});g.rod(m,p2,.03,pc[1],{part:'dna'});}}
    g.ell([-3.2,0,0],[.25,.5,.5],[0,0,0],'#9ccc65',{part:'prom',alpha:.6,shell:1});
    if(st>=1){g.ell([px,0,0],[.65,.55,.55],[0,0,0],'#ec407a',{part:'pol',alpha:.55,shell:1});}
    if(st>=2){const L=st===2?Math.floor((px+2.4)/.18):26;const seq='АУГГЦАУУУГЦЦАГАУГГЦУААГЦАУ';
      for(let i=0;i<L;i++){let p=[px-.2-i*.12,-.55-i*.06,.4+Math.sin(i*.6)*.2];if(st===3)p=V.add(p,[0,-k*1.4,k*1.2]);g.ball(p,.075,BASEC[seq[i%seq.length]],{part:'mrna'});}}
    if(st===3)g.ball([0,0,0],3.4,C.nuc,{shell:1,alpha:.12*k,part:'nucleus'});
    g.label('dna',[-1,.4,0]);g.label('prom',[-3.2,.55,0]);if(st>=1)g.label('pol',[px,.6,0]);if(st>=1)g.label('temp',[px+.8,-.45,0]);if(st>=2)g.label('mrna',[px-1.2,-1.2,.5]);
  }};

S.codon={noAuto:1,size:7.8,pitch:.2,yaw:-.15,parts:{mrna:'иРНҚ',codon:'Кодон (триплет)',start:'Старт-кодон АУГ (метионин)',stop:'Стоп-кодон',aa:'Амин қышқылдары'},
  steps:[{cap:'Генетикалық код — ДНҚ/иРНҚ нуклеотидтерінің ретімен амин қышқылдарының ретін жазу жүйесі.',dur:5,hl:'mrna'},
    {cap:'Әр амин қышқылын 3 нуклеотид — кодон (триплет) кодтайды. Барлығы 64 кодон бар.',dur:6,hl:'codon'},
    {cap:'АУГ — старт-кодон (метионин). УАА, УАГ, УГА — стоп-кодондар, амин қышқылын кодтамайды.',dur:7,hl:'start'},
    {cap:'Қасиеттері: триплеттілік, бір мәнділік, азғындалғандық (бір амин қышқылына бірнеше кодон), әмбебаптық, үзіліссіздік.',dur:8,hl:'aa'}],
  build(g){const st=g.step;const seq='АУГУУУГГЦААААУГУАА';const n=seq.length;const names=['Мет','Фен','Гли','Лиз','Мет','Стоп'];
    for(let i=0;i<n;i++){const x=(i-n/2+.5)*.34;const cod=Math.floor(i/3);const p=[x,-.6,0];
      g.ball(p,.13,BASEC[seq[i]],{part:cod===0?'start':cod===5?'stop':'codon'});g.text([x,-1.0,0],seq[i],{size:13,color:'#ffffff'});
      if(i%3===0&&st>=1){const cx=x+.34;g.poly([[x-.17,-.35,-.2],[x+.68+.17,-.35,-.2],[x+.68+.17,-.35,.2],[x-.17,-.35,.2]],['#ffffff','#b2dfdb'][cod%2],{alpha:.35,part:'codon'});
        const visible=st>=2||cod<3;if(visible){const ap=[cx,.5+Math.sin(g.t*1.5+cod)*.08,0];
          if(cod<5){g.ball(ap,.25,['#ef5350','#ab47bc','#26a69a','#ffa726','#ef5350'][cod],{part:'aa'});g.text(V.add(ap,[0,0,.28]),names[cod],{size:11});if(cod>0)g.line(V.add(ap,[-1.02,0,0]),ap,'#90a4ae',3,{part:'aa'});}
          else{g.text(ap,'■ СТОП',{size:13,color:'#ff5252'});}}}}
    g.label('mrna',[-3.1,-.6,0]);if(st>=1)g.label('codon',[-.6,-.3,0]);if(st>=2){g.label('start',[-2.55,-.35,0]);g.label('stop',[2.55,-.35,0]);}if(st>=1)g.label('aa',[-1.5,.9,0]);
  }};

S.transl={noAuto:1,size:7.8,pitch:.25,yaw:-.2,parts:{mrna:'иРНҚ',ribo:'Рибосома',trna:'тРНҚ (антикодонмен)',aa:'Амин қышқылы',chain:'Полипептид тізбегі',stop:'Стоп-кодон'},
  steps:[{cap:'Трансляция — иРНҚ-дағы ақпарат бойынша нәруыз синтезі. Ол цитоплазмада, рибосомада жүреді.',dur:5,hl:'mrna'},
    {cap:'Инициация: рибосома иРНҚ-ның АУГ старт-кодонына бекінеді, бірінші тРНҚ метионинді әкеледі.',dur:6,hl:'trna',anim:4},
    {cap:'Элонгация: тРНҚ антикодоны кодонға комплементарлы қосылады, амин қышқылдары пептидтік байланыспен біріктіріледі.',dur:9,hl:'chain',anim:9},
    {cap:'Терминация: рибосома стоп-кодонға жеткенде нәруыз тізбегі босап шығады.',dur:6,hl:'stop',anim:5}],
  build(g){const st=g.step,k=g.k;
    const seq='АУГУУУГГЦААААГЦУГГУАА';mrna(g,-3.6,seq.length,.34,seq);
    let x=-3.26;if(st===2)x=lerp(-3.26,1.84,k);if(st===3)x=lerp(1.84,2.86,Math.min(1,k*2));
    const off=st===3&&k>.5?(k-.5)*4:0;
    g.ell([x+.17,-.35,0],[.75,.28,.55],[0,0,0],'#78909c',{part:'ribo',alpha:.9});g.ell([x+.17,.55-0+off*.2,0],[.95,.55,.7],[0,0,0],'#455a64',{part:'ribo',alpha:.75,shell:1});
    const nAA=st<1?0:st===1?1:st===2?1+Math.floor(k*15/3):6;
    const AAc=['#ef5350','#ab47bc','#26a69a','#ffa726','#5c6bc0','#66bb6a'];
    for(let i=0;i<nAA;i++){const p=[x-.2-i*.25+off*0,1.3+i*.22+off,Math.sin(i*1.4)*.25];g.ball(p,.14,AAc[i%6],{part:i===nAA-1?'aa':'chain'});}
    if(st>=1&&st<3){const tx=x+.5;const tk=st===1?Math.min(1,k*1.5):((k*5)%1);const ty=lerp(2.2,.3,Math.min(1,tk*1.5));
      g.rod([tx,ty,0],[tx,ty+.55,0],.08,'#26c6da',{part:'trna'});g.rod([tx,ty+.55,0],[tx+.35,ty+.75,0],.08,'#26c6da',{part:'trna'});g.ball([tx+.4,ty+.85,0],.13,AAc[nAA%6],{part:'aa'});}
    g.label('mrna',[-3.4,-.25,0]);g.label('ribo',[x+.17,1.1,.5]);if(st>=1&&st<3)g.label('trna',[x+.55,1.5,0]);if(nAA>1)g.label('chain',[x-.6,1.8+off,0]);if(st===3)g.label('stop',[2.86+.34*1.5,-.3,0]);
  }};

S.operon={noAuto:1,size:7.8,pitch:.3,yaw:-.15,parts:{reg:'Реттеуші ген',prom:'Промотор',oper:'Оператор',genes:'Құрылымдық гендер',rep:'Репрессор нәруызы',lac:'Индуктор (лактоза)',pol:'РНҚ-полимераза',mrna:'иРНҚ'},
  steps:[{cap:'Оперон (Ф. Жакоб, Ж. Моно, 1961): промотор + оператор + құрылымдық гендер. Мысал — ішек таяқшасының лактоза опероны.',dur:6,hl:'genes'},
    {cap:'Лактоза жоқ кезде репрессор операторға бекініп, РНҚ-полимеразаның жолын бөгейді — гендер «өшірулі».',dur:6,hl:'rep',anim:4},
    {cap:'Лактоза (индуктор) келіп, репрессорға қосылады — репрессор оператордан ажырайды.',dur:6,hl:'lac',anim:5},
    {cap:'РНҚ-полимераза гендерді транскрипциялайды — ферменттер түзіледі. Гендер «қосулы»!',dur:7,hl:'mrna',anim:6}],
  build(g){const st=g.step,k=ease(g.k);
    const seg=[['reg',-3.4,-2.4,'#90a4ae'],['prom',-2,-1.2,'#9ccc65'],['oper',-1.2,-.6,'#ffb74d'],['genes',-.6,3.2,'#4fc3f7']];
    seg.forEach(s=>{box(g,[(s[1]+s[2])/2,0,0],[(s[2]-s[1])/2-.02,.16,.16],s[3],{part:s[0],stroke:true});g.label(s[0],[(s[1]+s[2])/2,-.45,0]);});
    g.line([-2.4,0,0],[-2,0,0],'#b0bec5',4,{part:'reg'});
    for(const x of[.65,1.9])g.line([x,-.2,0],[x,.2,0],'#ffffff',2,{part:'genes'});
    let rp=[-.9,1.6,0];if(st===1)rp=V.lerp([-2.9,1.4,0],[-.9,.38,0],k);if(st===2&&k<.5)rp=[-.9,.38,0];if(st===2)rp=V.lerp([-.9,.38,0],[-1.6,2,0],Math.max(0,(k-.3)/.7));if(st===3)rp=[-1.6,2,0];if(st===0)rp=[-2.9,1.4,0];
    g.ell(rp,[.38,.3,.3],[0,0,.3],'#e53935',{part:'rep'});g.label('rep',V.add(rp,[0,.4,0]));
    if(st>=2){const lp=st===2?V.lerp([1.5,2.4,.6],V.add(rp,[.3,.15,.15]),Math.min(1,k*2)):V.add(rp,[.3,.15,.15]);g.poly([0,1,2,3,4,5].map(i=>{const a=i*Math.PI/3;return V.add(lp,[Math.cos(a)*.15,Math.sin(a)*.15,0]);}),'#ffeb3b',{stroke:true,part:'lac'});g.label('lac',V.add(lp,[.2,.2,0]));}
    let px=-1.6;if(st===3)px=lerp(-1.6,3,k);
    g.ell([px,.45,0],[.45,.32,.35],[0,0,0],'#ec407a',{part:'pol',alpha:.85});g.label('pol',[px,.85,0]);
    if(st===3)for(let i=0;i<Math.floor(k*24);i++){g.ball([px-.3-i*.16,.7+i*.05,.35+Math.sin(i*.7)*.15],.06,['#e4572e','#8e6bd1','#4caf50','#f4c430'][i%4],{part:'mrna'});}
    if(st===3)g.label('mrna',[px-1.5,1.4,.4]);
  }};

window.SCENES=S;
})();
