# Проверка ударения по акустике: для слова-цели находим 2 гласных ядра (пики энергии) и сравниваем
# «силу» слогов (длительность × энергия × высота тона). score>1 — ударный второй слог.
# Использование: stress_probe.py '[["фраза","слово"],...]' who  (TK= дублей). Калибровка: часы́ (2-й), ко́сы (1-й).
import json,os,sys,subprocess,torch,soundfile as sf,numpy as np
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));src=open(R+'/tools/voicegen.py').read()
g={};exec(src[:src.index('lines=json.load')].replace('import json,os,re,subprocess,hashlib,torch,soundfile as sf,sys',''),{'json':json,'os':os,'re':__import__('re'),'subprocess':subprocess,'np':np,'__file__':R+'/tools/voicegen.py'},g)
from faster_whisper import WhisperModel
import librosa
A=WhisperModel('small',device='cpu',compute_type='int8',cpu_threads=2)
def L(f): return np.frombuffer(subprocess.run(['ffmpeg','-loglevel','error','-i',f,'-f','f32le','-ac','1','-ar','16000','-'],capture_output=True).stdout,np.float32).copy()
def score(f,word):
  a=L(f);segs=A.transcribe(a,language='ru',beam_size=3,word_timestamps=True)[0];ws=[w for s in segs for w in s.words]
  key=word.lower().replace('ё','е')[:3];cand=[w for w in ws if w.word.strip().lower().replace('ё','е').strip('.,!?').startswith(key)]
  if not cand:return None,' '.join(w.word for w in ws)
  w=cand[0];s0=int(max(0,w.start-.03)*16000);s1=int((w.end+.03)*16000);x=a[s0:s1]
  hop=160;rms=librosa.feature.rms(y=x,frame_length=400,hop_length=hop)[0];rms=np.convolve(rms,np.ones(5)/5,'same')
  f0,vf,_=librosa.pyin(x,fmin=70,fmax=500,sr=16000,frame_length=1024,hop_length=hop);f0=np.nan_to_num(f0)
  n=min(len(rms),len(f0));rms=rms[:n];f0=f0[:n];v=(f0>0)
  # гласные ядра: озвученные участки с высокой энергией
  th=rms[v].max()*.35 if v.any() else rms.max()*.35;m=v&(rms>th)
  runs=[];i=0
  while i<n:
    if m[i]:
      j=i
      while j<n and m[j]:j+=1
      if j-i>=3:runs.append((i,j))
      i=j
    else:i+=1
  if len(runs)<2:return None,w.word+f' runs={len(runs)}'
  runs=sorted(sorted(runs,key=lambda r:-(r[1]-r[0])*rms[r[0]:r[1]].mean())[:2])
  st=[(r[1]-r[0])*rms[r[0]:r[1]].mean()*np.median(f0[r[0]:r[1]]) for r in runs]
  return round(st[1]/st[0],2),w.word
if __name__=='__main__':
  import torch
  from qwen_tts import Qwen3TTSModel
  torch.set_num_threads(7);M=Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-Base',device_map='cpu',dtype=torch.float32)
  V=json.loads(sys.argv[1]);who=sys.argv[2];P=M.create_voice_clone_prompt(ref_audio=g['REF'][who][0],ref_text=g['REF'][who][1],x_vector_only_mode=False)
  os.makedirs('/tmp/sp',exist_ok=True)
  for vi,(t,word) in enumerate(V):
    for take in range(int(os.environ.get('TK','2'))):
      torch.manual_seed(700+take*31);wv,sr=M.generate_voice_clone(text=t,language='Russian',voice_clone_prompt=P,non_streaming_mode=True,temperature=0.55,max_new_tokens=max(80,int(len(t)*1.8)+40))
      raw=f'/tmp/sp/{vi}_{take}.wav';sf.write(raw,wv[0],sr);fin=raw[:-4]+'.mp3';subprocess.run(['ffmpeg','-y','-loglevel','error','-i',raw,'-af',g['CHAIN'],'-ac','1','-ar','24000','-b:a','64k',fin],check=True)
      sc,ww=score(fin,word);print(json.dumps({'v':vi,'take':take,'t':t,'score':sc,'heard':ww,'f':fin},ensure_ascii=False),flush=True)
