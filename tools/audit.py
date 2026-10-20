# Аудит текста (надпись внутри своей рамки и в видимой области), героев (на земле, без растяжения), поворот телефона.
import asyncio,os,json
from playwright.async_api import async_playwright
URL=os.environ.get('URL','http://127.0.0.1:18681/index.html')
VPS=[(844,390),(667,375),(932,430)]
if os.environ.get('VPS'):VPS=[tuple(map(int,v.split('x'))) for v in os.environ['VPS'].split(',')]
STATES=[('title',''),('intro',''),('map',''),('z1',''),('z1','ZS.reveal=1;SC.z1.next()'),('z1','ZS.reveal=1;ZS.step=1;SC.z1.next();SC.z1.zoomTo(3)'),
 ('z2',''),('z2','SC.z2.tags()'),('z2','SC.z2.tags();SC.z2.tag(2)'),('z3',''),('z3','SC.z3.rankStart()'),('z4',''),('z4','ZS.td=275'),('z5',''),('z5','SC.z5.launch()'),('fin','')]
async def main():
  F=[];N=0
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for W,H in VPS:
      ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=True,is_mobile=True,device_scale_factor=1)
      pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto(URL);await pg.wait_for_function('G.scene==="title"',timeout=40000);await pg.evaluate('G.mute=true;SV.open=5')
      os.makedirs(f'shots/audit/{W}x{H}',exist_ok=True)
      for i,(sc,js) in enumerate(STATES):
        await pg.evaluate(f'G.go("{sc}")');await pg.wait_for_timeout(500)
        if js:await pg.evaluate(js)
        await pg.wait_for_timeout(2600 if 'launch' in js else 900)
        for rep in range(2):
          await pg.evaluate('G.auditReq=1');await pg.wait_for_timeout(120)
          A=await pg.evaluate('({a:G._aud,v:vis(),g:GND})');v=A['v']
          for t in A['a']['t']:
            x0,y0,x1,y1=t['b'];N+=1;pad=(y1-y0)*.18;y0+=pad;y1-=pad
            if x0<v['x0']-1 or x1>v['x0']+v['w']+1 or y0<v['y0']-1 or y1>v['y0']+v['h']+1:F.append(f"{W}x{H} {sc}#{i} text '{t['id']}' off-screen")
            if any(c.isdigit() for c in t.get('t','')) and t.get('css',99)<22:F.append(f"{W}x{H} {sc}#{i} small digits '{t['id']}' «{t['t']}» {t['css']:.1f}px")
            if t['box']:
              bx0,by0,bx1,by1=t['box']
              if x0<bx0-2 or x1>bx1+2 or y0<by0-4 or y1>by1+4:F.append(f"{W}x{H} {sc}#{i} text '{t['id']}' out of frame {[round(q) for q in t['b']]} vs {[round(q) for q in t['box']]}")
          for g in A['g']:
            if g.get('hero'):
              if abs(g['feet']-g['gl'])>2:F.append(f"{W}x{H} {sc}#{i} hero {g['n']} floating {g['feet']-g['gl']:.1f}")
              if abs(g['w']/g['h']-g['ar'])>0.01:F.append(f"{W}x{H} {sc}#{i} hero {g['n']} stretched")
              if g['x']-g['w']/2<v['x0']-1 or g['x']+g['w']/2>v['x0']+v['w']+1:F.append(f"{W}x{H} {sc}#{i} hero {g['n']} cut by screen edge")
          if rep==0:
            await pg.screenshot(path=f'shots/audit/{W}x{H}/{i:02d}_{sc}.png')
            await pg.evaluate('stopTalk()');await pg.wait_for_timeout(150)
      if errs:F.append(f'{W}x{H} errors {errs[:3]}')
      await ctx.close()
    ctx=await b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True,device_scale_factor=1)
    pg=await ctx.new_page();await pg.goto(URL);await pg.wait_for_timeout(4000);await pg.screenshot(path='shots/audit/rotate.png')
    if not await pg.evaluate('PORTRAIT()'):F.append('rotate: portrait not detected')
    await pg.set_viewport_size({'width':844,'height':390});await pg.wait_for_timeout(1200)
    if await pg.evaluate('PORTRAIT()'):F.append('rotate: still portrait after rotation')
    await b.close()
  U=list(dict.fromkeys(F));print('texts checked',N);print('FAILS:',len(U));print('\n'.join(U[:60]))
asyncio.run(main())
