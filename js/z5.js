'use strict';
// ===== Зона 5: Ракета — заправка долями ровно до 1,0; погоня за Ластиком =====
const Z5C=[[50,30,20,25],[45,35,20,15]],CANS=['can_red','can_blue','can_green','can_yellow'];
const Z5Q=[[80,75],[6,60],[110,109]];
function z5geo(){const gy=gY();const tina=cast[0];const L=safeL()+(tina?heroX(tina):0)+30,R=safeR()-20;const rh=Math.min(560,gy-vis().y0-60);const rw=rh*aspect('rocket');const rx=R-rw/2;const tx=rx-rw/2-70;return{gy,L,R,rh,rw,rx,tx,cl:L,cr:tx-150}}
SC.z5={enter(){cast=[hero('tina',0)];zoneStart(5,{ph:'fuel',r:0,lvl:0,shown:0,used:[],pour:null,q:0,dist:3,fly:0,lt:0});GOAL='Заправь ракету ровно до 1,0!';
  run(async()=>{await wait(300);await say('f1');await say('f2')})},
 sum(){return ZS.used.reduce((s,i)=>s+Z5C[ZS.r][i],0)},
 pourCan(i){const z=ZS;if(z.ph!=='fuel'||z.lock||z.used.includes(i))return;z.used.push(i);z.pour={i,t0:T};SFX.pour();
  setTimeout(()=>{if(ZS!==z)return;const s=this.sum();if(s===100){z.lock=true;SFX.ok();cheer();run(async()=>{await say('f_ok1');if(z.r===0){z.r=1;z.used=[];z.lvl=0;await wait(400);z.lock=false;await say('f_round2')}else{z.lock=false;SC.z5.launch()}})}
   else if(s>100){mistake();oops('tina');sayNow('f_over')}},G.fast?20:650)},
 undo(){const z=ZS;if(z.lock||!z.used.length)return;z.used.pop();SFX.pop()},
 launch(){const z=ZS;z.ph='launch';z.lock=true;z.lt=T;GOAL='';run(async()=>{await say('f_launch');shake=10;await wait(1800);z.ph='chase';cast=[];z.lock=false;GOAL='Нажми на большее число!';await say('f_chase')})},
 answer(k){const z=ZS;if(z.ph!=='chase'||z.lock)return;const q=Z5Q[z.q];const big=q[0]>q[1]?0:1;
  if(k===big){z.q++;z.dist--;SFX.boost();shake=5;burst(vis().x0+380,360,30,'spark',30);if(z.q>=Z5Q.length){z.lock=true;run(async()=>{await wait(900);SFX.star();z.caught=T;burst(vis().x0+vis().w-330,330,80,'conf',50,1.5);await say('f_caught');SV.stars[4]=1;save();go('fin')})}else say('f_chase_ok').catch(()=>{})}
  else{mistake();sayNow('f_chase_bad')}},
 draw(){const z=ZS,v=vis();const tgt=this.sum();z.lvl+=(Math.min(tgt,120)-z.lvl)*Math.min(1,DT*(G.fast?30:3));
  if(z.ph==='chase'){const sky=IM.bg_sky;if(okI(sky)){const s=bgScale();const sw=1280*s;const off=((T*260)%sw);for(let x=bgX0()-off;x<v.x0+v.w;x+=sw)X.drawImage(sky,x,bgY0(),sw,720*s)}
   const rx=v.x0+220+(3-z.dist)*120,ry=380+Math.sin(T*2)*14;if(Math.random()<.8)PS.push({x:rx-170,y:ry+rnd(-12,12),vx:rnd(-300,-160),vy:rnd(-30,30),life:.7,dec:1.8,kind:'spark',hue:rnd(15,45),s:rnd(5,11),rot:0,vr:0});
   spr('rocket',rx,ry,300,{rot:Math.PI/2});
   const lx=v.x0+v.w-300+Math.sin(T*1.3)*20,ly=330+Math.sin(T*2.3)*24;if(z.caught){X.save();X.translate(lx,ly);X.rotate((T-z.caught)*6);spr('lastik_fly',0,0,280);X.restore();if(Math.random()<.5)PS.push({x:lx,y:ly,vx:rnd(-300,300),vy:rnd(-300,100),life:1,dec:.7,kind:'conf',hue:48,s:12,rot:0,vr:8})}else spr('lastik_fly',lx,ly,300);
   return}
  bgDraw('launch');drawSecret('z5');const g=z5geo();cast.forEach(c=>c.x=safeL()+heroX(c)/2);
  // ракета
  let ry=g.gy;if(z.ph==='launch'){const u=Math.max(0,T-z.lt-.8);ry-=u*u*420;for(let i=0;i<4;i++)PS.push({x:g.rx+rnd(-40,40),y:ry+rnd(-10,10),vx:rnd(-120,120),vy:rnd(20,160),life:1,dec:1.2,kind:'spark',hue:rnd(10,45),s:rnd(6,14),rot:0,vr:0})}
  spr('rocket',g.rx,ry,g.rh,{ay:1});GND.push({n:'rocket',x:g.rx,feet:ry,gl:g.gy,w:g.rw,h:g.rh,ar:aspect('rocket'),src:'rocket'});
  // окно бака в ракете заполняется
  {const wx=g.rx-g.rw*.005,wy0=ry-g.rh*.55,wy1=ry-g.rh*.145,ww=g.rw*.3;const f=clamp(z.lvl/100,0,1.1);X.save();X.beginPath();X.roundRect(wx-ww/2,wy0,ww,wy1-wy0,ww/2);X.clip();
   const ly=wy1-(wy1-wy0)*f;const gr=X.createLinearGradient(0,ly,0,wy1);gr.addColorStop(0,'rgba(120,230,255,.85)');gr.addColorStop(1,'rgba(20,120,220,.9)');X.fillStyle=gr;X.beginPath();X.moveTo(wx-ww,wy1);for(let x=-ww;x<=ww;x+=4)X.lineTo(wx+x,ly+Math.sin(T*5+x*.1)*3);X.lineTo(wx+ww,wy1);X.fill();X.restore()}
  if(z.ph!=='fuel')return drawCast();
  // шкала бака 0..1
  const th=g.rh*.72,ty0=g.gy-20-th,ty1=g.gy-20;spr('tube',g.tx,(ty0+ty1)/2,th);const iy0=ty0+th*.08,iy1=ty1-th*.08;const lvlY=d=>iy1-(iy1-iy0)*d/100;
  {const f=clamp(z.lvl,0,115);X.save();X.beginPath();X.roundRect(g.tx-16,iy0-th*.04,32,iy1-iy0+th*.08,16);X.clip();const ly=lvlY(f);const gr=X.createLinearGradient(0,ly,0,iy1);gr.addColorStop(0,'rgba(120,230,255,.95)');gr.addColorStop(1,'rgba(20,120,220,.95)');X.fillStyle=gr;X.fillRect(g.tx-20,ly,40,iy1-ly+th*.05);X.restore()}
  for(let d=0;d<=100;d+=10){const y=lvlY(d),maj=d%50===0;X.strokeStyle=d===100?'#c0200a':'#1a2a4a';X.lineWidth=maj?4:2;X.beginPath();X.moveTo(g.tx-(maj?20:11),y);X.lineTo(g.tx+(maj?20:11),y);X.stroke();if(maj)txt(d===100?'1,0':dec(d),g.tx-84,y,46,d===100?'#ffe066':'#fff',{f:NUM,st:'#2a1606',lw:7,box:null})}
  {const bw=400,bh=bw/aspect('board'),bx=(g.cl+g.cr)/2+40,by=g.gy-300;sprW('board',bx,by,bw);textIn('В баке: '+dec(tgt,tgt%100?undefined:1),bx,by+2,bw*.86,bh*.66,54,tgt>100?'#c0200a':'#3a1c08',{f:NUM,st:0,id:'fuel'})}
  // канистры
  const C=Z5C[z.r],n=C.length,sp=(g.cr-g.cl)/n;
  C.forEach((v,i)=>{const used=z.used.includes(i);const x=g.cl+sp*(i+.5),h=Math.min(170,sp*1.5);let y=g.gy-58;
   if(z.pour&&z.pour.i===i){const u=clamp((T-z.pour.t0)/(G.fast?.02:.6),0,1);if(u<1){const px=lerp(x,g.tx,u),py=lerp(y,ty0-30,u)-Math.sin(u*Math.PI)*120;spr(CANS[i],px,py,h*.8,{ay:1,rot:u*1.9});return}}
   if(used)return;spr(CANS[i],x,y,h,{ay:1});GND.push({n:CANS[i],x,feet:y,gl:y,w:h*aspect(CANS[i]),h,ar:aspect(CANS[i]),src:CANS[i]});
   const lw=Math.min(140,sp*.95),lh=lw/aspect('tag');sprW('tag',x,y+lh/2+2,lw);textIn(dec(v),x+lw*.06,y+lh/2+4,lw*.82,lh*.6,56,'#2a1606',{f:NUM,st:0,id:'can',min:44});
   UI.push({id:'can'+i,x,y:y-h/2,w:Math.max(110,h*aspect(CANS[i])),h,fn:()=>SC.z5.pourCan(i)})});
  drawCast()},
 ui(){const z=ZS,v=vis();if(z.ph==='fuel'&&z.used.length&&!z.lock){const g=z5geo();btn('undo','b_undo',g.cl+60,g.gy-310,100,()=>SC.z5.undo(),{pulse:this.sum()>100})}
  if(z.ph==='chase'&&z.q<Z5Q.length){const q=Z5Q[z.q];[0,1].forEach(k=>{const x=640+(k?140:-140),y=v.y0+v.h*.72,d=190;btn('ans'+k,'dial',x,y,d,()=>SC.z5.answer(k));txt(dec(q[k]),x,y+3,58,'#fff',{f:NUM,st:'#3a1c08',lw:9,box:[x-d*.4,y-d*.4,x+d*.4,y+d*.4],id:'ans'})})}}};
G.taps5=ok=>{const z=ZS;const b=id=>{const q=UI.find(u=>u.id===id);return q?[q.x,q.y]:null};
 if(z.ph==='chase'){const q=Z5Q[z.q];const big=q[0]>q[1]?0:1;return[b('ans'+(ok?big:1-big))]}
 if(z.ph!=='fuel')return[];const C=Z5C[z.r];const s=SC.z5.sum();if(s>100){return z.used.map(()=>b('undo'))}
 // правильный набор = подмножество с суммой 100
 const n=C.length;let best=null;for(let m=1;m<1<<n;m++){let t=0;for(let i=0;i<n;i++)if(m>>i&1)t+=C[i];if(t===100){best=m;break}}
 if(ok){const out=[];for(let i=0;i<n;i++)if((best>>i&1)&&!z.used.includes(i))out.push(b('can'+i));return out}
 const free=C.map((v,i)=>i).filter(i=>!z.used.includes(i));const perm=a=>a.length<2?[a]:a.flatMap((x,i)=>perm(a.filter((_,j)=>j!==i)).map(p=>[x,...p]));
 for(const p of perm(free)){let t=s,out=[];for(const i of p){t+=C[i];out.push(i);if(t===100)break;if(t>100)return out.map(i=>b('can'+i))}}return[]};
// ---- общий тестовый интерфейс ----
G.taps3=ok=>{const z=ZS;if(z.phase!=='rank')return[];const want=z.order[z.ranked.length];const n=ok?want:z.order.find(n=>n!==want&&!z.ranked.includes(n));const b=UI.find(u=>u.id==='r_'+n);return b?[[b.x,b.y]]:[]};
G.taps=ok=>{const f={z1:G.taps1,z2:G.taps2,z3:G.taps3,z4:G.taps4,z5:G.taps5}[scene];return f?f(ok):[]};
G.prog=()=>ZS?JSON.stringify([ZS.step,ZS.part,ZS.i,ZS.ti,ZS.r,ZS.ph,ZS.q,ZS.ri,ZS.phase,(ZS.ranked||[]).length,ZS.got&&ZS.got.length,ZS.used&&ZS.used.length]):'none';
