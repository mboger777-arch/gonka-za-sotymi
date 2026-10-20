'use strict';
// ===== титул, вступление, карта, секреты, общая рамка зон =====
const ZONES=[{n:1,sc:'z1',name:'Мастерская',pos:[178,150]},{n:2,sc:'z2',name:'Рынок',pos:[505,150]},{n:3,sc:'z3',name:'Гонка',pos:[770,300]},{n:4,sc:'z4',name:'Глубина',pos:[985,520]},{n:5,sc:'z5',name:'Ракета',pos:[1140,140]}];
// секретные запятые: по одной в каждой зоне (координаты фона 1280x720)
const SECRETS={z1:[1185,205],z2:[905,120],z3:[0,0],z4:[1180,300],z5:[160,420]};
function secretIdx(sc){return{z1:0,z2:1,z3:2,z4:3,z5:4}[sc]}
function drawSecret(sc,xy){const i=secretIdx(sc);if(i==null||SV.secret[i])return;const[x,y]=xy||bgXY(...SECRETS[sc]);const k=1+Math.sin(T*3)*.08;
 X.save();X.globalAlpha=.75+Math.sin(T*2.3)*.2;spr('comma',x,y,58*k,{rot:Math.sin(T*1.7)*.2});X.restore();
 UI.push({id:'secret',x,y,w:70,h:70,fn:()=>gotSecret(sc,x,y),always:1})}
function gotSecret(sc,x,y){const i=secretIdx(sc);if(SV.secret[i])return;SV.secret[i]=1;save();SFX.star();burst(x,y,40,'spark',48,1.2);
 const all=SV.secret.every(v=>v);sayNow(all?'sec_all':'sec');hop('zap')}
// звёзды/запятые в углу
function hud(){const v=vis();const x=safeR()-20,y=safeT()+40;const n=SV.secret.filter(v=>v).length;
 spr('comma',x-150,y,58);txt(n+'/5',x-80,y,46,'#fff',{f:NUM,st:'#5a2a0a',lw:8,box:null});}
// ---- общая рамка зоны ----
function zoneStart(n,o){ZS=Object.assign({n,r:0,done:false,lock:false,mist:0,step:0},o||{});return ZS}
function mistake(){ZS.mist++;SFX.bad()}
async function winZone(line){const z=ZS;z.lock=true;cheer();burst(640,300,90,'conf',null,1.4);SFX.star();
 const i=z.n-1;SV.stars[i]=1;SV.open=Math.max(SV.open,Math.min(5,z.n+1));save();
 await say(line);await wait(600);z.done=true;z.lock=false;go('map')}
// ---- титул ----
SC.title={enter(){cast=[hero('tina',0),hero('zap',0),hero('sotik',0)];},
 draw(){bgDraw('title');const v=vis();
  const hw=c=>heroX(c);cast[0].x=safeL()+hw(cast[0])/2;cast[1].x=safeL()+hw(cast[0])+hw(cast[1])/2+6;cast[2].x=safeR()-hw(cast[2])/2;
  drawCast();
  // логотип
  const lw=Math.min(820,v.w*.62),lh=lw/aspect('logo'),ly=safeT()+lh/2+4;X.save();X.translate(640,ly);X.rotate(Math.sin(T*1.1)*.01);sprW('logo',0,0,lw);X.shadowColor='transparent';
  textIn('Гонка за сотыми',0,lh*.02,lw*.56,lh*.3,92,'#fff6dc',{f:FONT,st:'#7a1206',lw:10,id:'logo'});X.restore()},
 ui(){const v=vis();boardBtn('play',640,560,420,'Играть',()=>{if(!SV.intro)go('intro');else go('map')},{pulse:1,size:72});
  btn('sound','b_sound',safeR()-44,safeT()+42,84,()=>{G.mute=!G.mute;if(G.mute)stopTalk()},{always:1});if(G.mute){X.save();X.strokeStyle='#d0202a';X.lineWidth=9;X.lineCap='round';const x=safeR()-44,y=safeT()+42;X.beginPath();X.moveTo(x-30,y-30);X.lineTo(x+30,y+30);X.stroke();X.restore()}}};
// ---- вступление ----
SC.intro={enter(){cast=[hero('tina',0),hero('zap',0),hero('lastik',0,{pose:'laugh'}),hero('sotik',0)];ZS=zoneStart(0);
  run(async()=>{await wait(500);await say('i1');hop('lastik');SFX.whoosh();await say('i2');pose('lastik','laugh');await say('i3');pose('lastik','');
   pose('tina','point');await say('i4');pose('tina','');pose('sotik','thumb');await say('i5');pose('sotik','');pose('zap','wave');await say('i6');pose('zap','');cheer();await say('i7');SV.intro=1;save();go('map')})},
 draw(){bgDraw('title');const hw=c=>heroX(c);const L=safeL(),R=safeR();
  cast[0].x=L+hw(cast[0])/2;cast[1].x=L+hw(cast[0])+hw(cast[1])/2+4;cast[3].x=R-hw(cast[3])/2;cast[2].x=(cast[1].x+hw(cast[1])/2+cast[3].x-hw(cast[3])/2)/2;cast[2].h=400;drawCast()},
 ui(){boardBtn('skip',safeR()-150,safeB()-50,260,'Дальше',()=>{SV.intro=1;save();go('map')},{size:44})}};
// ---- карта: вся карта видна целиком; поля — размытый фон ----
function mapRect(){const v=vis(),k=Math.min(v.w/1280,v.h/720);const w=1280*k,h=720*k;return{x:640-w/2,y:v.y0+v.h-h,k,w,h}}
SC.map={bubble(bw){const w=Math.max(600,bw);return{x:safeL()+heroX(cast[0])+w/2-10,top:safeB()-215,w}},enter(){cast=[hero('tina',0,{h:380}),hero('zap',0,{h:220})];GOAL='';
  run(async()=>{await wait(300);if(SV.stars.every(v=>!v))await say('m1');else if(SV.open>=5&&!SV.stars[4])await say('m_fin')})},
 draw(){const v=vis(),m=mapRect();const b=IM.bg_map;
  if(okI(b)){X.save();X.filter='blur(14px) brightness(.8)';const s=Math.max(v.w/1280,v.h/720)*1.1;X.drawImage(b,640-640*s,v.y0+v.h/2-360*s,1280*s,720*s);X.restore();X.drawImage(b,m.x,m.y,m.w,m.h)}
  BGN='map';for(const c of cast){c.gy=safeB()-4}
  cast[0].x=safeL()+heroX(cast[0])/2;cast[1].x=safeR()-heroX(cast[1])/2;drawCast()},
 ui(){const m=mapRect();hud();
  ZONES.forEach((z,i)=>{const x=m.x+z.pos[0]*m.k,y=m.y+z.pos[1]*m.k,open=SV.open>=z.n,done=SV.stars[i];const d=112,bob=Math.sin(T*2+i)*4;
   btn('zone'+z.n,'tile',x,y+bob,d,()=>{if(!open){sayNow('m_lock');SFX.bad();return}go(z.sc)},{pulse:open&&!done});
   txt(String(z.n),x,y+bob+2,70,open?'#5a2a0a':'#8a7a6a',{f:NUM,st:'rgba(255,246,220,.9)',lw:6,box:[x-d*.4,y+bob-d*.4,x+d*.4,y+bob+d*.4],id:'zn'});
   if(!open)spr('lock',x+38,y+bob+34,56);if(done)spr('star',x+40,y+bob-40,60,{rot:Math.sin(T*2)*.1});
   const lw=250,lh=lw/aspect('board');X.save();sprW('board',x,y+bob+d/2+lh/2-4,lw);X.restore();textIn(z.name,x,y+bob+d/2+lh/2-4,lw*.82,lh*.62,40,'#4a2208',{f:FONT,st:0,id:'zname'})})}};
// ---- финал ----
SC.fin={enter(){cast=[hero('tina',0),hero('zap',0),hero('lastik',0,{pose:'sad',h:390}),hero('sotik',0)];ZS=zoneStart(6,{lock:true});
  run(async()=>{await wait(400);cheer();burst(640,250,120,'conf',null,1.5);await say('f_sorry');cheer();await say('f_end');hop('zap');await say('f_end2');pose('lastik','sad');ZS.lock=false;ZS.done=true})},
 draw(){bgDraw('title');const hw=c=>heroX(c);const L=safeL(),R=safeR();cast[0].x=L+hw(cast[0])/2;cast[1].x=L+hw(cast[0])+hw(cast[1])/2+4;cast[3].x=R-hw(cast[3])/2;cast[2].x=(cast[1].x+hw(cast[1])/2+cast[3].x-hw(cast[3])/2)/2;
  if(Math.random()<.08)burst(rnd(200,1080),rnd(80,250),10,'spark',rnd(30,60),.6);drawCast();
  const n=SV.secret.filter(v=>v).length;const lw=Math.min(720,vis().w*.5),lh=lw/aspect('logo');ZS.la=(ZS.la||0)+((talk?0:1)-(ZS.la||0))*.12;if(ZS.la<.02)return;X.save();X.globalAlpha=ZS.la;X.translate(640,safeT()+lh/2+(1-ZS.la)*-40);sprW('logo',0,0,lw);textIn('Город спасён!',0,lh*.02,lw*.56,lh*.3,80,'#fff6dc',{f:FONT,st:'#7a1206',lw:9,id:'fin'});X.restore()},
 ui(){if(ZS&&ZS.done)boardBtn('again',safeR()-150,safeT()+62,270,'На карту',()=>go('map'),{size:46})}};
