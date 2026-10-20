'use strict';
// ===== Зона 3: Гонка — настоящий картинг (псевдо-3D дорога из нарисованной текстуры), ворота с числами, фотофиниш =====
const RACES=[{gates:[[70,40],[50,80],[30,25],[90,65],[60,61],[45,50]],times:{tina:1205,sotik:1238,lastik:1240,zap:1250},claim:'r_claim',intro:'r1'},
 {gates:[[10,9],[105,150],[60,59],[203,230],[80,8],[345,350]],times:{sotik:909,lastik:990,tina:995,zap:1001},claim:'r_claim2',intro:'r2_intro'}];
const RW=1000,CH=1000,PD=600,TEXW=RW*2/0.42,TEXL=TEXW*720/1280,ZFAR=32000;
function trackCurve(p){// плавные повороты
 const S=[[3000,9000,.9],[13000,19000,-1.1],[23500,27500,.7],[30000,36000,-.8],[40000,46000,1.0],[50000,55000,-.6],[57000,60000,.5]];let c=0;
 for(const[a,b,k]of S){if(p>a&&p<b){const u=(p-a)/(b-a);c+=k*Math.sin(u*Math.PI)}}return c}
const TRACKLEN=64000;
function raceInit(ri){const R=RACES[ri],z=ZS;Object.assign(z,{ri,phase:'count',pos:0,px:0,sp:0,boost:0,slow:0,steer:0,t:0,cnt:3,cntT:T,coins:0,skyx:0,objs:[],rivals:[],rows:[],gi:0,gres:[],ranked:[],rank:null});
 const O=z.objs;for(let p=1500;p<TRACKLEN+3000;p+=1400){const side=(p/1400)%2?1:-1;O.push({t:['tree','lamp','tree','stand'][Math.floor(p/1400)%4],pos:p,x:side*(2.0+Math.random()*.6),wh:{tree:1500,lamp:1400,stand:1300}});O[O.length-1].wh=O[O.length-1].t==='tree'?1700:O[O.length-1].t==='lamp'?1500:1500}
 for(let p=2200;p<TRACKLEN;p+=2800){O.push({t:'tree',pos:p+700,x:(Math.random()<.5?-1:1)*(3.2+Math.random()),wh:1900})}
 O.push({t:'arch',pos:900,x:0,wh:1700,ww:2.6},{t:'arch',pos:TRACKLEN,x:0,wh:1700,ww:2.6});
 R.gates.forEach((g,i)=>{const p=7000+i*9000;O.push({t:'gate',pos:p,x:-.5,v:g[0],gi:i,wh:0,ww:.95},{t:'gate',pos:p,x:.5,v:g[1],gi:i,wh:0,ww:.95});
  O.push({t:'boost',pos:p+3200,x:(i%2?.45:-.45),flat:1,ww:.55},{t:'coin',pos:p-2500,x:(i%3-1)*.5,wh:300,ww:.3},{t:'coin',pos:p-2100,x:(i%3-1)*.5,wh:300,ww:.3},{t:'coin',pos:p-1700,x:(i%3-1)*.5,wh:300,ww:.3});
  if(i===2||i===4)O.push({t:'puddle',pos:p+5600,x:(i===2?-.3:.35),flat:1,ww:.6})});
 if(!SV.secret[2]&&ri===0)O.push({t:'secret',pos:33500,x:-.8,wh:330,ww:.3});
 O.sort((a,b)=>a.pos-b.pos);
 z.rivals=[{n:'tina',pos:2700,x:-.45},{n:'zap',pos:2300,x:.45},{n:'lastik',pos:3300,x:0}].map(r=>Object.assign(r,{sp:0,tx:r.x,tt:0}));
 cast=[];GOAL='';run(async()=>{await say(R.intro);if(ri===0)await say('r2');await say('r_go')})}
SC.z3={enter(a){zoneStart(3);raceInit(a||0)},
 hold(id,x,y){},
 steerIn(){let s=0;for(const[id,p]of PTR){if(p.y<safeT()+100&&p.x<safeL()+120)continue;s+=p.x<640?-1:1}if(KEYS.ArrowLeft)s-=1;if(KEYS.ArrowRight)s+=1;
  if(G.raceAuto){const g=ZS.objs.find(o=>o.t==='gate'&&o.pos>ZS.pos-200);let tx=0;if(g){const R=RACES[ZS.ri].gates[g.gi];const big=R[0]>R[1]?-.5:.5;tx=G.raceAuto==='bad'?-big:big}s=clamp((tx-ZS.px)*6,-1,1)}return clamp(s,-1,1)},
 step(dt){const z=ZS;if(z.phase==='count'){const k=Math.floor((T-z.cntT)/(G.fast?.15:1));if(k!==z.cntk){z.cntk=k;if(k<3)tone(660,.15,'square',.06);else tone(1320,.4,'square',.07)}if(k>=3){z.phase='race';z.t0=T}return}
  if(z.phase!=='race'&&z.phase!=='finish')return;
  const st=this.steerIn();z.steer+=(st-z.steer)*Math.min(1,dt*8);
  const off=Math.abs(z.px)>1.08;let max=1900;if(z.boost>0){max=2900;z.boost-=dt}if(off)max=1100;if(z.slow>0){max=Math.min(max,900);z.slow-=dt}
  if(z.phase==='finish')max=600;
  z.sp+=(max-z.sp)*Math.min(1,dt*(z.sp<max?.9:2.5));
  const c=trackCurve(z.pos);z.px+=z.steer*dt*1.9*(.4+z.sp/2400)-c*dt*z.sp/2400*.85;z.px=clamp(z.px,-2.2,2.2);
  z.skyx+=c*z.sp*dt*.012;const p0=z.pos;z.pos+=z.sp*dt;if(z.phase==='race')z.t=T-z.t0;
  engine(true,z.sp/2000);
  // предметы
  for(const o of z.objs){if(o.done||o.pos<p0||o.pos>=z.pos+0)continue;// пересекли на этом кадре
   if(o.t==='gate'){if(o.x<0){const g=RACES[z.ri].gates[o.gi];const lane=z.px<0?0:1;const big=g[0]>g[1]?0:1;const okk=lane===big;o.done=1;z.gres.push(okk);
     if(okk){z.boost=1.7;SFX.boost();burst(640,vis().y0+vis().h-180,30,'spark',45,1.3);shake=4;say(z.gres.filter(v=>v).length%2?'r_gate_ok':'r_gate_ok2').catch(()=>{})}
     else{mistake();sayNow('r_gate_bad')}}}
   else if(o.t==='boost'&&Math.abs(z.px-o.x)<.42){o.done=1;z.boost=1.4;SFX.boost();shake=3}
   else if(o.t==='coin'&&Math.abs(z.px-o.x)<.35){o.done=1;z.coins++;SFX.coin();burst(640,vis().y0+vis().h-220,10,'spark',50,.6)}
   else if(o.t==='puddle'&&Math.abs(z.px-o.x)<.45){o.done=1;z.slow=.9;SFX.bump();shake=6;say('r_puddle').catch(()=>{})}
   else if(o.t==='secret'&&Math.abs(z.px-o.x)<.45){o.done=1;const v=vis();gotSecret('z3',640,v.y0+v.h-250)}}
  // соперники держатся рядом (фотофиниш)
  for(const r of z.rivals){const d=(z.pos+1600)-r.pos;let ts=1850+d*.35+Math.sin(T*.7+r.pos*.001)*120;if(z.phase==='finish')ts=r.pos<TRACKLEN+400?1400:500;ts=clamp(ts,1200,2700);
   r.sp+=(ts-r.sp)*Math.min(1,dt*1.2);if(z.phase==='count')r.sp=0;r.pos+=r.sp*dt;if(T>r.tt){r.tt=T+rnd(1.5,3.5);r.tx=rnd(-.7,.7)}r.x+=(r.tx-r.x)*Math.min(1,dt*1.2);
   const dz=r.pos-(z.pos+1400);if(Math.abs(dz)<260&&Math.abs(r.x-z.px)<.42){if(dz>0){z.sp*=.85;r.pos+=60}else{r.pos-=60}z.px+=(z.px<r.x?-1:1)*.18;SFX.bump();shake=4}}
  if(z.phase==='race'&&z.pos>=TRACKLEN){z.phase='finish';z.ft=T;SFX.star();burst(640,300,80,'conf',null,1.4);run(async()=>{await say('r_finish');await wait(500);SC.z3.rankStart()})}},
 rankStart(){const z=ZS;engine(false);z.phase='rank';z.ranked=[];const R=RACES[z.ri];const order=Object.keys(R.times).sort((a,b)=>R.times[a]-R.times[b]);z.order=order;
  cast=['tina','zap','lastik','sotik'].map(n=>hero(n,0,{h:n==='zap'?220:350,pose:n==='lastik'?'laugh':''}));GOAL='Нажимай гонщиков: от самого быстрого';
  run(async()=>{await say(R.claim);await say('r_rank')})},
 pick(n){const z=ZS;if(z.phase!=='rank'||z.lock||z.ranked.includes(n))return;const want=z.order[z.ranked.length];
  if(n===want){z.ranked.push(n);hop(n);SFX.ok();if(n==='lastik')pose('lastik','angry');
   if(z.ranked.length===4){z.lock=true;cheer();pose('lastik','sad');run(async()=>{await say('r_rank_done');z.lock=false;if(z.ri===0){await wait(300);raceInit(1)}else{GOAL='';winZone('r_win')}})}
   else say('r_rank_ok').catch(()=>{})}
  else{mistake();oops(n);sayNow('r_rank_bad')}},
 unpick(){const z=ZS;if(z.phase!=='rank'||z.lock||!z.ranked.length)return;z.ranked.pop();SFX.pop()},
 draw(){const z=ZS;const dt=DT*(G.fast?4:1);this.step(dt);const v=vis();
  if(z.phase==='rank'){bgDraw('race_sky');BGN='race';const R=RACES[z.ri];const L=safeL()+100,Rr=safeR()-20;const n=cast.length;const gy=v.y0+v.h-118;
   cast.forEach((c,i)=>{c.x=L+(Rr-L)*(i+.5)/n;c.gy=gy});drawCast();
   cast.forEach((c,i)=>{const x=c.dx,bw=200,bh=bw/aspect('board'),by=gy+bh/2+6;const pl=z.ranked.indexOf(c.n);sprW('board',x,by,bw);txt(dec(R.times[c.n],2).replace(/,(\d)0$/,',$1')+' с',x,by,46,pl>=0?'#1d7a2a':'#3a1c08',{f:NUM,st:0,box:[x-bw*.42,by-bh*.3,x+bw*.42,by+bh*.3],id:'time'});
    const hw=heroX(c);UI.push({id:'r_'+c.n,x,y:gy-c.h/2,w:Math.max(hw,130),h:c.h,fn:()=>SC.z3.pick(c.n)});
    if(pl>=0){const sx=x,sy=gy-c.h-50;spr('star',sx,sy,100,{rot:Math.sin(T*2+i)*.1});txt(String(pl+1),sx,sy+6,48,'#7a3a00',{f:NUM,st:'rgba(255,240,180,.9)',lw:5,box:[sx-40,sy-40,sx+40,sy+40],id:'place'})}});
   if(z.ranked.length&&!z.lock)btn('undo','b_undo',safeL()+44,safeB()-60,96,()=>SC.z3.unpick());return}
  // ---- дорога ----
  const yH=v.y0+v.h*.42,yB=v.y0+v.h;const sky=IM.bg_race_sky;
  if(okI(sky)){const s=Math.max(v.w/1280,1.0)*1.25;const sw=1280*s,sh=720*s;const sy=yH-sh*.70;let sx=((-z.skyx*40)%sw+sw)%sw;for(let x=v.x0-sw+sx%sw-sw;x<v.x0+v.w+sw;x+=sw)X.drawImage(sky,x,sy,sw,sh)}
  const tex=IM.bg_road;z.rows=[];let slope=0,offx=0,prevz=0;const step=3;
  for(let y=yB;y>yH+6;y-=step){const dy=y-yH;const zz=CH*PD/dy;if(zz>ZFAR)break;const dz=prevz?zz-prevz:0;prevz=zz;slope+=trackCurve(z.pos+zz)*dz*1.6e-5;offx+=slope*dz;z.rows.push([zz,offx,y]);
   const sc=dy/CH,cx=640+(offx-z.px*RW)*sc;if(okI(tex)){const tv=(((z.pos+zz)/TEXL*720)%720+720)%720;const tw=TEXW*sc;X.drawImage(tex,0,Math.floor(tv),1280,1,cx-tw/2,y-step,tw,step+1)}}
  // проекция предметов
  const proj=(wz,wx)=>{const rows=z.rows;if(wz<rows[0][0]||wz>rows[rows.length-1][0])return null;let lo=0,hi=rows.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(rows[m][0]<wz)lo=m;else hi=m}
   const a=rows[lo],b=rows[hi],u=(wz-a[0])/((b[0]-a[0])||1);const off=lerp(a[1],b[1],u);const dy=CH*PD/wz,sc=dy/CH;return{x:640+(off+wx*RW-z.px*RW)*sc,y:yH+dy,sc}};
  const list=[];for(const o of z.objs){const wz=o.pos-z.pos;if(wz<300||wz>ZFAR||(o.done&&o.t!=='gate'&&o.t!=='arch'))continue;list.push([wz,o])}
  for(const r of z.rivals){const wz=r.pos-z.pos;if(wz>300&&wz<ZFAR)list.push([wz,{t:'kart',n:r.n,x:r.x}])}
  list.sort((a,b)=>b[0]-a[0]);
  for(const[wz,o]of list){const p=proj(wz,o.x);if(!p)continue;
   if(o.t==='kart'){const w=720*p.sc;sprW('kart_'+o.n,p.x,p.y,w,{ay:.92});continue}
   if(o.flat){const w=(o.ww||.5)*RW*p.sc;const h=w/aspect(o.t)*.55;X.save();X.translate(p.x,p.y);X.scale(1,.55);sprW(o.t,0,0,w,{ay:.6});X.restore();continue}
   if(o.t==='gate'){const w=o.ww*RW*p.sc*1.04,h=w/aspect('gate');sprW('gate',p.x,p.y,w,{ay:.97});const fs=h*.13;if(fs>5){const g=RACES[z.ri].gates[o.gi];const ok=o.done&&z.gres[o.gi]!=null;txt(dec(o.v),p.x,p.y-h*.97+h*.17,fs,'#2a1606',{f:NUM,st:0,box:fs>=44?null:undefined})}continue}
   if(o.t==='arch'){const w=o.ww*RW*p.sc,h=w/aspect('arch');sprW('arch',p.x,p.y,w,{ay:.97});continue}
   if(o.t==='coin'){const h=o.wh*p.sc;X.save();X.translate(p.x,p.y-h*.9);X.scale(Math.cos(T*4+o.pos)*.9+.1,1);spr('coin',0,0,h);X.restore();continue}
   if(o.t==='secret'){const h=o.wh*p.sc;X.save();spr('comma',p.x,p.y-h*.8,h,{rot:Math.sin(T*3)*.3});X.restore();continue}
   const h=(o.wh||1400)*p.sc;spr(o.t,p.x,p.y,h,{ay:.97})}
  // свой картинг
  const kw=Math.min(300,v.w*.22),bump=Math.sin(T*24)*1.5*(z.sp/2000);const kx=640+z.steer*16,ky=yB-14+bump;
  if(z.boost>0&&Math.random()<.7){PS.push({x:kx+rnd(-50,50),y:ky-20,vx:rnd(-40,40),vy:rnd(60,160),life:.6,dec:2,kind:'spark',hue:rnd(20,50),s:rnd(4,8),rot:0,vr:0})}
  if(Math.abs(z.px)>1.08&&z.sp>300&&Math.random()<.4)PS.push({x:kx+rnd(-80,80),y:ky-10,vx:rnd(-60,60),vy:rnd(-80,-20),life:.6,dec:1.6,kind:'dust',hue:100,s:rnd(4,9),rot:0,vr:0});
  sprW('kart_sotik',kx,ky,kw,{ay:1,rot:z.steer*.05});GND.push({n:'kart',x:kx,feet:ky,gl:ky,w:kw,h:kw/aspect('kart_sotik'),ar:aspect('kart_sotik'),src:'kart_sotik'})},
 ui(){const z=ZS,v=vis();if(z.phase==='rank')return;
  // указатели руля (нарисованные стрелки), подсвечиваются при нажатии
  const st=z.steer,ay=safeB()-80;for(const s of[-1,1]){const x=s<0?safeL()+90:safeR()-90;const on=(s<0?st<-.3:st>.3);X.save();X.globalAlpha=on?1:.75;btnDraw('b_up',x,ay,on?150:136,s*Math.PI/2);X.restore()}
  // табло: время и монеты
  const bw=300,bh=bw/aspect('board'),bx=safeL()+120+bw/2,by=safeT()+bh/2;sprW('board',bx,by,bw);txt(dec(Math.round(z.t*100),2)+' с',bx,by+2,44,'#3a1c08',{f:NUM,st:0,box:[bx-bw*.42,by-bh*.3,bx+bw*.42,by+bh*.3],id:'timer'});
  const cx=bx+bw/2+60;spr('coin',cx,by,62);txt('×'+z.coins,cx+64,by,48,'#fff',{f:NUM,st:'#3a1c08',lw:7,box:null});
  // место
  const place=1+z.rivals.filter(r=>r.pos>z.pos+1400).length;txt(place+'-й',safeR()-70,safeT()+40,56,'#ffe066',{f:NUM,st:'#3a1c08',lw:9,box:null});
  if(z.phase==='count'){const k=Math.floor((T-z.cntT)/(G.fast?.15:1));const s=k<3?String(3-k):'Старт!';const d=180,cy=v.y0+v.h*.42-10;spr('dial',640,cy,d);txt(s,640,cy+4,k<3?100:44,'#fff',{f:NUM,st:'#b0300a',lw:10,box:[640-d*.4,cy-d*.4,640+d*.4,cy+d*.4],id:'cnt'})}
  // следующие ворота: что сравнить
  const g=z.objs.find(o=>o.t==='gate'&&!o.done&&o.x<0&&o.pos>z.pos);if(g&&g.pos-z.pos<16000&&z.phase==='race'&&!talk){GOAL='Въезжай в ворота с большим числом!'}else if(!talk)GOAL=''},
 bubbleX(bw){return 640}};
function btnDraw(im,x,y,d,rot){X.save();X.translate(x,y);X.rotate(rot||0);sprW(im,0,0,d);X.restore()}
G.race=()=>{const z=ZS;return z&&{phase:z.phase,pos:z.pos,ri:z.ri,gres:z.gres,ranked:z.ranked,order:z.order}};
