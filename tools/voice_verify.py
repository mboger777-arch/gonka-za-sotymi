# Повторная независимая ASR-проверка готовых реплик другой моделью (WM=medium): слова + числа сверяются с исходным текстом (numwer). Пишет tools/voice_verify.json
import json,os,re,sys,hashlib,subprocess,numpy as np
from faster_whisper import WhisperModel
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src=open(R+'/tools/voicegen.py').read();g={'re':re};exec(src[src.index('FIX='):src.index('lines=json.load')],g);exec(src[src.index('def norm'):src.index('if jobs:')],g)
def L(f): return np.frombuffer(subprocess.run(['ffmpeg','-loglevel','error','-i',f,'-f','f32le','-ac','1','-ar','16000','-'],capture_output=True).stdout,np.float32).copy()
A=WhisperModel(os.environ.get('WM','small'),device='cpu',compute_type='int8',cpu_threads=int(os.environ.get('CT','2')))
only=set(sys.argv[1:]);out=[]
for o in json.load(open(R+'/tools/lines.json')):
  if only and o['k'] not in only:continue
  t=g['spoken'](o);h=hashlib.sha1(f"g81|{o['who']}|{t}".encode()).hexdigest()[:8];f=f"{R}/assets/voice/{o['k']}_{h}.mp3"
  if not os.path.exists(f):continue
  hyp=' '.join(s.text for s in A.transcribe(L(f),language='ru',beam_size=5)[0])
  e=min(g['wer'](g['norm'](t),g['norm'](hyp)),g['numwer'](o['t'],t,hyp));d={'k':o['k'],'wer':round(e,3),'say':t,'hyp':hyp.strip()};out.append(d);print(json.dumps(d,ensure_ascii=False),flush=True)
json.dump(out,open(R+'/tools/voice_verify.json','w'),ensure_ascii=False,indent=0)
