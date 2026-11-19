import os, sys, json
from PIL import Image, ImageChops
ROOT = sys.argv[1]
deals = json.load(open(os.path.join(ROOT,'build','deals-clean.json')))
out = os.path.join(ROOT,'assets','deals-trim'); os.makedirs(out, exist_ok=True)
fill = []
for d in deals:
    f = d['file']
    src = next((os.path.join(ROOT,'assets',k,f) for k in ('deals-hd','deals') if os.path.exists(os.path.join(ROOT,'assets',k,f))), None)
    if not src: continue
    im = Image.open(src).convert('RGB')
    w,h = im.size
    corners = [im.getpixel(p) for p in ((0,0),(w-1,0),(0,h-1),(w-1,h-1))]
    bg = max(set(corners), key=corners.count)
    diff = ImageChops.difference(im, Image.new('RGB', im.size, bg)).convert('L').point(lambda v: 255 if v > 18 else 0)
    box = diff.getbbox() or (0,0,w,h)
    l,t,r,b = box; m = 0
    box = (max(0,l-m), max(0,t-m), min(w,r+m), min(h,b+m))
    c = im.crop(box); cw, ch = c.size
    edge = [c.getpixel((x, y)) for x in range(0, cw, 3) for y in (0, ch-1)] + [c.getpixel((x, y)) for y in range(0, ch, 3) for x in (0, cw-1)]
    light = sum(1 for p in edge if min(p) > 238) / len(edge)
    if light < 0.5: fill.append(os.path.splitext(f)[0] + '.jpg')
    c.save(os.path.join(out, os.path.splitext(f)[0] + '.jpg'), quality=88)
    print(f, (w,h), '->', (box[2]-box[0], box[3]-box[1]), 'bg', bg)

json.dump(fill, open(os.path.join(out,'fill.json'),'w'))
print('fill', fill)
