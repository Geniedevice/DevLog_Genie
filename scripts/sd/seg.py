# SAM(rembg "sam") 점 프롬프트로 파츠 마스크를 딴다. python seg.py <배경 뺀 이미지.png> <parts.json> <출력 폴더>
# parts.json: {"sam": {"hair": {"pos": [[x, y], ...], "neg": [[x, y], ...]}, ...}}  → <출력>/<id>.png (흰색 = 파츠)
# 떨어진 부위를 한 번에 잡으면 SAM 이 엉뚱한 덩어리를 고른다 → 양성 점 하나씩(음성 점은 모두) 따로 돌려 합친다.
# 투명 배경은 흰색으로 깔고, 결과는 원본 알파 안쪽만 남긴다.
import json, os, sys
import numpy as np
from PIL import Image
from rembg import new_session, remove

img_p, parts_p, out_dir = sys.argv[1:4]
os.makedirs(out_dir, exist_ok=True)
rgba = Image.open(img_p).convert("RGBA")
alpha = np.array(rgba)[:, :, 3] > 8
img = Image.alpha_composite(Image.new("RGBA", rgba.size, (255, 255, 255, 255)), rgba).convert("RGB")
session = new_session("sam")
spec = json.load(open(parts_p, encoding="utf-8"))
for pid, pr in spec.get("sam", spec).items():
    acc = np.zeros(alpha.shape, bool)
    neg = [{"type": "point", "data": p, "label": 0} for p in pr.get("neg", [])]
    for p in pr["pos"]:
        m = remove(img, session=session, sam_prompt=[{"type": "point", "data": p, "label": 1}] + neg, only_mask=True)
        acc |= np.array(m.convert("L")) > 127
    Image.fromarray(((acc & alpha) * 255).astype(np.uint8)).save(os.path.join(out_dir, f"{pid}.png"))
    print("mask", pid, round(float((acc & alpha).mean()), 3))
