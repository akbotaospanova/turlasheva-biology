(function(){
'use strict';
const D=window.COURSE,L=D.lessons,SC=window.SCENES;
const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
const h=(tag,attrs,html)=>{const e=document.createElement(tag);if(attrs)for(const k in attrs){if(k==='class')e.className=attrs[k];else if(k.startsWith('on'))e.addEventListener(k.slice(2),attrs[k]);else e.setAttribute(k,attrs[k]);}if(html!==undefined)e.innerHTML=html;return e;};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ---- сақтау (тек осы браузерде) ---- */
const store={get(k,d){try{const v=localStorage.getItem('jqa:'+k);return v?JSON.parse(v):d;}catch(e){return d;}},set(k,v){try{localStorage.setItem('jqa:'+k,JSON.stringify(v));}catch(e){}}};
function prog(n){return store.get('p'+n,{quiz:0,games:{},seen:0});}
function saveProg(n,p){store.set('p'+n,p);}
function stars(n){const p=prog(n);const l=L[n-1];let s=0;if(p.seen)s++;if(p.quiz>=70)s++;const gd=Object.keys(p.games).length;if(gd>=Math.min(2,l.games.length))s++;return s;}
function toast(t){let e=$('.toast');if(!e){e=h('div',{class:'toast'});document.body.appendChild(e);}e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),2200);}

const MODULES=[['I','Кіріспе. Жасуша ғылымы',1,4],['II','Жасушаның құрылысы',5,8],['III','Жасуша органоидтары',9,18],['IV','Жасушаның химиялық құрамы',19,20],['V','Жасушаның көбеюі мен тіршілігі',21,24],['VI','Жапырақ және зат алмасу',25,27],['VII','Генетикалық ақпарат',28,33],['VIII','Қорытынды',34,34]];
const MCOL=['#2a9d8f','#e8799a','#7a5bc7','#f08a4b','#4f9fd4','#4caf50','#e9b949','#d64f6b'];

const AWARDS=[
 ['v04','v','«Жасушаның құпия әлемі» — курсқа шақыру','Авторлық элективті курстың таныстыру бейнесі','v'],
 ['c14','t','Құрмет грамотасы','Алатау ауданының әкімі · білім беру саласына қосқан үлесі үшін · 2025'],
 ['c12','t','Мадақтама грамота','Алатау ауданы білім бөлімі · жас ұрпаққа өнегелі тәрбие беру ісіне сіңірген еңбегі үшін · 2026'],
 ['g07','t','Құрмет грамотасы','Алматы қ. Білім басқармасы · Қалалық білім берудегі жаңа технологиялардың ғылыми-әдістемелік орталығы · шығармашылық табыстары мен іс-тәжірибесін қала көлемінде таратқаны үшін · 2026'],
 ['g10','t','Алғыс хат','Алатау ауданы білім бөлімі · аудан білім беру саласының дамуына қосқан үлесі үшін · 2026'],
 ['g09','t','Диплом · I орын · 20 000 ₸','«Ұлттық ойын — ұлт қазынасы» аудандық сайысы · Мұғалімдер күніне орай · жаратылыстану бірлестігі'],
 ['g11','t','Жүлдегерлер командасы','«Ұлттық ойын — ұлт қазынасы» аудандық сайысы · I орын'],
 ['g08','t','Грамота · «Өнер қуып ой түзе»','«Адал азамат» бағдарламасы · Отбасы күніне орай «Шаттығы мол шаңырақ» XIV қалалық слеті · 2026'],
 ['f00','t','Республикалық форум марапаты','Қ.И. Сәтбаевтың 125 жылдық мерейтойына орай ұйымдастырылған республикалық оқушылар форумы · диплом мен кубок · 2024'],
 ['f15','t','Марапаттау рәсімі','«Педагогикалық идеялар» · мерекелік салтанатта марапатталу сәті'],
 ['c02','t','NXplorers бағдарламасының Тренері','«NXplorers: Жасыл ұрпақ бәйгесі» · Daryn, Shell, Caravan of Knowledge · 2026'],
 ['f10','t','NXplorers тренері · шеберлік сабағы','«NXplorers сабағында модульдерді ықпалдастыру» · nxplorers.kz · Алматы'],
 ['c04','t','Shell NXplorers сертификаты','Халықаралық әдістеме бойынша 40 сағаттық оқу · 14 мамыр 2026'],
 ['c03','t','Алғыс хат — NXplorers','Халықаралық әдістемені оқуға қатысқаны үшін · 2026'],
 ['c13','t','Халықаралық форум сертификаты','«Цифрлық білім беру: тұлғалық даму. STEM&AI» · «Биология пәнін оқыту процесін тиімді басқару жолдары» · 7–8 сәуір 2026'],
 ['g03','t','Спикер · STEM&AI форумы','3-секция «Білім берудегі басқару мен бақылау» · «Биология пәнін оқыту процесін тиімді басқару жолдары» · 07.04.2026'],
 ['g04','t','«Цифрлық білім беру: тұлғалық даму. STEM&AI»','Халықаралық ғылыми-тәжірибелік форум · 7–8 сәуір 2026'],
 ['c08','t','IV халықаралық жастар ғылыми форумы','Абай атындағы ҚазҰПУ · белсене қатысқаны үшін · қараша 2025'],
 ['c09','t','Certificate — Abai University','IV International Youth Scientific Forum · 27.11.2025'],
 ['c05','t','Алғыс хат — «Балдәурен» РОСО','Республикалық биология-экология байқауында оқушыға жетекшілік еткені үшін · 28.11.2025'],
 ['c10','s','Grant 50 000 ₸ · III орын','«Shoqan Ecology» халықаралық жас ғалымдар форумы · 25–26 сәуір 2026 · жетекшісі А.М. Турлашева'],
 ['f02','s','Grant 50 000 ₸ · марапаттау сәті','«Shoqan Ecology» халықаралық жас ғалымдар форумы · III орын · 2026'],
 ['f01','s','Дипломдар мен кубоктар','Қ.И. Сәтбаевтың 125 жылдық мерейтойына орай ұйымдастырылған республикалық оқушылар форумы · 2024'],
 ['c06','s','Диплом · III орын','Республикалық биология-экология ғылыми жобалар байқауы · «Балдәурен» · 2025'],
 ['c07','s','Диплом · III орын','Республикалық биология-экология ғылыми жобалар байқауы · «Балдәурен» · 2025'],
 ['c15','s','III дәрежелі диплом','Республикалық олимпиаданың аудандық кезеңі · биология · 2025–2026'],
 ['c11','s','Грамота · 3-орын','«Pro Eco» экологиялық жобалар конкурсы · аудандық кезең · 2026'],
 ['c00','s','Мадақтама','«Көктем көркі — қызғалдақ» қалалық фестивалі · Оқушылар сарайы · сәуір 2026'],
 ['f08','s','II дәрежелі диплом','«Алматы БалаFEST-2025» · «Жасыл Алматы» байқауы · «Эко-қала — арманымдағы Алматы» номинациясы · Рахман Гаухар'],
 ['f09','s','II дәрежелі диплом','«Алматы БалаFEST-2025» · «Жасыл Алматы» байқауы · «Эко-қала — арманымдағы Алматы» номинациясы · Әбділі Жанерке'],
 ['f06','s','Жүлдегерлер · «Алматы БалаFEST»','«Жасыл Алматы» байқауының дипломанттары · 2025'],
 ['f05','s','«Алматы БалаFEST» фестивалі','Халықаралық балаларды қорғау күні · 1 маусым'],
 ['f16','s','Диплом · II орын','«Алматы БалаFEST» · «Жасыл Алматы» байқауы · Жүніс Жансая, Бекмұратұлы Бекзат, Асқарбек Ақнұр · 2024'],
 ['f13','s','«Эко-қала» макеті','Оқушылардың «Жасыл Алматы» байқауына дайындаған жобасы'],
 ['f17','s','Сертификат · Jas Galym Science Quest','Халықаралық балаларды қорғау күніне арналған қалалық балалар фестивалі · 2024'],
 ['f14','s','Грамоталар','Оқушылардың экологиялық байқаудағы жетістігі'],
 ['f11','s','Мақтау грамоталары','№169 мектеп-лицей оқушылары'],
 ['f19','s','METU сертификаттары','Мектеп оқушылары арасындағы байқау · METU университеті'],
 ['f18','s','Грамота · III орын','«Жас құтқарушы» аудандық жарысы · жалпыкомандалық есеп · Оқушылар сарайы · 2023'],
 ['f03','s','Жобалар жетістіктеріне саяхат','№169 мектеп-лицей · оқушылардың жобалар көрмесі'],
 ['f04','s','Жобалар көрмесінде','Оқушылар жобалар жетістіктерін таныстыруда'],
 ['g00','s','Экологиялық жоба · грамоталар','Оқушылардың макеті, грамоталары мен сертификаты'],
 ['g01','s','Қақпақтардан жасалған Қазақстан картасы','Экологиялық шығармашылық жоба · қайта өңдеу идеясы'],
 ['g05','s','Оқушылардың ми модельдері','Биология кабинеті · практикалық жұмыстар көрмесі'],
 ['d15','t','Жеңімпаз дипломы · 100 балл','Қаржы қауіпсіздігі бойынша республикалық диктант · Halyk, «Қарызсыз қоғам», «Адал азамат»'],
 ['d01','t','Алғыс хат','Ө.О. Оспанов атындағы Қазақ топырақтану және агрохимия ҒЗИ · «Таза табиғат — жарқын болашақ» дөңгелек үстелі · 2026'],
 ['d07','c','NIS сертификаты · 80 сағат','НЗМ Педагогикалық шеберлік орталығы · «Педагогтердің пәндік құзыреттілігін дамыту: биология мен жаратылыстануды оқытудың тиімді тәжірибесі» · 21.11.2025'],
 ['d16','c','БМДИ сертификаты · 80 сағат','«Инклюзивті білім беру жағдайында ерекше білім беру қажеттілігі бар балаларды педагогикалық-психологиялық қолдау» · 30.08.2025'],
 ['d12','c','Семинар-практикум · 72 сағат','«Генетикалық есептерді шешу тәсілдері» · Алматы қ. ҚБЖТҒӘО · 12–28.03.2025'],
 ['d18','c','ЕҚЫҰ сертификаты','Мүгедектігі бар адамдардың құқықтары мен қажеттіліктері бойынша оқыту курсы · 06.01.2026'],
 ['d06','c','«ПедОлимп» сертификаты','«Астана дарыны» орталығы · педагогтерге арналған қашықтықтан олимпиада · 1 наурыз – 1 мамыр 2026'],
 ['d14','c','Қатысушы сертификаты · 100 балл','Қаржы қауіпсіздігі бойынша республикалық диктант'],
 ['d00','s','Диплом · I орын','Республикалық «Кенгуру» жалпы пәндік интеллектуалдық олимпиадасы · биология · 2026'],
 ['d17','s','Диплом · II орын','Республикалық «Кенгуру» жалпы пәндік интеллектуалдық олимпиадасы · биология · 2026'],
 ['d05','s','Диплом · I орын','«Ақбота-2025» зияткерлік олимпиадасының жеңімпазы · биология · «ПедСтарт»'],
 ['d13','s','Диплом · I орын','«Ақбота-2025» зияткерлік олимпиадасының жеңімпазы · биология · «ПедСтарт»'],
 ['d09','s','Диплом · I дәрежелі','«DODA» республикалық білім олимпиадасы · «биология – химия» · 9-сынып · 2026'],
 ['d10','s','Диплом · I дәрежелі','«DODA» республикалық білім олимпиадасы · «биология – химия» · 9-сынып · 2026'],
 ['d11','s','Диплом · I дәрежелі','«DODA» республикалық білім олимпиадасы · «биология – география» · 9-сынып · 2026'],
 ['d08','s','Диплом · II дәрежелі','«DODA» республикалық білім олимпиадасы · «биология – химия» · 9-сынып · 2026'],
 ['d03','s','Диплом · II дәрежелі','XVIII президенттік олимпиаданың аудандық кезеңі · жаратылыстану-математика циклы · 2024'],
 ['d04','s','Диплом · III дәрежелі','XVIII президенттік олимпиаданың аудандық кезеңі · жаратылыстану-математика циклы · 2025'],
 ['e04','t','III дәрежелі диплом','CLIL кіріктірілген сабақтар (химия, биология, физика) фестивалінің қалалық байқауы · аудандық кезең · 2025'],
 ['e08','t','II дәрежелі диплом','Халықаралық эвристикалық «ПолиМат» марафонының жүлдегері · Астана · 2026'],
 ['f07','t','Мектеп-лицей ұжымы','№169 мектеп-лицейдің педагогтер ұжымы'],
 ['g06','t','Ашық сабақ · «Логикалық биология»','Биология кабинетінде өткен сабақтан сәттер'],
 ['g02','t','«Алматы — таза қала»','Экологиялық акцияға ұжыммен қатысу'],
 ['v03','v','Биология сабағынан бейне','Биология кабинетіндегі сабақ барысы','v'],
 ['v00','v','Жаратылыстану апталығы','Оқушылар мен мұғалімдердің қызықты тәжірибелері','v'],
 ['v01','v','Жаратылыстану апталығы · тәжірибелер','Мектеп-лицейдегі жаратылыстану апталығынан көріністер','v'],
 ['v02','v','Жаратылыстану апталығы · ашық алаңда','Мектеп ауласындағы тәжірибелер мен көрсетілімдер','v'],
 ['e07','c','«ПолиМат» сертификаты','Халықаралық эвристикалық марафонның қатысушысы · 2026'],
 ['e00','c','Куәлік','Қалалық білім берудегі жаңа технологиялардың ғылыми-әдістемелік орталығы · Алматы · 2024'],
 ['f12','c','Куәлік · авторлық бағдарлама','«Жасуша органоидтеріне саяхат» элективті курс бағдарламасы · 9-сынып · сараптамалық кеңес шешімі (№6 хаттама) · тіркеу №320 · 27.08.2024'],
 ['e02','s','I дәрежелі диплом · I орын','«PARASAT TALENT» III республикалық олимпиадасы · биология · 9-сынып · 2026'],
 ['e06','s','Диплом · I орын','«Ақбота-2025» зияткерлік олимпиадасының жеңімпазы · биология · «ПедСтарт»'],
 ['e05','s','II дәрежелі диплом','«Зерде» республикалық конкурсының аудандық кезеңі · химия, биология секциясы · 2025'],
 ['e03','s','Диплом · III орын','«Полиглот» қалалық байқауы · биология · «Алматы дарыны» · 2025'],
 ['e01','s','Диплом · II орын','«Полиглот» қалалық байқауы · биология · «Алматы дарыны» · 2025'],
 ['d02','s','Мадақтама · номинация','«Көктем көркі — қызғалдақ» фестивалі · «Көктем сыйы» байқауы · «Нәзіктік пен нәзік көрініс» номинациясы · сәуір 2026']
];

/* ============ БАСТЫ БЕТ ============ */
function buildHome(){
  $('#pGoal').textContent=D.goal;$('#pRev').textContent=D.reviewer;
  $('#pTasks').innerHTML=D.tasks.map(t=>`<li>${esc(t)}</li>`).join('');
  $('#pPrinc').innerHTML=D.principles.map((t,i)=>`<div><b>0${i+1}</b>${esc(t)}</div>`).join('');
  $('#pAssess').innerHTML=D.assess.map(t=>`<span class="chip">${esc(t)}</span>`).join('');
  $('#pLit').innerHTML=D.lit.map(t=>`<li>${esc(t)}</li>`).join('');
  // статистика
  let q=0,g=0;L.forEach(l=>{if(Array.isArray(l.quiz))q+=l.quiz.length;g+=l.games.length+1;});
  const st=$$('.hero-stats b');st[2].textContent=g;st[3].textContent=q;
  renderLessons();
  $('#search').addEventListener('input',renderLessons);
  // марапаттар
  const gal=$('#gallery');
  gal.innerHTML=AWARDS.map((a,i)=>`<figure class="aw${a[4]?' isv':''}" data-k="${a[1]}" data-i="${i}"><div class="awm"><img src="img/${a[0]}.jpg" alt="${esc(a[2])}" loading="lazy">${a[4]?'<span class="play">▶</span>':''}</div><figcaption><span class="tag ${a[1]}">${{t:'Мұғалім',s:'Оқушы',c:'Біліктілік',v:'Бейне'}[a[1]]}</span><b>${esc(a[2])}</b><span>${esc(a[3])}</span></figcaption></figure>`).join('');
  $$('#awTabs button').forEach(b=>{const f=b.dataset.f;const n=f==='all'?AWARDS.length:AWARDS.filter(x=>x[1]===f).length;b.insertAdjacentHTML('beforeend',` <small>${n}</small>`);});
  $$('#awTabs button').forEach(b=>b.onclick=()=>{$$('#awTabs button').forEach(x=>x.classList.toggle('on',x===b));const f=b.dataset.f;$$('.aw').forEach(a=>a.hidden=f!=='all'&&a.dataset.k!==f);});
  const lb=$('#lightbox');let cur=0;
  const show=i=>{const vis=$$('.aw').filter(a=>!a.hidden).map(a=>+a.dataset.i);if(!vis.length)return;const p=vis.indexOf(i);cur=i;const a=AWARDS[i];const vd=$('video',lb),im=$('img',lb);vd.pause();if(a[4]){im.hidden=true;vd.hidden=false;vd.poster='img/'+a[0]+'.jpg';vd.src='vid/'+a[0]+'.mp4';}else{vd.hidden=true;vd.removeAttribute('src');vd.load();im.hidden=false;im.src='img/'+a[0]+'.jpg';}$('figcaption',lb).textContent=a[2]+' — '+a[3];lb.hidden=false;lb._vis=vis;lb._p=p;};
  gal.addEventListener('click',e=>{const f=e.target.closest('.aw');if(f)show(+f.dataset.i);});
  const close=()=>{lb.hidden=true;$('video',lb).pause();};$('.lb-x',lb).onclick=close;lb.addEventListener('click',e=>{if(e.target===lb)close();});
  $('.lb-n',lb).onclick=()=>{const v=lb._vis;show(v[(lb._p+1)%v.length]);};
  $('.lb-p',lb).onclick=()=>{const v=lb._vis;show(v[(lb._p-1+v.length)%v.length]);};
  document.addEventListener('keydown',e=>{if(lb.hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowRight')$('.lb-n',lb).click();if(e.key==='ArrowLeft')$('.lb-p',lb).click();});
}
function renderLessons(){
  const q=($('#search').value||'').toLowerCase().trim();
  let done=0;
  $('#modules').innerHTML=MODULES.map((m,mi)=>{
    const cards=[];for(let n=m[2];n<=m[3];n++){const l=L[n-1];if(q&&!(l.t.toLowerCase().includes(q)||String(n)===q))continue;
      const s=stars(n);if(s>=3)done++;
      cards.push(`<a class="lcard ${s>=3?'done':''}" href="#lesson-${n}"><span class="ico" style="background:${MCOL[mi]}"></span><span class="stars">${[0,1,2].map(i=>`<span class="${i<s?'on':''}">★</span>`).join('')}</span><span class="n">${n}-сабақ</span><span class="tt">${esc(l.t)}</span><span class="ty">${esc(l.type)}</span></a>`);}
    if(!cards.length)return '';
    return `<div class="module"><h3><span>${m[0]} бөлім</span>${esc(m[1])}</h3><div class="lgrid">${cards.join('')}</div></div>`;
  }).join('')||'<p class="sub" style="text-align:center">Ештеңе табылмады.</p>';
  let all=0;for(let n=1;n<=34;n++)if(stars(n)>=3)all++;
  $('#progTxt').textContent=`${all} / 34 сабақ толық меңгерілді`;$('#progBar').style.width=(all/34*100)+'%';
}

/* ============ САБАҚ БЕТІ ============ */
let viewers=[];
function killViewers(){viewers.forEach(v=>v.destroy());viewers=[];}
function openLesson(n){
  killViewers();
  const l=L[n-1];if(!l)return;
  const p=prog(n);p.seen=1;saveProg(n,p);
  const sc=SC[l.sc];
  const lv=$('#lessonView');lv.hidden=false;$('#homeView').hidden=true;
  const mi=MODULES.findIndex(m=>n>=m[2]&&n<=m[3]);
  lv.innerHTML=`
  <div class="lv-head"><div class="wrap">
    <div class="crumbs"><a href="#lessons">← Барлық сабақтар</a> · ${MODULES[mi][0]} бөлім: ${esc(MODULES[mi][1])}</div>
    <div class="num">${n}-сабақ · 1 сағат</div>
    <h1>${esc(l.t)}</h1>
    <div class="lv-meta"><span class="chip">Өткізілу түрі: ${esc(l.type)}</span><span class="chip">Білімдік қазынасы: ${esc(l.goal)}</span></div>
  </div></div>
  <div class="lv-body">
    <div class="viewer-card">
      <div class="vc-top"><b>3D анимация-видео</b><span class="rec"><i></i>3D</span></div>
      <div class="stage"><div class="v" style="position:absolute;inset:0"></div><div class="caption"><span class="sn"></span><span class="ct"></span></div></div>
      <div class="vc-ctrl"><button class="play" title="Ойнату">▶</button><div class="vprog"><i></i></div><button class="lbl on" title="Белгілер">Белгілер</button><button class="rot on" title="Айналу">Айналу</button><button class="fs" title="Толық экран">⛶</button></div>
      <div class="steps"></div>
      <div class="hint">Тышқанмен/саусақпен айналдыр · дөңгелекпен үлкейт · екі рет бас — бастапқы көрініс</div>
    </div>
    <div class="panel">
      <div class="ptabs"><button data-t="th" class="on">📖 Теория</button><button data-t="qz">✅ Тест</button><button data-t="gm">🎮 Ойындар</button><button data-t="tk">📝 Тапсырма</button></div>
      <div class="pbody"></div>
    </div>
  </div>
  <div class="lv-nav">${n>1?`<a href="#lesson-${n-1}"><small>← Алдыңғы сабақ</small><b>${n-1}. ${esc(L[n-2].t)}</b></a>`:''}${n<34?`<a class="nx" href="#lesson-${n+1}"><small>Келесі сабақ →</small><b>${n+1}. ${esc(L[n].t)}</b></a>`:''}</div>`;
  window.scrollTo(0,0);
  setupViewer(lv,sc);
  const body=$('.pbody',lv);
  const tabs={th:()=>renderTheory(body,l),qz:()=>renderQuiz(body,l,n),gm:()=>renderGames(body,l,n,sc),tk:()=>renderTask(body,l,n)};
  $$('.ptabs button',lv).forEach(b=>b.onclick=()=>{$$('.ptabs button',lv).forEach(x=>x.classList.toggle('on',x===b));viewers.slice(1).forEach(v=>v.destroy());viewers=viewers.slice(0,1);tabs[b.dataset.t]();});
  tabs.th();
}
function setupViewer(lv,sc){
  const host=$('.stage .v',lv);
  const v=new E3D.Viewer(host,sc,{shift:-36});viewers.push(v);
  const S=v.steps();const cap=$('.caption .ct',lv),sn=$('.caption .sn',lv),stb=$('.steps',lv),play=$('.play',lv),bar=$('.vprog i',lv),rec=$('.rec',lv);
  stb.innerHTML=S.map((s,i)=>`<button title="${i+1}-кадр">${i+1}</button>`).join('');
  const upd=i=>{cap.textContent=S[i].cap||'';sn.textContent=`КАДР ${i+1} / ${S.length}`;$$('button',stb).forEach((b,j)=>b.classList.toggle('on',j===i));v.highlight=S[i].hl||null;};
  v.onStep=upd;upd(0);
  v.onProgress=f=>{bar.style.width=(f*100)+'%';};
  v.onEnd=()=>{play.textContent='↻';rec.classList.remove('live');};
  play.onclick=()=>{if(v.playing){v.pause();play.textContent='▶';rec.classList.remove('live');}else{if(play.textContent==='↻')v.goStep(0);v.play();play.textContent='❚❚';rec.classList.add('live');}};
  $$('button',stb).forEach((b,i)=>b.onclick=()=>{v.goStep(i);v.play();play.textContent='❚❚';rec.classList.add('live');});
  $('.vprog',lv).onclick=e=>{const r=e.currentTarget.getBoundingClientRect();const f=(e.clientX-r.left)/r.width;let tot=S.reduce((a,s)=>a+s.dur,0),acc=0;for(let i=0;i<S.length;i++){if(acc+S[i].dur>=f*tot){v.goStep(i);v.stepT=f*tot-acc;break;}acc+=S[i].dur;}};
  const lb=$('.lbl',lv);lb.onclick=()=>{v.showLabels=!v.showLabels;lb.classList.toggle('on',v.showLabels);};
  const rt=$('.rot',lv);rt.classList.toggle('on',v.auto);rt.onclick=()=>{v.auto=!v.auto;rt.classList.toggle('on',v.auto);};
  $('.fs',lv).onclick=()=>{const c=$('.viewer-card',lv);try{if(document.fullscreenElement)document.exitFullscreen();else (c.requestFullscreen||c.webkitRequestFullscreen).call(c).catch(()=>{});}catch(e){}};
  document.addEventListener('fullscreenchange',()=>{const st=$('.stage',lv);if(st)st.style.height=document.fullscreenElement?'calc(100vh - 150px)':'';});
}
function renderTheory(b,l){
  b.innerHTML=`<div class="theory">${l.th.map(p=>`<p>${p}</p>`).join('')}</div>
  ${l.fact?`<div class="fact"><span class="em">💡</span><div><b>Қызықты дерек</b>${esc(l.fact)}</div></div>`:''}
  ${l.terms.length?`<h4>Негізгі ұғымдар</h4><p class="sub">Карточканы бас — анықтамасы ашылады.</p><div class="terms">${l.terms.map(t=>`<div class="term"><div><div class="fr">${esc(t[0])}</div><div class="bk">${esc(t[1])}</div></div></div>`).join('')}</div>`:''}`;
  $$('.term',b).forEach(t=>t.onclick=()=>t.classList.toggle('flip'));
}
/* ---- тест ---- */
function finalQuiz(){const all=[];L.forEach(l=>{if(Array.isArray(l.quiz))l.quiz.forEach(q=>all.push(q));});return shuffle(all).slice(0,15);}
function renderQuiz(b,l,n){
  const Q=l.quiz==='final'?finalQuiz():l.quiz;let i=0,score=0;
  const intro=l.quiz==='final'?`<p class="sub">Қорытынды тест: барлық тақырыптардан кездейсоқ 15 сұрақ. Әр жолы жаңа сұрақтар!</p>`:'';
  const draw=()=>{
    if(i>=Q.length){const pc=Math.round(score/Q.length*100);const p=prog(n);if(pc>p.quiz){p.quiz=pc;saveProg(n,p);}
      const st=pc>=90?3:pc>=70?2:pc>=40?1:0;
      b.innerHTML=`<div class="result"><div class="big">${score}/${Q.length}</div><div class="st">${'★'.repeat(st)}${'☆'.repeat(3-st)}</div><p>${pc>=90?'Керемет! Тақырыпты толық меңгердің.':pc>=70?'Жақсы нәтиже! Аздап қайталасаң — тамаша болады.':'Теорияны қайта оқып, тағы бір рет көр. Қателесу — үйренудің бөлігі!'}</p><div class="row" style="justify-content:center"><button class="btn primary sm" id="qr">Қайта тапсыру</button></div></div>`;
      $('#qr').onclick=()=>renderQuiz(b,l,n);return;}
    const q=Q[i];const order=shuffle(q[1].map((t,k)=>k));
    b.innerHTML=`${intro}<div class="qhead"><span>Сұрақ ${i+1} / ${Q.length}</span><span>Дұрыс: ${score}</span></div><div class="qbar"><i style="width:${i/Q.length*100}%"></i></div>
    <div class="qq">${esc(q[0])}</div><div class="opts">${order.map((k,j)=>`<button class="opt" data-k="${k}"><span class="l">${'ABCD'[j]}</span>${esc(q[1][k])}</button>`).join('')}</div><div class="fb"></div>`;
    $$('.opt',b).forEach(o=>o.onclick=()=>{const k=+o.dataset.k;const ok=k===q[2];if(ok)score++;
      $$('.opt',b).forEach(x=>{x.disabled=true;if(+x.dataset.k===q[2])x.classList.add('ok');});if(!ok)o.classList.add('bad');
      $('.fb',b).innerHTML=`<div class="expl"><b>${ok?'Дұрыс! ':'Дұрыс жауап: '+esc(q[1][q[2]])+'. '}</b>${esc(q[3]||'')}</div><div class="row"><button class="btn primary sm">${i+1<Q.length?'Келесі →':'Нәтиже'}</button></div>`;
      $('.fb .btn',b).onclick=()=>{i++;draw();};});
  };draw();
}
/* ---- ойындар ---- */
const GT={match:'Сәйкестендіру',sort:'Топтастыру',order:'Ретін құру',tf:'Дұрыс/Бұрыс',memory:'Жады ойыны',fill:'Толықтыру',comp:'Комплементарлық',codon:'Код оқу',find3d:'3D ойын'};
function renderGames(b,l,n,sc){
  b.innerHTML='';
  l.games.forEach((g,gi)=>{const c=h('div',{class:'gcard'});c.innerHTML=`<h5><span class="gt">${GT[g.type]}</span>${esc(g.title)}</h5>`;b.appendChild(c);
    const win=msg=>{const p=prog(n);p.games[gi]=1;saveProg(n,p);toast('🎉 '+(msg||'Жарайсың! Ойын аяқталды'));};
    (G[g.type]||(()=>{}))(c,g,win,sc);});
}
function msgEl(c){let m=$('.gmsg',c);if(!m){m=h('div',{class:'gmsg'});c.appendChild(m);}return m;}
const G={
 match(c,g,win){const box=h('div',{class:'match'});const A=h('div',{class:'col'}),B=h('div',{class:'col'});box.append(A,B);c.appendChild(box);const m=msgEl(c);
  let sel=null,left=g.pairs.length,err=0;
  shuffle(g.pairs.map((p,i)=>i)).forEach(i=>{const t=h('button',{class:'tile'},esc(g.pairs[i][0]));t.dataset.i=i;A.appendChild(t);});
  shuffle(g.pairs.map((p,i)=>i)).forEach(i=>{const t=h('button',{class:'tile'},esc(g.pairs[i][1]));t.dataset.i=i;B.appendChild(t);});
  A.onclick=e=>{const t=e.target.closest('.tile');if(!t||t.disabled)return;$$('.tile',A).forEach(x=>x.classList.remove('sel'));t.classList.add('sel');sel=t;};
  B.onclick=e=>{const t=e.target.closest('.tile');if(!t||t.disabled)return;if(!sel){m.className='gmsg';m.textContent='Алдымен сол жақтан таңда.';return;}
    if(t.dataset.i===sel.dataset.i){[t,sel].forEach(x=>{x.classList.remove('sel');x.classList.add('ok');x.disabled=true;});sel=null;left--;m.className='gmsg ok';m.textContent=left?'Дұрыс! Жалғастыр.':`Барлығы дұрыс! Қателер саны: ${err}`;if(!left)win();}
    else{err++;t.classList.add('bad');sel.classList.add('bad');const s=sel;setTimeout(()=>{t.classList.remove('bad');s.classList.remove('bad');},400);m.className='gmsg bad';m.textContent='Қате, тағы байқап көр.';}};
 },
 sort(c,g,win){const m=h('p',{class:'sub'},'Сөзді таңдап, дұрыс топқа бас (немесе сүйреп апар).');c.appendChild(m);
  const pool=h('div',{class:'pool'});c.appendChild(pool);
  const bins=h('div',{class:'bins'});bins.style.gridTemplateColumns=`repeat(${Math.min(g.cats.length,4)},1fr)`;c.appendChild(bins);
  g.cats.forEach((ct,i)=>{const bn=h('div',{class:'bin'},`<b>${esc(ct)}</b><div class="in"></div>`);bn.dataset.c=i;bins.appendChild(bn);});
  let sel=null;
  const mk=(it,idx)=>{const ch=h('span',{class:'pchip',draggable:'true'},esc(it[0]));ch.dataset.c=it[1];ch.dataset.i=idx;
    ch.onclick=e=>{e.stopPropagation();$$('.pchip',c).forEach(x=>x.classList.remove('sel'));ch.classList.add('sel');sel=ch;$$('.bin',c).forEach(x=>x.classList.add('target'));};
    ch.ondragstart=e=>{sel=ch;e.dataTransfer.setData('text','x');};return ch;};
  shuffle(g.items).forEach((it,i)=>pool.appendChild(mk(it,i)));
  const place=bn=>{if(!sel)return;$('.in',bn).appendChild(sel);sel.classList.remove('sel','ok','bad');sel=null;$$('.bin',c).forEach(x=>x.classList.remove('target'));};
  $$('.bin',c).forEach(bn=>{bn.onclick=()=>place(bn);bn.ondragover=e=>{e.preventDefault();bn.classList.add('over');};bn.ondragleave=()=>bn.classList.remove('over');bn.ondrop=e=>{e.preventDefault();bn.classList.remove('over');place(bn);};});
  pool.onclick=()=>{if(sel){pool.appendChild(sel);sel.classList.remove('sel');sel=null;$$('.bin',c).forEach(x=>x.classList.remove('target'));}};
  const row=h('div',{class:'row'});const chk=h('button',{class:'btn primary sm'},'Тексеру');const rs=h('button',{class:'btn ghost sm'},'Қайта бастау');row.append(rs,chk);c.appendChild(row);const msg=msgEl(c);
  chk.onclick=()=>{let ok=0;const tot=g.items.length;$$('.bin',c).forEach(bn=>$$('.pchip',bn).forEach(ch=>{const good=ch.dataset.c===bn.dataset.c;ch.classList.toggle('ok',good);ch.classList.toggle('bad',!good);if(good)ok++;}));
    const rest=$$('.pchip',pool).length;msg.className='gmsg '+(ok===tot?'ok':'bad');msg.textContent=ok===tot?'Тамаша! Барлығы дұрыс орналасты.':`Дұрыс: ${ok} / ${tot}${rest?` · орналастырылмаған: ${rest}`:''}. Қызыл сөздерді басқа топқа ауыстыр.`;if(ok===tot)win();};
  rs.onclick=()=>{$$('.pchip',c).forEach(ch=>{ch.classList.remove('ok','bad');pool.appendChild(ch);});msg.textContent='';};
 },
 order(c,g,win){c.appendChild(h('p',{class:'sub'},'Жолдарды сүйреп немесе ↑ ↓ батырмаларымен дұрыс ретке қой.'));
  const list=h('div',{class:'olist'});c.appendChild(list);let items=shuffle(g.items.map((t,i)=>i));if(items.every((v,i)=>v===i))items.reverse();
  let drag=null;
  const draw=()=>{list.innerHTML='';items.forEach((ix,pos)=>{const r=h('div',{class:'oitem',draggable:'true'},`<span class="k">${pos+1}</span><span class="tx">${esc(g.items[ix])}</span><span class="mv"><button aria-label="Жоғары">↑</button><button aria-label="Төмен">↓</button></span>`);
    const [u,d]=$$('.mv button',r);u.onclick=()=>{if(pos>0){[items[pos-1],items[pos]]=[items[pos],items[pos-1]];draw();}};d.onclick=()=>{if(pos<items.length-1){[items[pos+1],items[pos]]=[items[pos],items[pos+1]];draw();}};
    r.ondragstart=()=>{drag=pos;r.classList.add('drag');};r.ondragend=()=>r.classList.remove('drag');r.ondragover=e=>e.preventDefault();
    r.ondrop=e=>{e.preventDefault();if(drag===null||drag===pos)return;const [x]=items.splice(drag,1);items.splice(pos,0,x);drag=null;draw();};
    list.appendChild(r);});};
  draw();const row=h('div',{class:'row'});const chk=h('button',{class:'btn primary sm'},'Тексеру');row.append(chk);c.appendChild(row);const msg=msgEl(c);
  chk.onclick=()=>{let ok=0;$$('.oitem',list).forEach((r,pos)=>{const g2=items[pos]===pos;r.classList.toggle('ok',g2);r.classList.toggle('bad',!g2);if(g2)ok++;});
    msg.className='gmsg '+(ok===items.length?'ok':'bad');msg.textContent=ok===items.length?'Керемет! Реті дұрыс.':`Орнында тұрған: ${ok} / ${items.length}. Қызыл жолдарды ауыстырып көр.`;if(ok===items.length)win();};
 },
 tf(c,g,win){const box=h('div',{class:'tfbox'});c.appendChild(box);const items=shuffle(g.items);let i=0,sc=0;
  const draw=()=>{if(i>=items.length){box.innerHTML=`<div class="result"><div class="big">${sc}/${items.length}</div><p>${sc===items.length?'Барлығы дұрыс!':'Жақсы! Қателерді теориядан қайта қара.'}</p><button class="btn ghost sm">Қайта ойнау</button></div>`;$('button',box).onclick=()=>{i=0;sc=0;draw();};if(sc===items.length)win();return;}
    box.innerHTML=`<p class="sub">${i+1} / ${items.length}</p><div class="s">${esc(items[i][0])}</div><div class="tfbtns"><button class="y">✓ Дұрыс</button><button class="n">✗ Бұрыс</button></div><div class="gmsg"></div>`;
    const ans=v=>{const ok=v===items[i][1];if(ok)sc++;const m=$('.gmsg',box);m.className='gmsg '+(ok?'ok':'bad');m.textContent=ok?'Дұрыс!':`Қате. Бұл тұжырым — ${items[i][1]?'дұрыс':'бұрыс'}.`;$$('.tfbtns button',box).forEach(b=>b.disabled=true);setTimeout(()=>{i++;draw();},ok?700:1500);};
    $('.y',box).onclick=()=>ans(true);$('.n',box).onclick=()=>ans(false);};draw();
 },
 memory(c,g,win){const grid=h('div',{class:'mem'});c.appendChild(grid);const msg=msgEl(c);
  const cards=shuffle(g.pairs.flatMap((p,i)=>[[p[0],i],[p[1],i]]));let open=[],found=0,moves=0,lock=false;
  cards.forEach(cd=>{const e=h('div',{class:'mcard'},`<div><div class="fr">🧬</div><div class="bk">${esc(cd[0])}</div></div>`);e.dataset.p=cd[1];grid.appendChild(e);
    e.onclick=()=>{if(lock||e.classList.contains('open')||e.classList.contains('ok'))return;e.classList.add('open');open.push(e);
      if(open.length===2){moves++;lock=true;const [a,b2]=open;if(a.dataset.p===b2.dataset.p){setTimeout(()=>{a.classList.add('ok');b2.classList.add('ok');open=[];lock=false;found++;msg.className='gmsg ok';msg.textContent=found===g.pairs.length?`Барлық жұп табылды! Жүрістер: ${moves}`:'Жұп табылды!';if(found===g.pairs.length)win();},350);}
        else setTimeout(()=>{a.classList.remove('open');b2.classList.remove('open');open=[];lock=false;},900);}};});
 },
 fill(c,g,win){const parts=g.text.split(/\{([^}]+)\}/);const ans=parts.filter((p,i)=>i%2);const opts=shuffle(ans.concat(g.extra||[]));
  const box=h('div',{class:'fill'});box.innerHTML=parts.map((p,i)=>i%2?`<select data-a="${esc(p)}"><option value="">— таңда —</option>${opts.map(o=>`<option>${esc(o)}</option>`).join('')}</select>`:esc(p)).join('');c.appendChild(box);
  const row=h('div',{class:'row'});const chk=h('button',{class:'btn primary sm'},'Тексеру');row.append(chk);c.appendChild(row);const msg=msgEl(c);
  chk.onclick=()=>{let ok=0;const ss=$$('select',box);ss.forEach(s=>{const g2=s.value===s.dataset.a;s.classList.toggle('ok',g2);s.classList.toggle('bad',!g2);if(g2)ok++;});msg.className='gmsg '+(ok===ss.length?'ok':'bad');msg.textContent=ok===ss.length?'Барлығы дұрыс!':`Дұрыс: ${ok} / ${ss.length}`;if(ok===ss.length)win();};
 },
 comp(c,g,win){const MAP={dna:{'А':'Т','Т':'А','Г':'Ц','Ц':'Г'},rna:{'А':'У','Т':'А','Г':'Ц','Ц':'Г'},anti:{'А':'У','У':'А','Г':'Ц','Ц':'Г'}}[g.mode];
  const COL={'А':'#e4572e','Т':'#3b8ea5','У':'#8e6bd1','Г':'#4caf50','Ц':'#f4c430'};const keys=g.mode==='dna'?['А','Т','Г','Ц']:['А','У','Г','Ц'];
  const lab={dna:['Берілген ДНҚ тізбегі:','Комплементарлы ДНҚ тізбегі:'],rna:['ДНҚ матрицалық тізбегі:','иРНҚ:'],anti:['иРНҚ кодондары:','тРНҚ антикодондары:']}[g.mode];
  const s=g.seq.split('');const ans=Array(s.length).fill('');let cur=0;
  c.insertAdjacentHTML('beforeend',`<p class="sub">${lab[0]}</p><div class="seq top">${s.map((x,i)=>`<span class="b" style="background:${COL[x]}${g.mode==='anti'&&i%3===2?';margin-right:10px':''}">${x}</span>`).join('')}</div><p class="sub">${lab[1]} (ұяшықты таңдап, әріпті бас)</p><div class="seq bot"></div><div class="kbd">${keys.map(k=>`<button style="background:${COL[k]}">${k}</button>`).join('')}<button style="background:#90a4ae">⌫</button></div>`);
  const bot=$('.seq.bot',c);
  const draw=()=>{bot.innerHTML=s.map((x,i)=>`<span class="b slot ${i===cur?'cur':''}" data-i="${i}" style="${ans[i]?'background:'+COL[ans[i]]+';color:#fff':''}${g.mode==='anti'&&i%3===2?';margin-right:10px':''}">${ans[i]||'?'}</span>`).join('');$$('.slot',bot).forEach(e=>e.onclick=()=>{cur=+e.dataset.i;draw();});};draw();
  $$('.kbd button',c).forEach(b=>b.onclick=()=>{const k=b.textContent;if(k==='⌫'){ans[cur]='';cur=Math.max(0,cur-1);}else{ans[cur]=k;cur=Math.min(s.length-1,cur+1);}draw();});
  const row=h('div',{class:'row'});const chk=h('button',{class:'btn primary sm'},'Тексеру');row.append(chk);c.appendChild(row);const msg=msgEl(c);
  chk.onclick=()=>{let ok=0;$$('.slot',bot).forEach((e,i)=>{const g2=ans[i]===MAP[s[i]];e.classList.toggle('ok',g2);e.classList.toggle('bad',!g2);if(g2)ok++;});msg.className='gmsg '+(ok===s.length?'ok':'bad');msg.textContent=ok===s.length?'Тамаша! Комплементарлық принципті меңгердің.':`Дұрыс: ${ok} / ${s.length}. Есте сақта: ${Object.entries(MAP).map(e=>e[0]+'→'+e[1]).join(', ')}`;if(ok===s.length)win();};
 },
 codon(c,g,win){const cods=g.seq.match(/.{3}/g);const vals=[...new Set(Object.values(g.table))];
  c.insertAdjacentHTML('beforeend',`<p class="sub">иРНҚ: <b style="letter-spacing:2px">${cods.join(' · ')}</b></p><div class="codons">${cods.map((cd,i)=>`<div class="codon"><div class="c">${cd}</div><select><option value="">?</option>${vals.map(v=>`<option>${v}</option>`).join('')}</select></div>`).join('')}</div>
   <details style="margin-top:10px;font-size:13.5px"><summary>Генетикалық код кестесінен үзінді</summary><p>${Object.entries(g.table).map(e=>`<b>${e[0]}</b> — ${e[1]}`).join(' · ')}</p></details>`);
  const row=h('div',{class:'row'});const chk=h('button',{class:'btn primary sm'},'Тексеру');row.append(chk);c.appendChild(row);const msg=msgEl(c);
  chk.onclick=()=>{let ok=0;$$('.codon',c).forEach((e,i)=>{const g2=$('select',e).value===g.table[cods[i]];e.classList.toggle('ok',g2);e.classList.toggle('bad',!g2);if(g2)ok++;});msg.className='gmsg '+(ok===cods.length?'ok':'bad');msg.textContent=ok===cods.length?'Керемет! Нәруыз тізбегі: '+cods.map(x=>g.table[x]).filter(x=>x!=='СТОП').join('–'):`Дұрыс: ${ok} / ${cods.length}`;if(ok===cods.length)win();};
 },
 find3d(c,g,win,sc){c.appendChild(h('p',{class:'sub'},'Жарқырап тұрған бөлікті тауып, атауын таңда. 6 раунд.'));
  const st=h('div',{class:'f3d'});c.appendChild(st);const qd=h('div',{class:'f3d-q'});c.appendChild(qd);const msg=msgEl(c);
  const v=new E3D.Viewer(st,Object.assign({},sc,{steps:[{cap:'',dur:9999}]}),{labels:false});viewers.push(v);v.quizMode=true;v.dimOthers=true;
  let round=0,score=0;
  const go=()=>{const ids=Object.keys(v.labEls).filter(k=>sc.parts[k]&&v.presentParts&&v.presentParts[k]);if(!ids.length){setTimeout(go,200);return;}
    if(round>=6){v.highlight=null;qd.innerHTML='';msg.className='gmsg '+(score>=5?'ok':'bad');msg.innerHTML=`Нәтиже: ${score} / 6 `;const r=h('button',{class:'btn ghost sm'},'Қайта ойнау');r.onclick=()=>{round=0;score=0;msg.textContent='';go();};msg.appendChild(r);if(score>=5)win();return;}
    const ans=ids[Math.floor(Math.random()*ids.length)];v.highlight=ans;
    const opts=shuffle([ans].concat(shuffle(ids.filter(x=>x!==ans)).slice(0,3)));
    qd.innerHTML='';opts.forEach(o=>{const b=h('button',{class:'tile'},esc(sc.parts[o]));b.onclick=()=>{const ok=o===ans;if(ok)score++;b.classList.add(ok?'ok':'bad');$$('.tile',qd).forEach(x=>{x.disabled=true;if(x.textContent===sc.parts[ans])x.classList.add('ok');});msg.className='gmsg '+(ok?'ok':'bad');msg.textContent=(ok?'Дұрыс! ':'Бұл — ')+sc.parts[ans]+` · ${round+1}/6`;setTimeout(()=>{round++;go();},1100);};qd.appendChild(b);});};
  setTimeout(go,300);
 }
};
function renderTask(b,l,n){
  const r=store.get('r'+n,{f:-1,t:''});
  b.innerHTML=`<h4 style="margin-top:0">Практикалық / шығармашылық тапсырма</h4><div class="task">${l.task}</div>
  <div class="reflect"><h4>Рефлексия: «Бүгін не білдім?»</h4><p class="sub">Өзіңді бағала — қалыптастырушы бағалау.</p>
  <div class="faces">${['😟','🤔','🙂','🤩'].map((f,i)=>`<button data-i="${i}" class="${r.f===i?'on':''}" title="${['Түсінбедім','Толық түсінбедім','Түсіндім','Өзгеге түсіндіре аламын'][i]}">${f}</button>`).join('')}</div>
  <textarea placeholder="Бүгінгі сабақтан алған 3 негізгі ой… Не қиын болды? Тағы не білгім келеді?">${esc(r.t)}</textarea><p class="sub">Жазбаң тек осы құрылғыда сақталады.</p></div>`;
  $$('.faces button',b).forEach(x=>x.onclick=()=>{r.f=+x.dataset.i;store.set('r'+n,r);$$('.faces button',b).forEach(y=>y.classList.toggle('on',y===x));toast('Рахмет! Бағалауың сақталды');});
  $('textarea',b).oninput=e=>{r.t=e.target.value;store.set('r'+n,r);};
}

/* ============ МАРШРУТ ============ */
function route(){
  const hs=(location.hash||'').slice(1);const m=hs.match(/^lesson-(\d+)$/);
  document.body.classList.remove('menu-open');
  if(m&&L[+m[1]-1]){openLesson(+m[1]);return;}
  killViewers();$('#lessonView').hidden=true;$('#lessonView').innerHTML='';$('#homeView').hidden=false;
  renderLessons();
  if(!heroV){try{heroV=new E3D.Viewer($('#heroCell'),Object.assign({},SC.hero,{size:6.6}),{labels:false});}catch(e){}}
  const t=hs&&document.getElementById(hs);if(t)setTimeout(()=>t.scrollIntoView({behavior:'auto'}),10);else if(!hs)window.scrollTo(0,0);
}
let heroV=null;
buildHome();
window.addEventListener('hashchange',route);route();
})();
