'use strict';
// ===== Гонка за сотыми — движок (canvas 1280x720 + расширение на широкие экраны) =====
const LOADQ=[];{const _I=window.Image;window.Image=function(w,h){const i=new _I(w,h);LOADQ.push(i);return i};window.Image.prototype=_I.prototype}
let LOADED=false,LOADT0=performance.now(),FONTOK=false;
const C=document.getElementById('c'),X=C.getContext('2d');
let W=0,H=0,S=1,OX=0,OY=0,DPR=1,T=0,DT=0.016,shake=0,PX=640,PY=360,fade=1;
const SAFE={l:0,t:0,r:0,b:0};let VVX=0,VVY=0;const _sp=document.createElement('div');_sp.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';document.documentElement.appendChild(_sp);
function vpWH(){const v=window.visualViewport;let w=innerWidth,h=innerHeight;VVX=0;VVY=0;if(v&&v.width>0){w=Math.round(v.width);h=Math.round(v.height);VVX=v.offsetLeft||0;VVY=v.offsetTop||0}const e=document.documentElement;return[w||e.clientWidth,h||e.clientHeight]}
function rs(){DPR=Math.min(2,window.devicePixelRatio||1);if(window.scrollX||window.scrollY)window.scrollTo(0,0);[W,H]=vpWH();C.style.left=VVX+'px';C.style.top=VVY+'px';C.style.width=W+'px';C.style.height=H+'px';C.width=Math.round(W*DPR);C.height=Math.round(H*DPR);
 const cs=getComputedStyle(_sp);SAFE.t=parseFloat(cs.paddingTop)||0;SAFE.r=parseFloat(cs.paddingRight)||0;SAFE.b=parseFloat(cs.paddingBottom)||0;SAFE.l=parseFloat(cs.paddingLeft)||0;
 // масштаб по высоте (720), ширина — сколько поместится (широкие телефоны видят больше мира, без чёрных полос)
 S=Math.min(W/1280,H/720);if(W/H>1280/720)S=H/720;OX=(W-1280*S)/2;OY=(H-720*S)/2}
const FS_OK=!!(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen);const isFS=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
function goFS(){if(!FS_OK||isFS())return;const e=document.documentElement;try{const p=(e.requestFullscreen||e.webkitRequestFullscreen).call(e,{navigationUI:'hide'});const lk=()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(_){}};if(p&&p.then)p.then(lk).catch(()=>{});else lk()}catch(_){}}
const TOUCHDEV=('ontouchstart' in window)||navigator.maxTouchPoints>0;let _fsTried=false;
addEventListener('pointerdown',()=>{if(TOUCHDEV&&!_fsTried&&!PORTRAIT()){_fsTried=true;goFS()}},true);
document.addEventListener('fullscreenchange',()=>onOrient());document.addEventListener('webkitfullscreenchange',()=>onOrient());
let _lastW=-1,_lastH=-1,_wasP=null;function relayout(){rs();_lastW=W;_lastH=H;const p=PORTRAIT();if(_wasP!==p){_wasP=p;if(!p){last=performance.now();if(AC&&AC.state==='suspended')AC.resume().catch(()=>{})}}}
function onOrient(){relayout();[100,300,600].forEach(t=>setTimeout(relayout,t))}
addEventListener('resize',onOrient);addEventListener('orientationchange',onOrient);addEventListener('pageshow',onOrient);addEventListener('scroll',()=>{if(scrollX||scrollY)scrollTo(0,0)});document.addEventListener('visibilitychange',()=>{if(!document.hidden)onOrient()});
if(window.visualViewport){visualViewport.addEventListener('resize',onOrient);visualViewport.addEventListener('scroll',onOrient)}
setInterval(()=>{const[w,h]=vpWH();if(w!==_lastW||h!==_lastH||PORTRAIT()!==_wasP)relayout()},500);rs();
// ---- картинки ----
const IM={};function img(n,src){const i=new Image();i.src=src;IM[n]=i;return i}
const okI=i=>i&&i.complete&&i.naturalWidth>0;
['title','map','workshop','market','race_sky','sea','sea2','launch','sky','road'].forEach(n=>img('bg_'+n,'assets/bg/'+n+'.jpg'));
['tina','tina_cheer','tina_point','tina_think','sotik','sotik_cheer','sotik_thumb','sotik_wow','zap','zap_sit','zap_wave','zap_crouch','lastik','lastik_laugh','lastik_angry','lastik_sad','lastik_fly','kart_sotik','kart_tina','kart_zap','kart_lastik'].forEach(n=>img(n,'assets/sprites/'+n+'.png'));
['tree','lamp','arch','stand','boost','puddle','coin','gate','apple','pear','banana','w_big','w_mid','w_small','tag','ruler','sub','oyster_open','oyster','comma','star','rocket','can_red','can_blue','can_green','can_yellow','bread','milk','cheese','honey','b_ok','b_undo','b_home','b_sound','b_up','b_down','b_grab','b_boost','lock','b_zoom','board','bubble','tile','dial','tube','logo','rotate','sc_stand','sc_beam','sc_pan','shadow'].forEach(n=>img(n,'assets/ui/'+n+'.png'));
const FONT='FairyLogo, Georgia, serif',BODY='Pangolin, "Comic Sans MS", sans-serif',NUM='NunitoLogo, Arial Black, sans-serif';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a),ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3),lerp=(a,b,t)=>a+(b-a)*t;
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
// ---- десятичные: всё в сотых (целые числа), без ошибок плавающей точки ----
function dec(h,keep){// h — сотые; keep — сколько знаков после запятой показывать (по умолчанию минимум нужных)
 const neg=h<0;h=Math.abs(Math.round(h));const i=Math.floor(h/100),f=h%100;let s;
 if(keep===2)s=i+','+String(f).padStart(2,'0');else if(keep===1)s=i+','+Math.round(f/10);else if(f===0)s=String(i);else if(f%10===0)s=i+','+(f/10);else s=i+','+String(f).padStart(2,'0');return(neg?'−':'')+s}
// ---- сохранение ----
let SV;try{SV=JSON.parse(localStorage.getItem('gonka81'))}catch(e){}
if(!SV||!SV.stars)SV={stars:[0,0,0,0,0],secret:[0,0,0,0,0],open:1,intro:0};
function save(){try{localStorage.setItem('gonka81',JSON.stringify(SV))}catch(e){}}
// ---- звук ----
var AC=null;function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
function tone(f,d,type,v,when,slide){const a=ac();if(!a||G.mute)return;const t=a.currentTime+(when||0),o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v||.1,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.05)}
function noise(d,v,fq,when){const a=ac();if(!a||G.mute)return;const b=a.createBuffer(1,Math.floor(a.sampleRate*d),a.sampleRate),ch=b.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=(Math.random()*2-1)*(1-i/ch.length);const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=fq;const g=a.createGain();g.gain.value=v;s.connect(f).connect(g).connect(a.destination);s.start(a.currentTime+(when||0))}
const SFX={ok(){[1046,1318,1568,2093].forEach((f,i)=>tone(f,.5,'sine',.08,i*.07))},bad(){tone(300,.22,'triangle',.08,0,220);tone(240,.25,'triangle',.06,.1,180)},
 click(){tone(1300,.05,'square',.03)},pop(){tone(600,.12,'sine',.1,0,1200)},clink(){tone(2400,.25,'triangle',.06);tone(3100,.3,'sine',.04,.03)},
 whoosh(){noise(.45,.2,700)},splash(){noise(.4,.2,1000)},star(){[1568,2093,2637,3136].forEach((f,i)=>tone(f,.6,'sine',.07,i*.12))},
 boost(){tone(300,.6,'sawtooth',.05,0,1200);noise(.6,.12,1800)},bump(){noise(.2,.4,300);tone(110,.2,'square',.06,0,60)},coin(){tone(1975,.08,'square',.04);tone(2637,.25,'square',.04,.07)},
 pour(){noise(.7,.15,500)},blip(){tone(880,.06,'sine',.06)}};
// мотор картинга — непрерывный тон
let ENG=null;function engine(on,sp){const a=ac();if(!a)return;if(on&&!ENG&&!G.mute){const o=a.createOscillator(),o2=a.createOscillator(),g=a.createGain(),f=a.createBiquadFilter();o.type='sawtooth';o2.type='square';f.type='lowpass';f.frequency.value=700;g.gain.value=0.025;o.connect(f);o2.connect(f);f.connect(g).connect(a.destination);o.start();o2.start();ENG={o,o2,g}}
 if(ENG){if(!on||G.mute){try{ENG.o.stop();ENG.o2.stop()}catch(e){}ENG=null;return}const fq=60+sp*110;ENG.o.frequency.setTargetAtTime(fq,a.currentTime,.05);ENG.o2.frequency.setTargetAtTime(fq*.5,a.currentTime,.05)}}
// ---- голос и реплики; корутины уровня обрываются при смене сцены (GEN) ----
const G={_busy:0,fast:false,mute:false};let talk=null,skipTalk=null,GEN=0;
const STALE={stale:1};
function ctxNow(){return{gen:GEN}}
function alive(c){return c.gen===GEN}
function wait(ms){const c=ctxNow();return new Promise((r,j)=>setTimeout(()=>alive(c)?r():j(STALE),G.fast?Math.min(ms,30):ms))}
let SAYID=0,SAYQ=Promise.resolve(),SAYEP=0;
function stopTalk(){SAYEP++;if(skipTalk)skipTalk();talk=null}
function say(k){const ep=SAYEP,c=ctxNow();const p=SAYQ.then(()=>ep===SAYEP&&alive(c)?say1(k):null);SAYQ=p.catch(()=>{});return p.then(v=>{if(!alive(c))throw STALE;return v})}
// перебить текущую реплику новой (подсказка после ошибки звучит сразу)
function sayNow(k){stopTalk();return say(k).catch(()=>{})}
async function say1(k){const l=LINES[k];if(!l)return;const id=++SAYID;talk={who:l.who,text:l.t,k,t0:T,id};
 if(G.fast){await new Promise(r=>setTimeout(r,40));if(talk&&talk.id===id)talk=null;return}
 const v=typeof VOICE!=='undefined'&&VOICE[k];const dur=Math.max(2000,l.t.length*70);
 await new Promise(async res=>{let done=false,a=null;const fin=()=>{if(!done){done=true;if(a){try{a.pause()}catch(e){}}if(skipTalk===sk)skipTalk=null;res()}};const sk=()=>fin();skipTalk=sk;setTimeout(fin,((v&&v[1])||0)*1000+dur+4000);
  if(v&&!G.mute){a=new Audio('assets/voice/'+v[0]);a.onended=()=>setTimeout(fin,300);a.onerror=()=>setTimeout(fin,dur);let ok=true;try{await a.play()}catch(e){ok=false}
   if(done)return;if(ok)setTimeout(fin,(v[1]+2.5)*1000);else setTimeout(fin,dur)}else setTimeout(fin,dur)});
 if(talk&&talk.id===id)talk=null}
async function run(fn){G._busy++;try{await fn()}catch(e){if(e!==STALE)console.error(e)}finally{G._busy--}}
// ---- частицы ----
const PS=[];
function burst(x,y,n,kind,hue,sp){sp=sp||1;for(let i=0;i<n;i++){const a=Math.random()*6.283,v=rnd(80,420)*sp;PS.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(kind==='conf'?220:0),life:1,dec:rnd(.5,1.1),kind,hue:hue==null?rnd(0,360):hue+rnd(-15,15),s:kind==='conf'?rnd(7,13):rnd(3,7),rot:rnd(0,6),vr:rnd(-10,10)})}}
function bubbles(x,y,n){for(let i=0;i<n;i++)PS.push({x:x+rnd(-20,20),y:y+rnd(-10,10),vx:rnd(-20,20),vy:rnd(-160,-60),life:1,dec:rnd(.5,.9),kind:'bub',hue:190,s:rnd(3,8),rot:0,vr:0})}
function stepParticles(){for(let i=PS.length-1;i>=0;i--){const p=PS[i];p.life-=p.dec*DT;if(p.life<=0){PS.splice(i,1);continue}
 if(p.kind==='conf'){p.vy+=700*DT;p.vx*=.99}else if(p.kind==='spark'){p.vx*=.95;p.vy*=.95}else if(p.kind==='bub'){p.vx+=Math.sin(T*5+p.y)*30*DT}p.x+=p.vx*DT;p.y+=p.vy*DT;p.rot+=p.vr*DT}}
function drawParticles(){for(const p of PS){X.globalAlpha=clamp(p.life*1.4,0,1);
 if(p.kind==='conf'){X.save();X.translate(p.x,p.y);X.rotate(p.rot);X.fillStyle=`hsl(${p.hue},90%,60%)`;X.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);X.restore()}
 else if(p.kind==='bub'){X.strokeStyle='rgba(220,250,255,.85)';X.lineWidth=1.6;X.beginPath();X.arc(p.x,p.y,p.s,0,7);X.stroke()}
 else{X.fillStyle=`hsl(${p.hue},100%,${p.kind==='spark'?70:62}%)`;X.beginPath();X.arc(p.x,p.y,p.s,0,7);X.fill()}}X.globalAlpha=1}
// ---- видимая область и фон ----
function vis(){return{x0:-OX/S,y0:-OY/S,w:W/S,h:H/S}}
function safeL(){return vis().x0+Math.max(SAFE.l/S,0)+14}function safeR(){return vis().x0+vis().w-Math.max(SAFE.r/S,0)-14}
function safeT(){return vis().y0+SAFE.t/S+8}function safeB(){return vis().y0+vis().h-SAFE.b/S}
function bgScale(){const v=vis();return Math.max(v.w/1280,v.h/720)}
function bgY0(){const v=vis();return v.y0+v.h-720*bgScale()}
function bgX0(){return 640-640*bgScale()}
function bgXY(px,py){const s=bgScale();return[bgX0()+px*s,bgY0()+py*s]}
// линия земли (y в пикселях фона 1280x720) — герои стоят на ней
const GROUND={title:690,map:716,workshop:690,market:690,launch:680,race:716,sea:716,fin:690};let BGN='title',GND=[];
function gY(n){return bgY0()+(GROUND[n||BGN]||700)*bgScale()}
function bgDraw(n,dim,ox){const v=vis(),s=bgScale();BGN=n;const b=IM['bg_'+n];
 if(okI(b))X.drawImage(b,bgX0()+(ox||0),bgY0(),1280*s,720*s);
 if(dim){X.fillStyle=`rgba(8,10,30,${dim})`;X.fillRect(v.x0,v.y0,v.w,v.h)}}
// ---- текст: всё вписывается в свой нарисованный предмет ----
function wrap(t,maxW){const ws=String(t).split(' '),out=[];let cur='';for(const w of ws){const s=cur?cur+' '+w:w;if(X.measureText(s).width>maxW&&cur){out.push(cur);cur=w}else cur=s}if(cur)out.push(cur);return out}
function fitText(t,w,h,maxS,font,minS){font=font||BODY;minS=minS||16;for(let s=maxS;s>=minS;s-=2){X.font=s+'px '+font;const L=wrap(t,w);const lh=s*1.16;if(L.length*lh<=h&&L.every(l=>X.measureText(l).width<=w))return{s,L,lh}}X.font=minS+'px '+font;return{s:minS,L:wrap(t,w),lh:minS*1.16}}
let AUD=null;// аудит текста: каждая надпись регистрирует свой прямоугольник и рамку-контейнер
let BASE=null;function mapBox(b){if(!b||!BASE)return b;const m=BASE.inverse().multiply(X.getTransform());if(m.isIdentity)return b;const P=[[b[0],b[1]],[b[2],b[1]],[b[0],b[3]],[b[2],b[3]]].map(([x,y])=>m.transformPoint(new DOMPoint(x,y)));const xs=P.map(p=>p.x),ys=P.map(p=>p.y);return[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]}
function regText(b,box,id,t,size){if(AUD){const m=BASE?BASE.inverse().multiply(X.getTransform()):null;const k=m?Math.hypot(m.a,m.b):1;AUD.t.push({id:id||'',b:mapBox(b),box:mapBox(box),t:String(t||''),css:(size||0)*k*S})}}
function txt(t,x,y,size,col,o){o=o||{};X.font=size+'px '+(o.f||FONT);X.textAlign=o.al||'center';X.textBaseline='middle';
 if(o.st!==0){X.lineJoin='round';X.lineWidth=o.lw||Math.max(3,size*.16);X.strokeStyle=o.st||'rgba(40,16,4,.9)';X.strokeText(t,x,y)}X.fillStyle=col||'#fff';X.fillText(t,x,y);
 if(AUD&&o.box!==undefined){const w=X.measureText(t).width;const x0=o.al==='left'?x:o.al==='right'?x-w:x-w/2;regText([x0,y-size*.55,x0+w,y+size*.55],o.box,o.id,t,size)}}
// текст в рамке: автоподбор размера
function textIn(t,x,y,w,h,maxS,col,o){o=o||{};const f=fitText(t,w,h,maxS,o.f||BODY,o.min);const y0=y-(f.L.length-1)*f.lh/2;
 f.L.forEach((l,i)=>txt(l,x,y0+i*f.lh,f.s,col,{f:o.f||BODY,st:o.st,lw:o.lw,box:[x-w/2,y-h/2,x+w/2,y+h/2],id:o.id}));return f}
function spr(n,x,y,h,o){const i=IM[n];if(!okI(i))return 0;o=o||{};const w=h*i.naturalWidth/i.naturalHeight;X.save();X.translate(x,y);if(o.rot)X.rotate(o.rot);if(o.flip)X.scale(-1,1);if(o.a!=null)X.globalAlpha=o.a;
 const ax=o.ax==null?.5:o.ax,ay=o.ay==null?.5:o.ay;X.drawImage(i,-w*ax,-h*ay,w,h);X.restore();return w}
function sprW(n,x,y,w,o){const i=IM[n];if(!okI(i))return 0;return spr(n,x,y,w*i.naturalHeight/i.naturalWidth,o)}
function aspect(n){const i=IM[n];return okI(i)?i.naturalWidth/i.naturalHeight:1}
// ---- кнопки: хит-зона >= 56 css px ----
let UI=[];
function btn(id,im,x,y,d,fn,o){o=o||{};UI.push({id,x,y,w:d,h:d,fn,dis:o.dis,always:o.always});const hov=Math.hypot(PX-x,PY-y)<d/2;const k=(hov?1.06:1)*(1+(o.pulse?Math.sin(T*5)*.05:0));
 X.save();X.translate(x,y);X.scale(k,k);if(o.dis)X.globalAlpha=.45;if(o.rot)X.rotate(o.rot);sprW(im,0,0,d);X.restore()}
// кнопка-доска с надписью
function boardBtn(id,x,y,w,label,fn,o){o=o||{};const h=w/aspect('board');UI.push({id,x,y,w,h,fn,dis:o.dis});const hov=Math.abs(PX-x)<w/2&&Math.abs(PY-y)<h/2;const k=(hov?1.04:1)*(1+(o.pulse?Math.sin(T*4)*.03:0));
 X.save();X.translate(x,y);X.scale(k,k);sprW('board',0,0,w);X.shadowColor='transparent';X.restore();
 X.save();X.translate(x,y);X.scale(k,k);textIn(label,0,0,w*.78,h*.56,o.size||60,'#5a2a0a',{f:FONT,st:'rgba(255,245,220,.9)',lw:6,id});X.restore()}
// ---- герои: позы, дыхание (только равномерный масштаб), прыжки на землю, взгляд на ребёнка ----
let cast=[];
const HEROH={tina:430,sotik:420,zap:250,lastik:430};
const NAMES={tina:'Тина',sotik:'Сотик',zap:'Запятуля',lastik:'Ластик',narrator:''};
function hero(n,x,o){o=o||{};return Object.assign({n,x,pose:'',h:HEROH[n]||400,jump:0,wob:0,flip:false,ph:Math.random()*6},o)}
function pose(n,p,dur){const c=cast.find(c=>c.n===n);if(c){c.pose=p;c.poseT=dur?T+dur:0;c.pf=T}}
function cheer(){cast.forEach((c,i)=>{c.jump=T+i*.1;if(IM[c.n+'_cheer'])pose(c.n,'cheer',1.6)});SFX.ok()}
function hop(n){const c=cast.find(c=>c.n===n);if(c)c.jump=T}
function oops(n){const c=cast.find(c=>c.n===n);if(c)c.wob=T}
function spriteOf(c){if(c.poseT&&T>c.poseT){c.pose='';c.poseT=0}const k=c.pose?c.n+'_'+c.pose:c.n;return okI(IM[k])?k:c.n}
function drawHero(c){const k=spriteOf(c),im=IM[k];if(!okI(im))return;const h=c.h*(c.k||1),w=h*im.naturalWidth/im.naturalHeight;
 const talking=talk&&talk.who===c.n;const br=1+Math.sin(T*2.1+c.ph)*.007;let dy=0,rot=Math.sin(T*1.2+c.ph)*.012;
 if(talking)dy-=Math.abs(Math.sin((T-talk.t0)*4.2))*5;// говорит — лёгкое покачивание
 if(c.jump&&T>c.jump&&T-c.jump<.7){const u=(T-c.jump)/.7;dy-=Math.sin(u*Math.PI)*60}
 if(c.wob&&T-c.wob<.9){rot+=Math.sin((T-c.wob)*18)*.05*(1-(T-c.wob)/.9)}
 const y=c.y;GND.push({n:c.n,hero:1,x:c.x,feet:y,gl:y,w:w*br,h:h*br,ar:im.naturalWidth/im.naturalHeight,src:k});
 X.save();X.translate(c.x,y);const sh=IM.shadow;if(okI(sh)){X.globalAlpha=.5*(1-Math.min(.5,-dy/120));X.drawImage(sh,-w*.42,-w*.05,w*.84,w*.11);X.globalAlpha=1}
 X.translate(0,dy);X.rotate(rot);X.scale(br*(c.flip?-1:1),br);
 const pf=c.pf&&T-c.pf<.18?(T-c.pf)/.18:1;X.globalAlpha=pf<1?.6+.4*pf:1;X.drawImage(im,-w/2,-h,w,h);X.globalAlpha=1;X.restore();
 if(AUD)AUD.h.push({n:c.n,b:[c.x-w/2,y-h+dy,c.x+w/2,y+dy]})}
function heroX(c){const i=IM[spriteOf(c)];const w=okI(i)?c.h*(c.k||1)*i.naturalWidth/i.naturalHeight:c.h*.5;return w}
function drawCast(){const v=vis();cast.forEach(c=>{c.y=c.gy!=null?c.gy:gY();const hw=heroX(c)/2;c.dx=clamp(c.x,safeL()+hw,safeR()-hw)});
 cast.forEach(c=>{const ox=c.x;c.x=c.dx;drawHero(c);c.x=ox})}
// якоря героев по краям видимой области
const LEFT=k=>safeL()+(k||0),RIGHT=k=>safeR()-(k||0);
// ---- облачко речи у говорящего героя; иначе — доска с заданием ----
let GOAL='';
function talkerX(){if(!talk)return 640;const c=cast.find(c=>c.n===talk.who);return c?c.dx:null}
function drawTalk(){const v=vis();const top=safeT();
 if(talk&&talk.text){const tx=talkerX();let bw=Math.min(700,v.w*.5),bh=200,top=safeT();{const mx=Math.min(900,v.w*.66,safeR()-safeL()-130);for(let k=0;k<12;k++){const f=fitText(talk.text,bw*.84,bh*.6,46,BODY,44);if(f.L.length*f.lh<=bh*.6&&f.L.every(l=>X.measureText(l).width<=bw*.84))break;if(bw<mx)bw=Math.min(mx,bw+50);else if(bh<270)bh+=25;else break}}let bx=tx==null?640:clamp(tx+(tx<640?bw*.42:-bw*.42),safeL()+110+bw/2,safeR()-bw/2);if(SCN&&SCN.bubbleX)bx=SCN.bubbleX(bw,tx);if(SCN&&SCN.bubble){const o=SCN.bubble(bw,tx);bx=o.x;top=o.top;bw=Math.max(o.w||0,bw)}
  const flip=tx!=null&&tx>bx;X.save();X.translate(bx,top+bh/2);X.scale(flip?-1:1,1);const bi=IM.bubble;if(okI(bi))X.drawImage(bi,-bw/2,-bh/2,bw,bh);X.restore();
  // внутренняя область облачка (без хвостика)
  const iw=bw*.84,ih=bh*.6,cy=top+bh*.4;const nm=NAMES[talk.who];if(nm)txt(nm,bx-bw*.36,top+bh*.05,30,'#fff',{f:FONT,al:'left',st:'#2a7a7a',lw:6,box:[bx-bw/2,top-30,bx+bw/2,top+bh],id:'name'});
  textIn(talk.text,bx,cy+6,iw,ih,46,'#2b2440',{f:BODY,st:0,id:'talk',min:44});talk.box=[bx-bw/2,top,bw,bh*.8];return}
 if(GOAL){const bw=Math.min(860,v.w*.62),bh=bw/aspect('board');const bx=SCN&&SCN.goalX?SCN.goalX():640;const top=SCN&&SCN.goalTop?SCN.goalTop(bh):safeT();X.save();sprW('board',bx,top+bh/2,bw);X.restore();
  textIn(GOAL,bx,top+bh/2,bw*.84,bh*.56,46,'#4a2208',{f:BODY,st:'rgba(255,248,230,.8)',lw:4,id:'goal'})}}
// ---- сцены ----
const SC={};let scene='load',SCN=null,ZS=null;
function go(n,arg){GEN++;scene=n;SCN=SC[n];fade=1;stopTalk();PS.length=0;GOAL='';cast=[];ZS=null;engine(false);SCN.enter&&SCN.enter(arg)}
// ввод блокируется только во время победной сцены (ZS.lock); голос не мешает играть
function locked(){return!!(ZS&&ZS.lock)}
G.locked=locked;let _lastTap={t:0,x:-99,y:-99};const PTR=new Map();
function toD(e){return[(e.clientX-VVX-OX)/S,(e.clientY-VVY-OY)/S]}
C.addEventListener('pointerdown',e=>{if(PORTRAIT())return;e.preventDefault();ac();const[x,y]=toD(e);PX=x;PY=y;PTR.set(e.pointerId,{x,y,t0:T});
 if(SCN&&SCN.hold)SCN.hold(e.pointerId,x,y);
 const now=performance.now();if(now-_lastTap.t<170&&Math.hypot(e.clientX-_lastTap.x,e.clientY-_lastTap.y)<24)return;_lastTap={t:now,x:e.clientX,y:e.clientY};
 const mh=28/S;let best=null,bd=1e9;
 for(let i=UI.length-1;i>=0;i--){const b=UI[i];const dx=Math.abs(x-b.x),dy=Math.abs(y-b.y);if(dx<Math.max(b.w/2+6,mh)&&dy<Math.max(b.h/2+6,mh)){const inside=dx<b.w/2+6&&dy<b.h/2+6;const d=(inside?0:1e5)+Math.hypot(dx,dy);if(d<bd){bd=d;best=b}}}
 if(best){const b=best;if(b.dis)return;if(locked()&&!b.always)return;SFX.click();b.fn();return}
 if(talk&&talk.box&&skipTalk){const[bx,by,bw,bh]=talk.box;if(x>bx&&x<bx+bw&&y>by&&y<by+bh){skipTalk();return}}
 if(locked())return;if(SCN&&SCN.tap)SCN.tap(x,y)},{passive:false});
C.addEventListener('pointermove',e=>{const[x,y]=toD(e);PX=x;PY=y;if(PTR.has(e.pointerId)){PTR.get(e.pointerId).x=x;PTR.get(e.pointerId).y=y}if(SCN&&SCN.move)SCN.move(e.pointerId,x,y)});
const _up=e=>{PTR.delete(e.pointerId);if(SCN&&SCN.up)SCN.up(e.pointerId)};C.addEventListener('pointerup',_up);C.addEventListener('pointercancel',_up);C.addEventListener('pointerleave',_up);
['dblclick','contextmenu','gesturestart','gesturechange'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault(),{passive:false}));
document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
const KEYS={};addEventListener('keydown',e=>{KEYS[e.key]=1});addEventListener('keyup',e=>{KEYS[e.key]=0});
let last=performance.now(),fpsA=60;
const TOUCH=(('ontouchstart' in window)||navigator.maxTouchPoints>0)&&matchMedia('(pointer:coarse)').matches;const PORTRAIT=()=>TOUCH&&H>W*1.05;
function loop(now){DT=PORTRAIT()?0:clamp((now-last)/1000,0,.05);last=now;T+=DT;fpsA=fpsA*.95+(1/Math.max(DT,.001))*.05;
 X.setTransform(DPR,0,0,DPR,0,0);X.clearRect(0,0,W,H);
 const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;shake*=Math.pow(.004,DT);if(shake<.3)shake=0;
 X.setTransform(DPR*S,0,0,DPR*S,DPR*(OX+sx),DPR*(OY+sy));BASE=X.getTransform();UI=[];GND=[];if(G.auditReq){G.auditReq=0;AUD={t:[],h:[]};}else AUD=null;stepParticles();
 if(!PORTRAIT()){try{SCN&&SCN.draw()}catch(e){console.error(e)}
 drawParticles();try{if(SCN&&SCN.ui)SCN.ui()}catch(e){console.error(e)}if(scene!=='load'&&scene!=='title')homeBtn();drawTalk();if(AUD)G._aud=AUD}
 if(fade>0){const v=vis();X.fillStyle=`rgba(10,8,24,${fade})`;X.fillRect(v.x0,v.y0,v.w,v.h);fade=Math.max(0,fade-DT*2.6)}
 if(PORTRAIT())drawRotate();
 requestAnimationFrame(loop)}
function homeBtn(){if(scene==='map'){btn('home','b_home',safeL()+44,safeT()+42,88,()=>go('title'),{always:1});return}btn('home','b_home',safeL()+44,safeT()+42,88,()=>go('map'),{always:1})}
// поверни телефон: нарисованная рука с телефоном на размытой игровой сцене
let rotT=0;function drawRotate(){rotT+=1/60;X.setTransform(DPR,0,0,DPR,0,0);const tb=IM.bg_title;if(okI(tb)){const k=Math.max(W/tb.naturalWidth,H/tb.naturalHeight)*1.06;X.save();X.filter='blur(4px) brightness(.85)';X.drawImage(tb,W/2-tb.naturalWidth*k/2+Math.sin(rotT*.3)*W*.02,H/2-tb.naturalHeight*k/2,tb.naturalWidth*k,tb.naturalHeight*k);X.restore()}
 const r=IM.rotate,d=Math.min(W*.8,H*.5);if(okI(r)){X.save();X.translate(W/2,H*.42);X.rotate(Math.sin(rotT*2)*.08);const w=d,h=d/aspect('rotate');X.drawImage(r,-w/2,-h/2,w,h);X.restore()}
 const bw=Math.min(W*.9,520),bh=bw/aspect('board');X.save();X.translate(W/2,H*.42+d/aspect('rotate')/2+bh*.7);sprW('board',0,0,bw);const fs=bw*.09;X.font=fs+'px '+FONT;X.textAlign='center';X.textBaseline='middle';X.lineWidth=5;X.strokeStyle='rgba(255,245,220,.9)';X.strokeText('Поверни телефон',0,0);X.fillStyle='#5a2a0a';X.fillText('Поверни телефон',0,0);X.restore()}
// тестовый интерфейс
Object.defineProperty(G,'scene',{get:()=>scene});G.go=(n,a)=>go(n,a);G.S=()=>SV;G.pg=(x,y)=>({x:OX+x*S+VVX,y:OY+y*S+VVY});G.btns=()=>UI.map(b=>({id:b.id,x:b.x,y:b.y,w:b.w,h:b.h,dis:!!b.dis}));G.fps=()=>fpsA;G.gnd=()=>({S,v:vis(),scene,items:GND,ground:gY()});
G.Z=()=>ZS;G.talk=()=>talk;
function loadFrac(){const n=LOADQ.filter(i=>i.src).length||1,d=LOADQ.filter(i=>i.src&&(i.complete)).length;return Math.min(1,d/n)}
SC.load={draw(){const v=vis();X.fillStyle='#2a6fb0';X.fillRect(v.x0,v.y0,v.w,v.h);const tb=IM.bg_title;if(okI(tb)){X.globalAlpha=.6;bgDraw('title');X.globalAlpha=1}
 const f=loadFrac(),fs=64;X.font=fs+'px '+(FONTOK?FONT:'serif');X.textAlign='center';X.textBaseline='middle';X.lineWidth=10;X.strokeStyle='#5a1a0a';X.fillStyle='#fff3d6';X.strokeText('Гонка за сотыми',640,300);X.fillText('Гонка за сотыми',640,300);
 const bw=Math.min(700,v.w-80),bh=30,bx=640-bw/2,by=390;X.fillStyle='rgba(40,20,8,.6)';X.beginPath();X.roundRect(bx-5,by-5,bw+10,bh+10,(bh+10)/2);X.fill();X.fillStyle='#ffcf4a';X.beginPath();X.roundRect(bx,by,Math.max(bh,bw*f),bh,bh/2);X.fill()}};
function startGame(){scene='load';SCN=SC.load;fade=0;requestAnimationFrame(loop);
 (document.fonts&&document.fonts.load?Promise.race([Promise.all([document.fonts.load('40px FairyLogo'),document.fonts.load('40px Pangolin'),document.fonts.load('900 40px NunitoLogo')]),new Promise(r=>setTimeout(r,6000))]):Promise.resolve()).then(()=>{FONTOK=true});
 const chk=()=>{const t=performance.now()-LOADT0;if((loadFrac()>=1&&FONTOK&&t>400)||t>25000){LOADED=true;go('title')}else setTimeout(chk,100)};chk()}
