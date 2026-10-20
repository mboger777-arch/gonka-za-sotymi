# Подбор написания имени для TTS: несколько вариантов × дубли, обе ASR-модели; ищем чёткое «запятул».
import json,os,re,sys,subprocess,torch,soundfile as sf,numpy as np
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));src=open(R+'/tools/voicegen.py').read()
g={};exec(src[:src.index('lines=json.load')].replace('import json,os,re,subprocess,hashlib,torch,soundfile as sf,sys',''),{**g,'json':json,'os':os,'re':re,'subprocess':subprocess,'np':np,'__file__':R+'/tools/voicegen.py'},g)
from qwen_tts import Qwen3TTSModel
from faster_whisper import WhisperModel
torch.set_num_threads(7)
A=WhisperModel('small',device='cpu',compute_type='int8',cpu_threads=2);B=WhisperModel('medium',device='cpu',compute_type='int8',cpu_threads=2)
M=Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-Base',device_map='cpu',dtype=torch.float32)
V=json.loads(sys.argv[1]);who=sys.argv[2];P=M.create_voice_clone_prompt(ref_audio=g['REF'][who][0],ref_text=g['REF'][who][1],x_vector_only_mode=False)
def L(f): return np.frombuffer(subprocess.run(['ffmpeg','-loglevel','error','-i',f,'-f','f32le','-ac','1','-ar','16000','-'],capture_output=True).stdout,np.float32).copy()
os.makedirs('/tmp/st',exist_ok=True)
for vi,t in enumerate(V):
  for take in range(int(os.environ.get('TK','2'))):
    torch.manual_seed(500+take*13);wv,sr=M.generate_voice_clone(text=t,language='Russian',voice_clone_prompt=P,non_streaming_mode=True,temperature=0.55,max_new_tokens=max(80,int(len(t)*1.8)+40))
    raw=f'/tmp/st/{vi}_{take}.wav';sf.write(raw,wv[0],sr);fin=raw[:-4]+'.mp3';subprocess.run(['ffmpeg','-y','-loglevel','error','-i',raw,'-af',g['CHAIN'],'-ac','1','-ar','24000','-b:a','64k',fin],check=True)
    ha=' '.join(s.text for s in A.transcribe(L(fin),language='ru',beam_size=3)[0]);hb=' '.join(s.text for s in B.transcribe(L(fin),language='ru',beam_size=3)[0])
    ok=sum('запятул' in h.lower() for h in (ha,hb))
    print(json.dumps({'v':vi,'take':take,'ok':ok,'t':t,'small':ha,'medium':hb,'f':fin},ensure_ascii=False),flush=True)
