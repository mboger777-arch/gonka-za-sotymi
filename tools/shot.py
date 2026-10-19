# Скриншоты сцен: VP=844x390 python tools/shot.py title map z1 ...  -> shots/<vp>/<scene>.png
import asyncio,os,sys
from playwright.async_api import async_playwright
URL='http://127.0.0.1:18681/index.html'
async def main():
  W,H=map(int,os.environ.get('VP','844x390').split('x'));out=f'shots/{W}x{H}';os.makedirs(out,exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=True,is_mobile=True,device_scale_factor=2)
    pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    await pg.goto(URL);await pg.wait_for_function('G.scene==="title"',timeout=30000);await pg.evaluate('SV.open=5;G.mute=true')
    for a in sys.argv[1:]:
      sc,_,js=a.partition(':')
      if sc!='-':await pg.evaluate(f'G.go("{sc}")')
      if js:await pg.evaluate(js)
      await pg.wait_for_timeout(int(os.environ.get('WAIT','1500')))
      await pg.screenshot(path=f'{out}/{sc if sc!="-" else "x"}{("_"+str(abs(hash(js))%1000)) if js else ""}.png')
    print('errors:',errs[:10])
    await b.close()
asyncio.run(main())
