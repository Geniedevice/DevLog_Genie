# SAM(rembg "sam") 점 프롬프트로 파츠 마스크를 딴다. python seg.py <이미지.png> <parts.json> <출력 폴더>
# parts.json: {"sam": {"face": {"pos": [[x, y], ...], "neg": [[x, y], ...]}, ...}  → <출력>/<id>.png (흰색 = 파츠)
import json, os, sys
from PIL import Image
from rembg import new_session, remove

img_p, parts_p, out_dir = sys.argv[1:4]
os.makedirs(out_dir, exist_ok=True)
img = Image.open(img_p).convert("RGB")
session = new_session("sam")
spec = json.load(open(parts_p, encoding="utf-8"))
for pid, pr in spec.get("sam", spec).items():  # art/jiny/parts.json 의 "sam" 또는 그 자체
    prompt = [{"type": "point", "data": p, "label": 1} for p in pr["pos"]] + [{"type": "point", "data": p, "label": 0} for p in pr.get("neg", [])]
    mask = remove(img, session=session, sam_prompt=prompt, only_mask=True)
    mask.save(os.path.join(out_dir, f"{pid}.png"))
    print("mask", pid)
