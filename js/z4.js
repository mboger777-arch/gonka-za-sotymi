'use strict';
// ===== Зона 4: Подводная лодка — глубиномер 0..3 м, жемчужины на нужных отметках =====
const Z4O=[30,75,150,205,250,275],Z4T=[{t:75,k:'s_t075'},{t:150,k:'s_t15'},{t:205,k:'s_t205'},{t:275,k:'s_t275'}];
function z4geo(){const v=vis();const yTop=v.y0+262,yBot=gY('sea')-60;const gx=safeR()-70;const ox=bgXY(430,0)[0];return{yTop,yBot,gx,ox,sx:ox+260}}
function z4y(d){const g=z4geo();return g.yTop+d/300*(g.yBot-g.yTop)}
SC.z4={goalTop(bh){return ZS&&ZS.d<120?safeB()-bh-6:safeT()},goalX(){return ZS&&ZS.d<120?clamp(z4geo().sx-60,safeL()+430,safeR()-690):640},bubble(bw){// на мелководье облачко внизу, чтобы не закрывать Запятулю на рубке
  return ZS&&ZS.d<120?{x:clamp(z4geo().sx-60,safeL()+bw/2,safeR()-bw/2-260),top:safeB()-215,w:bw}:{x:640,top:safeT(),w:bw}},
 enter(){zoneStart(4,{d:0,td:0,i:0,got:[],open:{},grab:-9,hold:0,ht:0});BGN='sea';this.task(0);run(async()=>{await wait(300);await say('s1');await say('s2');await say(Z4T[0].k)})},
 task(i){ZS.i=i;GOAL='Опустись на '+dec(Z4T[i].t)+' м и хватай!'},
 move(dir){const z=ZS;z.td=clamp(z.td+dir*5,0,300);SFX.blip()},
 up(){ZS.hold=0},
 setDepth(y){const g=z4geo();const d=clamp(Math.round((y-g.yTop)/(g.yBot-g.yTop)*300/5)*5,0,300);ZS.td=d;SFX.blip()},
 grabNow(){const z=ZS;if(z.lock)return;if(Math.abs(z.d-z.td)>.5)return;z.grab=T;SFX.whoosh();const d=z.td,t=Z4T[z.i].t;
  if(Z4O.includes(d))z.open[d]=T;
  setTimeout(()=>{if(ZS!==z)return;if(d===t){z.got.push(d);z.lock=true;SFX.star();const p=[z4geo().ox,z4y(d)];burst(p[0],p[1],30,'spark',190);
    run(async()=>{await say('s_ok');z.lock=false;if(z.i+1<Z4T.length){SC.z4.task(z.i+1);await say(Z4T[z.i].k)}else{GOAL='';winZone('s_win')}})}
   else{mistake();sayNow(d<t?'s_deeper':'s_higher')}},G.fast?20:500)},
 tap(x,y){const g=z4geo();if(Math.abs(x-g.gx)<90&&y>g.yTop-30&&y<g.yBot+30)this.setDepth(y)},
 draw(){const z=ZS,g=z4geo(),v=vis();bgDraw('sea2');BGN='sea';drawSecret('z4');
  if(z.hold&&T>z.ht){z.ht=T+.16;this.move(z.hold)}
  const sp=G.fast?400:55;if(Math.abs(z.td-z.d)>.01){z.d+=clamp(z.td-z.d,-sp*DT,sp*DT);if(Math.random()<.4)bubbles(g.sx+120,z4y(z.d)-10,1)}
  // устрицы на уступах скалы
  for(const[k,d]of Z4O.entries()){const y=z4y(d),got=z.got.includes(d),op=z.open[d]&&T-z.open[d]<1.6;spr(got||op?'oyster_open':'oyster',g.ox+(k%2?-46:0),y+16,58,{ay:1});
   if(got){}else if(op&&d===Z4T[z.i].t){}}
  // лодка
  const sy=z4y(z.d)+Math.sin(T*1.6)*3,sh=180;
  // Запятуля стоит на люке рубки и смотрит на ребёнка (ноги на палубе)
  {const sw=sh*aspect('sub'),deck=sy-sh/2+sh*.035,zx=g.sx-sw*.06,zh=150*(1+Math.sin(T*2.2)*.012);
   const zn=(T-z.grab)<1.2?'zap_wave':'zap';spr(zn,zx,deck+1,zh,{ay:1});GND.push({n:'zap',hero:1,x:zx,feet:deck,gl:deck,w:zh*aspect(zn),h:zh,ar:aspect(zn),src:zn})}
  spr('sub',g.sx,sy,sh,{flip:true});
  // клешня
  const gu=clamp((T-z.grab)/.5,0,1);if(gu<1){const ext=Math.sin(gu*Math.PI)*(g.sx-g.ox-90);X.save();X.strokeStyle='#8a6a2a';X.lineWidth=8;X.lineCap='round';X.beginPath();X.moveTo(g.sx-110,sy+20);X.lineTo(g.sx-110-ext,sy+20);X.stroke();X.restore();spr('b_grab',g.sx-110-ext,sy+20,46)}
  // табличка глубины над лодкой
  const bw=230,bh=bw/aspect('board'),by=Math.min(sy+sh/2+bh/2+2,safeB()-bh/2-4);sprW('board',g.sx,by,bw);txt(dec(Math.round(z.d/5)*5)+' м',g.sx,by+2,46,'#3a1c08',{f:NUM,st:0,box:[g.sx-bw*.42,by-bh*.3,g.sx+bw*.42,by+bh*.3],id:'depth'});
  // глубиномер
  const th=g.yBot-g.yTop+90;spr('tube',g.gx,(g.yTop+g.yBot)/2,th);
  for(let d=0;d<=300;d+=10){const y=z4y(d),maj=d%50===0;X.strokeStyle=maj?'#1a2a4a':'rgba(26,42,74,.7)';X.lineWidth=maj?4:2;X.beginPath();X.moveTo(g.gx-(maj?18:10),y);X.lineTo(g.gx+(maj?18:10),y);X.stroke();
   if(maj)txt(dec(d),g.gx-92,y,46,'#fff',{f:NUM,st:'#0a2a4a',lw:7,box:null})}
  const my=z4y(z.d);X.fillStyle='rgba(255,90,40,.9)';X.fillRect(g.gx-20,my-3,40,6);
  // жемчужины
  for(let i=0;i<4;i++){const x=safeL()+50+i*64,y=safeB()-40;X.globalAlpha=i<z.got.length?1:.35;spr('oyster_open',x,y,56);X.globalAlpha=1}},
 ui(){const z=ZS,g=z4geo();const bx=g.gx-190,my=(g.yTop+g.yBot)/2;
  btn('up','b_up',bx,my-120,104,()=>{SC.z4.move(-1);z.hold=-1;z.ht=T+.4});btn('down','b_down',bx,my+10,104,()=>{SC.z4.move(1);z.hold=1;z.ht=T+.4});
  btn('grab','b_grab',bx,my+150,120,()=>SC.z4.grabNow(),{pulse:z.td===Z4T[z.i].t&&Math.abs(z.d-z.td)<.5})}};
G.taps4=ok=>{const z=ZS,t=Z4T[z.i].t,d=ok?t:(t>=150?t-25:t+25);const b=id=>{const q=UI.find(u=>u.id===id);return q?[q.x,q.y]:null};const g=z4geo();return[[g.gx,z4y(d)],'wait',b('grab')]};
