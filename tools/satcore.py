# Для круглых цветных кнопок и замка: оставить только насыщенное тело предмета (с заполнением дыр) — без запечённой серой тени.
import sys,numpy as np
from PIL import Image
from scipy import ndimage as nd
for f in sys.argv[1:]:
  im=np.array(Image.open(f).convert('RGBA')).astype(np.float32);rgb=im[:,:,:3]/255;a=im[:,:,3]>127
  mx=rgb.max(2);mn=rgb.min(2);sat=(mx-mn)/(mx+1e-6)
  s=a&(sat>0.28)&(mx>0.25);s=nd.binary_closing(s,iterations=4);s=nd.binary_fill_holes(s)
  lab,n=nd.label(s);sz=nd.sum(s,lab,range(1,n+1));s=lab==(1+int(np.argmax(sz)))
  m=nd.binary_dilation(s,iterations=2)&a
  al=nd.gaussian_filter(nd.binary_erosion(m,iterations=1).astype(np.float32),0.6)*255;al[~m]=0
  Image.fromarray(np.dstack([im[:,:,:3],al]).clip(0,255).astype(np.uint8),'RGBA').save(f,optimize=True);print(f,int((a&~m).sum()))
