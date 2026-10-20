'use strict';
// ===== Зона 2: Рынок — весы с гирьками 0,1 / 0,05 / 0,01 и ценники (бросаем Запятулю) =====
const Z2F=[{f:'apple',t:25,k:'k_apple',nm:'Яблоко'},{f:'pear',t:37,k:'k_pear',nm:'Груша'},{f:'banana',t:52,k:'k_banana',nm:'Бананы'}];
const Z2W=[{id:'w_big',v:10,h:118},{id:'w_mid',v:5,h:96},{id:'w_small',v:1,h:78}];
const Z2P=[{it:'bread',d:'125',c:1,k:'k_bread',nm:'Батон'},{it:'milk',d:'085',c:1,k:'k_milk',nm:'Молоко'},{it:'cheese',d:'1205',c:2,k:'k_cheese',nm:'Сыр'},{it:'honey',d:'345',c:2,k:'k_honey',nm:'Мёд'}];
function z2geo(){const L=safeL()+heroX(cast[0])+20,R=safeR()-10;const trayW=Math.min(480,(R-L)*.46);const cx=L+(R-L-trayW)*.5+20,gy=gY();const stH=320,top=gy-stH;const half=Math.min(220,(R-L-trayW)*.36);
 return{cx,gy,top,half,trayX0:R-trayW,trayW,R}}
function panXY(side){const g=z2geo(),z=ZS;const a=z.ang;const ex=g.cx+Math.cos(a)*g.half*side,ey=g.top+14+Math.sin(a)*g.half*side;return[ex,ey]}
const PANH=230;
SC.z2={enter(){cast=[hero('sotik',0)];zoneStart(2,{part:1,i:0,pan:[],fly:[],ang:0,tag:null,place:null,comma:null});this.fruit(0);
  run(async()=>{await wait(300);await say('k1');await say(Z2F[0].k)})},
 fruit(i){const z=ZS;z.i=i;z.pan=[];const f=Z2F[i];GOAL=f.nm+': '+dec(f.t)+' кг. Уравновесь весы!'},
 sum(){return ZS.pan.reduce((s,w)=>s+w.v,0)},
 add(w){const z=ZS;if(z.lock||z.part!==1)return;if(z.pan.length>=12)return;z.pan.push({id:w.id,v:w.v,h:w.h,t0:T});SFX.clink();this.check()},
 remove(j){const z=ZS;if(z.lock)return;z.pan.splice(j,1);SFX.pop();this.check(true)},
 check(rem){const z=ZS,f=Z2F[z.i],s=this.sum();
  if(s===f.t){z.lock=true;SFX.ok();burst(...panXY(1),30,'spark',50);cheer();run(async()=>{await say('k_ok');await wait(400);z.lock=false;
    if(z.i+1<Z2F.length){SC.z2.fruit(z.i+1);await say(Z2F[z.i].k)}else{SC.z2.tags()}});return}
  if(s>f.t&&!rem){mistake();oops('sotik');sayNow('k_heavy')}},
 tags(){const z=ZS;z.part=2;z.pan=[];cast=[hero('tina',0),hero('zap',0,{h:230})];z.ti=0;z.place=null;this.tag(0);run(async()=>{await say('k_tags');await say('k_tag_intro');await say(Z2P[0].k)})},
 tag(i){const z=ZS;z.ti=i;z.place=null;z.comma=null;const p=Z2P[i];GOAL=p.nm+' стоит '+dec(this.val(p,p.c))+' рубля. Где запятая?'},
 val(p,c){return Math.round(parseInt(p.d,10)*Math.pow(10,2-(p.d.length-c)))},// значение в сотых при запятой после c-й цифры
 tg(){const p=Z2P[ZS.ti],n=p.d.length;const L=safeL()+heroX(cast[0])+30,R=safeR()-heroX(cast[1])-30;const cx=(L+R)/2;const step=118;const w=Math.min(R-L,Math.max(560,n*step+220));
  return{cx,w,h:w/aspect('tag'),y:gY()-w/aspect('tag')/2-10,step,n,x0:cx+w*.06-(n-1)*step/2}},
 gapX(j){const g=this.tg();return g.x0+(j+.5)*g.step},
 put(j){const z=ZS;if(z.lock||z.part!==2)return;const p=Z2P[z.ti];const zap=cast[1];const g=this.tg();
  z.comma={j,from:[zap.dx||zap.x,gY()-120],t0:T};SFX.whoosh();hop('zap');
  setTimeout(()=>{if(ZS!==z)return;z.place=j;const v=this.val(p,j+1);
   if(j+1===p.c){z.lock=true;SFX.ok();burst(this.gapX(j),g.y,30,'spark',48);cheer();run(async()=>{await say('k_oktag');await wait(300);z.lock=false;if(z.ti+1<Z2P.length){SC.z2.tag(z.ti+1);await say(Z2P[z.ti].k)}else{GOAL='';winZone('k_win')}})}
   else{mistake();oops('zap');GOAL='Получилось '+dec(v,(p.d.length-j-1))+', а нужно '+dec(this.val(p,p.c))+'. Нажми другое место!';sayNow('k_wrongtag')}},G.fast?20:450)},
 tap(x,y){},
 draw(){const z=ZS;bgDraw('market');drawSecret('z2');cast[0].x=safeL()+heroX(cast[0])/2;if(cast[1])cast[1].x=safeR()-heroX(cast[1])/2;
  if(z.part===1){const g=z2geo(),f=Z2F[z.i],s=this.sum();const tgt=clamp((s-f.t)/12,-1,1)*.2;z.ang+=(tgt-z.ang)*Math.min(1,DT*4);
   // стойка, коромысло, чаши
   const stH=g.gy-g.top+20;spr('sc_stand',g.cx,g.gy,stH,{ay:1});GND.push({n:'scale',x:g.cx,feet:g.gy,gl:g.gy,w:60,h:stH,ar:aspect('sc_stand'),src:'sc_stand'});
   for(const side of[-1,1]){const[ex,ey]=panXY(side);const pw=PANH*aspect('sc_pan');spr('sc_pan',ex,ey-8,PANH,{ay:0});const dishY=ey-8+PANH*.8;
    if(side<0){spr(f.f,ex,dishY+6,f.f==='banana'?92:100,{ay:1});const tx=ex+30,ty=dishY+62;X.save();sprW('tag',tx,ty,232);X.restore();textIn(dec(f.t)+' кг',tx+14,ty+4,178,78,54,'#2a1606',{f:NUM,st:0,id:'ftag',min:44})}
    else{// гирьки стопкой
     let xx=ex-pw*.32,row=0,acc=0;const rows=[[]];z.pan.forEach((w,j)=>{const ww=w.h*.55*aspect(w.id)*.0+w.h*aspect(w.id)*.6;if(acc+ww>pw*.7){rows.push([]);acc=0}rows[rows.length-1].push([w,j,ww]);acc+=ww});
     rows.forEach((r,ri)=>{let tw=r.reduce((s,q)=>s+q[2],0),x=ex-tw/2;r.forEach(([w,j,ww])=>{const hh=w.h*.6,yy=dishY+4-ri*hh*.82;const u=clamp((T-w.t0)/.25,0,1);const fy=lerp(yy-160,yy,ease(u));
       spr(w.id,x+ww/2,fy,hh,{ay:1});
       UI.push({id:'pw'+j,x:x+ww/2,y:fy-hh/2,w:ww,h:hh,fn:()=>SC.z2.remove(j)});x+=ww})});
     const tx=ex-30,ty=dishY+72;X.save();sprW('tag',tx,ty,232);X.restore();textIn(dec(s,s%100===0?0:undefined)+' кг',tx+14,ty+4,178,78,54,'#2a1606',{f:NUM,st:0,id:'sum',min:44})}}
   // коромысло поверх подвесов
   spr('sc_beam',g.cx,g.top+14,40,{rot:z.ang,ay:.5});
   // лоток гирек
   Z2W.forEach((w,i)=>{const x=g.trayX0+g.trayW*(i+.5)/3,h=w.h,y=g.gy-h/2;X.save();spr(w.id,x,g.gy,h,{ay:1});X.restore();GND.push({n:w.id,x,feet:g.gy,gl:g.gy,w:h*aspect(w.id),h,ar:aspect(w.id),src:w.id});
    // большой нарисованный ценник-бирка над гирькой
    const tw=Math.min(155,g.trayW/3-8),th=tw/aspect('tag'),ty=g.gy-h-th/2+6,rot=Math.sin(T*1.6+i)*.03;
    X.save();X.translate(x,ty);X.rotate(rot);sprW('tag',0,0,tw);X.shadowColor='transparent';
    textIn(dec(w.v),tw*.07,th*.04,tw*.74,th*.56,64,'#2a1606',{f:NUM,st:0,id:'wl',min:44});X.restore();
    UI.push({id:'w'+w.v,x,y:(y+ty)/2,w:Math.max(110,tw),h:Math.max(110,h+th),fn:()=>SC.z2.add(w)});})}
  else{const p=Z2P[z.ti],g=this.tg();X.save();sprW('tag',g.cx,g.y,g.w);X.restore();
   spr(p.it,g.cx-g.w*.36,gY()-4,150,{ay:1});GND.push({n:p.it,x:g.cx-g.w*.36,feet:gY()-4,gl:gY(),w:100,h:150,ar:aspect(p.it),src:p.it});
   for(let j=0;j<g.n;j++){const x=g.x0+j*g.step;txt(p.d[j],x,g.y+6,150,'#2a1606',{f:NUM,st:0,box:[g.cx-g.w/2,g.y-g.h/2,g.cx+g.w/2,g.y+g.h/2],id:'dig'})}
   for(let j=0;j<g.n-1;j++){const x=this.gapX(j);if(z.place!==j){X.fillStyle='rgba(210,150,40,'+(.45+Math.sin(T*4+j)*.2)+')';X.beginPath();X.arc(x,g.y+62,9,0,7);X.fill()}
    UI.push({id:'gap'+j,x,y:g.y+10,w:Math.min(g.step,110),h:170,fn:()=>SC.z2.put(j)})}
   if(z.comma){const u=clamp((T-z.comma.t0)/(G.fast?.02:.42),0,1);const[fx,fy]=z.comma.from,tx=this.gapX(z.comma.j),ty=g.y+52;const x=lerp(fx,tx,u),y=lerp(fy,ty,u)-Math.sin(u*Math.PI)*200;
    spr('comma',x,y,76,{rot:u<1?u*12:0})}}
  drawCast()}};
G.taps2=ok=>{const z=ZS;const B=UI.length?UI:[];const find=id=>{const b=UI.find(b=>b.id===id);return b?[b.x,b.y]:null};
 if(z.part===1&&SC.z2.sum()>Z2F[z.i].t)return z.pan.map((w,j)=>find('pw'+(z.pan.length-1-j)));
 if(z.part===1){const f=Z2F[z.i];let need=f.t-SC.z2.sum();if(!ok)return[find('w10'),find('w10'),find('w10'),find('w10'),find('w10'),find('w10')].slice(0,Math.ceil((f.t-SC.z2.sum())/10)+1);
  const out=[];while(need>=10){out.push(find('w10'));need-=10}while(need>=5){out.push(find('w5'));need-=5}while(need>=1){out.push(find('w1'));need-=1}return out}
 const p=Z2P[z.ti];const j=ok?p.c-1:(p.c===1?1:0);return[find('gap'+j)]};
