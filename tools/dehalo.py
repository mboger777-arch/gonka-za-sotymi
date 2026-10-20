# Убирает ореол/мягкую тень вокруг вырезок: жёсткая альфа (полупрозрачная тень -> прозрачно),
# эрозия края на 1 px и подмена цвета кромки цветом изнутри (без светлой/тёмной каймы фона).
import sys,glob,numpy as np
from PIL import Image
from scipy import ndimage as nd
SKIP={'shadow.png'}
fs=sys.argv[1:] or sorted(glob.glob('assets/sprites/*.png')+glob.glob('assets/ui/*.png'))
for f in fs:
  if f.split('/')[-1] in SKIP or 'icon' in f:continue
  im=np.array(Image.open(f).convert('RGBA')).astype(np.float32);a=im[:,:,3]
  m=a>=150;m=nd.binary_opening(m,iterations=1);m=nd.binary_fill_holes(m) if f.split('/')[-1] in() else m
  # убрать мелкие отдельные островки (остатки тени)
  lab,n=nd.label(m)
  if n>1:
    sz=nd.sum(m,lab,range(1,n+1));keep=np.isin(lab,1+np.where(sz>=max(40,sz.max()*.002))[0]);m=keep
  core=nd.binary_erosion(m,iterations=2)
  # цвет кромки = ближайший пиксель ядра
  idx=nd.distance_transform_edt(~core,return_distances=False,return_indices=True)
  rgb=im[:,:,:3].copy();ring=m&~core;rgb[ring]=im[idx[0][ring],idx[1][ring],:3]
  m2=nd.binary_erosion(m,iterations=1)
  al=nd.gaussian_filter(m2.astype(np.float32),0.6)*255;al[~m]=0
  out=np.dstack([rgb,al]).clip(0,255).astype(np.uint8);Image.fromarray(out,'RGBA').save(f,optimize=True)
  print(f,'semi->',round(((a>10)&(a<150)).mean()*100,2),'%')
