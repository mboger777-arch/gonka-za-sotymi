# Убирает запечённую светло-серую тень, прилегающую к краю вырезки (кнопки, бирка, еда, гирьки).
# Удаляются только малонасыщенные серые пиксели, связанные с внешним краем; затем снова чистая кромка.
import sys,numpy as np
from PIL import Image
from scipy import ndimage as nd
for f in sys.argv[1:]:
  im=np.array(Image.open(f).convert('RGBA')).astype(np.float32);rgb=im[:,:,:3]/255;a=im[:,:,3]>127
  mx=rgb.max(2);mn=rgb.min(2);sat=(mx-mn)/(mx+1e-6)
  grey=a&(sat<float(__import__('os').environ.get('SAT','0.16')))&(mx>0.45)
  outside=~a;seed=nd.binary_dilation(outside,iterations=1)&grey
  sh=nd.binary_propagation(seed,mask=grey)
  m=a&~sh;m=nd.binary_opening(m,iterations=2);lab,n=nd.label(m)
  if n>1:sz=nd.sum(m,lab,range(1,n+1));m=lab==(1+int(np.argmax(sz)))
  m=nd.binary_fill_holes(m)|(m)
  m=m&a
  al=nd.gaussian_filter(nd.binary_erosion(m,iterations=1).astype(np.float32),0.6)*255;al[~m]=0
  out=np.dstack([im[:,:,:3],al]).clip(0,255).astype(np.uint8);Image.fromarray(out,'RGBA').save(f,optimize=True)
  print(f,'removed',int(sh.sum()),'px')
