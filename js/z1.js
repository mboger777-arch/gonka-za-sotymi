'use strict';
// ===== Зона 1: Мастерская лупы — линейка 0..1, десятые, сотые (лупа увеличивает) =====
// значения — в сотых (0..100)
const Z1T=[{t:70,m:1,k:'w_t07'},{t:30,m:1,k:'w_t03'},{t:36,m:2,k:'w_t036',pre:'w3'},{t:82,m:2,k:'w_t082'},{t:5,m:2,k:'w_t005'}];
function z1geo(){const tina=cast[0];const x0=safeL()+heroX(tina)+30,x1=safeR()-30;const w=Math.min(1100,x1-x0);const cx=(x0+x1)/2;
 const rh=w/aspect('ruler');const yTop=Math.max(safeT()+330,bgXY(0,392)[1]-rh);// линейка прислонена к верстаку, ниже облачка
 return{cx,w,rh,y:yTop+rh/2,top:yTop,a0:cx-w/2+w*.055,a1:cx+w/2-w*.055}}
function z1x(v){const g=z1geo(),z=ZS;return g.a0+(v-z.a)/(z.b-z.a)*(g.a1-g.a0)}
function z1v(x){const g=z1geo(),z=ZS;return z.a+(x-g.a0)/(g.a1-g.a0)*(z.b-z.a)}
SC.z1={enter(){cast=[hero('tina',0)];const z=zoneStart(1,{a:0,b:100,za:0,zb:100,zt:1,reveal:0,step:-1,zoom:null,zx:0,zap:{v:0,from:0,t0:-9},badge:null});
  run(async()=>{await wait(300);GOAL='Нажми на лупу!';await say('w1')})},
 setRange(a,b){const z=ZS;z.za=z.a;z.zb=z.b;z.ta=a;z.tb=b;z.zt=0},
 next(){const z=ZS;z.step++;z.badge=null;if(z.step>=Z1T.length){GOAL='';winZone('w_win');return}const s=Z1T[z.step];GOAL=(s.m===1?'Прыгни на ':'Найди ')+dec(s.t)+(s.m===2&&z.zoom==null?' — нажми на нужную десятую':'');
  run(async()=>{if(s.pre)await say(s.pre);await say(s.k)})},
 zoomTo(seg){const z=ZS;z.zoom=seg;this.setRange(seg*10,seg*10+10);SFX.whoosh();const s=Z1T[z.step];
  if(Math.floor(s.t/10)!==seg){mistake();sayNow('w_wrongseg');GOAL='Тут числа от '+dec(seg*10)+' до '+dec(seg*10+10)+'. Нажми «назад»'}else{GOAL='Найди '+dec(s.t);if(!z.zoomSaid){z.zoomSaid=1;sayNow('w_zoomed')}}},
 unzoom(){const z=ZS;z.zoom=null;this.setRange(0,100);SFX.whoosh();const s=Z1T[z.step];if(s)GOAL='Найди '+dec(s.t)+' — нажми на нужную десятую';z.zap={v:Math.round(z.zap.v),from:z.zap.v,t0:-9}},
 jump(v){const z=ZS;z.zap={v,from:z.zap.v,t0:T};SFX.pop();hop('tina');const s=Z1T[z.step];
  setTimeout(()=>{if(ZS!==z)return;if(v===s.t){z.badge={v,ok:1};SFX.ok();burst(z1x(v),z1geo().top-120,30,'spark',50);z.lock=true;
    run(async()=>{await say(Math.random()<.5?'w_ok1':'w_ok2');z.lock=false;if(z.zoom!=null)SC.z1.unzoom();await wait(300);SC.z1.next()})}
   else{z.badge={v,ok:0};mistake();sayNow(v<s.t?'w_right':'w_left');}},G.fast?20:480)},
 tap(x,y){const z=ZS,g=z1geo();if(z.step<0||z.lock||z.zt<1)return;if(y<g.top-170||y>g.top+g.rh+70||x<g.a0-50||x>g.a1+50)return;
  const s=Z1T[z.step];let v=z1v(x);
  if(s.m===1){v=clamp(Math.round(v/10)*10,0,100);this.jump(v);return}
  if(z.zoom==null){const seg=clamp(Math.floor(v/10),0,9);this.zoomTo(seg);return}
  v=clamp(Math.round(v),z.a,z.b);this.jump(v)},
 draw(){const z=ZS;bgDraw('workshop');drawSecret('z1');const g=z1geo();cast[0].x=safeL()+heroX(cast[0])/2;
  // плавное увеличение диапазона
  if(z.zt<1){z.zt=Math.min(1,z.zt+DT/(G.fast?.05:.85));const e=ease(z.zt);z.a=lerp(z.za,z.ta,e);z.b=lerp(z.zb,z.tb,e)}
  X.save();sprW('ruler',g.cx,g.y,g.w);X.restore();
  // деления (рисуются кодом поверх нарисованной линейки)
  X.save();X.beginPath();X.rect(g.a0-12,g.top-260,g.a1-g.a0+24,g.rh+262);X.rect(g.a0-70,g.top+g.rh,g.a1-g.a0+140,170);X.clip();
  const px=(g.a1-g.a0)/(z.b-z.a);// пикселей на сотую
  for(let h=Math.ceil(z.a);h<=Math.floor(z.b);h++){const x=z1x(h);const whole=h%100===0,ten=h%10===0;
   let len,al,lw;if(whole){len=g.rh*.62;al=1;lw=6}else if(ten){len=g.rh*.46;al=z.reveal;lw=5}else{len=g.rh*.28;al=clamp((px-16)/10,0,1);lw=3}
   if(al<=0)continue;X.globalAlpha=al;X.strokeStyle='#3a1c08';X.lineWidth=lw;X.lineCap='round';X.beginPath();X.moveTo(x,g.top+g.rh*.12);X.lineTo(x,g.top+g.rh*.12+len);X.stroke()}
  X.globalAlpha=1;
  // подписи над линейкой
  for(let h=Math.ceil(z.a);h<=Math.floor(z.b);h++){const x=z1x(h);const whole=h%100===0,ten=h%10===0;let al=0,fs=0;
   if(whole){al=1;fs=58}else if(ten){al=z.reveal*clamp((px*10-50)/30,0,1);fs=px*10>300?54:40}else{al=clamp((px-58)/20,0,1);fs=42}
   if(al<=0)continue;const zoomed=px*10>300;let F=fs*1.12;const lab=dec(h);if(zoomed){X.font=F+'px '+NUM;const mw=X.measureText(lab).width,lim=px*1.98;if(mw>lim)F*=lim/mw}
   const row=zoomed&&h%2?1:0;X.globalAlpha=al;txt(lab,x,g.top+g.rh+36+row*F*.95,F,'#fff',{f:NUM,st:'#3a1c08',lw:F*.12,box:null});
   if(row&&al>.5){X.strokeStyle='rgba(255,255,255,.55)';X.lineWidth=2;X.beginPath();X.moveTo(x,g.top+g.rh+4);X.lineTo(x,g.top+g.rh+36+F*.95-F*.5);X.stroke()}}
  X.globalAlpha=1;X.restore();
  // Запятуля стоит на линейке
  const u=clamp((T-z.zap.t0)/(G.fast?.02:.45),0,1),zv=lerp(z.zap.from,z.zap.v,u);let zx=z1x(clamp(zv,z.a,z.b));const hop=Math.sin(u*Math.PI)*110;
  const zh=150;const zy=g.top+4-hop;X.save();if(okI(IM.shadow)){X.globalAlpha=.5;X.drawImage(IM.shadow,zx-50,g.top-6,100,14);X.globalAlpha=1}X.restore();
  spr(u<1?'zap_crouch':(z.badge&&z.badge.ok?'zap_wave':'zap'),zx,zy,zh,{ay:1});GND.push({n:'zap',x:zx,feet:zy+hop,gl:g.top+4,w:zh*aspect('zap'),h:zh,ar:aspect('zap'),src:'zap'});
  if(z.badge&&u>=1){const bx=zx+(zx>g.cx+g.w*.3?-130:130),by=zy-zh*.55;X.save();X.translate(bx,by);sprW('tile',0,0,132);X.restore();txt(dec(z.badge.v),bx,by+2,48,z.badge.ok?'#1d7a2a':'#b02a10',{f:NUM,st:'rgba(255,248,230,.95)',lw:6,box:[bx-56,by-56,bx+56,by+56],id:'badge'})}
  drawCast()},
 ui(){const z=ZS,g=z1geo();if(z.step<0&&z.reveal===0){btn('zoom','b_zoom',g.cx,Math.min(g.top+g.rh+178,safeB()-62),120,()=>{if(z.reveal>0)return;z.reveal=.001;
    run(async()=>{const t0=T;while(z.reveal<1){await wait(30);z.reveal=Math.min(1,(T-t0)/(G.fast?.05:1.2));if(Math.random()<.3)SFX.blip()}await say('w2');SC.z1.next()})},{pulse:1})}
  if(z.zoom!=null&&!z.lock)btn('back','b_undo',g.cx,Math.min(g.top+g.rh+178,safeB()-62),110,()=>SC.z1.unzoom(),{pulse:z.step>=0&&Math.floor(Z1T[z.step].t/10)!==z.zoom})}};
// тест: что нажать (правильно / ошибка) для текущего шага
G.taps1=ok=>{const z=ZS,s=Z1T[z.step],g=z1geo();if(!s)return[];const yy=g.y;
 if(s.m===1){const v=ok?s.t:(s.t>50?s.t-20:s.t+20);return[[z1x(v),yy]]}
 const seg=Math.floor(s.t/10),xA=a=>g.a0+(a-seg*10)/10*(g.a1-g.a0);
 if(z.zoom==null){const segx=g.a0+(seg*10+5)/100*(g.a1-g.a0);return[[segx,yy],[xA(ok?s.t:(s.t%10>4?s.t-3:s.t+3)),yy]]}
 return[[xA(ok?s.t:(s.t%10>4?s.t-3:s.t+3)),yy]]};
