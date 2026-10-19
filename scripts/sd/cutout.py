# 애니 일러스트 배경 제거(rembg isnet-anime). python cutout.py <입력.png> <출력.png>
import sys
from PIL import Image
from rembg import new_session, remove

src, dst = sys.argv[1], sys.argv[2]
session = new_session("isnet-anime")
out = remove(Image.open(src).convert("RGB"), session=session, post_process_mask=True)
out.save(dst)
print("wrote", dst, out.size)
