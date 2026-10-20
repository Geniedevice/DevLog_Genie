# JINY 아바타 원본

사이트의 JINY(헤르타 컨셉 오마주, 데포르메 정면 흉상)는 일러스트 한 장을 **Live2D 식 파츠 레이어로 나누고, 가려진 부분은 파츠별로 따로 그려서** [Rev2D](https://github.com/RevStudio/Rev2D) 리그로 만든 것이다.
여기 있는 건 다시 빌드할 때 필요한 원본뿐이고, 사이트가 읽는 결과물은 `public/avatars/jiny/` 에 있다.

| 파일 | 내용 |
| --- | --- |
| `source.png` | 데포르메 일러스트(1024², 투명 배경). 로컬 ComfyUI 로 생성 — 아래 "일러스트 만들기" |
| `parts.json` | 파츠 좌표(턱선·얼굴 윤곽·눈·입·머리띠·꽃·리본·옆머리 구역)와 리그 설정(`rig`: 레이어별 깊이·흔들림·목 위치) |
| `masks/` | `colorseg.mjs` 가 색 + 위치로 나눈 머리카락·장식 마스크 |
| `drawn/` | 파츠별로 따로 그린 그림(같은 모델·LoRA 인페인팅): `face`(앞머리 없는 이마) · `body`(옆머리 밑 몸, 턱 밑 목) · `sclera`(홍채 없는 흰자) · `eyes_closed` · `eyes_half` · `mouth_a` |

## 파츠(뒤 → 앞)

`hairBack` 뒷머리 바탕(머리카락 대표색 단색) · `body` 몸 · `face` 얼굴 · `eyeMask`·`iris` 흰자 클립과 홍채 · `eyesHalf`·`eyesClosed` · `mouthOpen` ·
`blush` 볼터치(벡터) · `hair` 앞머리·옆머리(한 장) · `orn` 머리띠·꽃·리본

가려졌던 곳은 번지게 채우지 않고 `drawn/` 의 그린 그림을 쓴다 — 블러가 없다.
머리카락은 직선으로 자르지 않고 한 장으로 두고(자르면 한 가닥이 끊겨 움직일 때 벌어진다), 촘촘한 워프 하나로 위치마다 다르게 움직인다: 고개를 돌릴 때 앞머리 1.05 → 아래 머리 0.88 로 부드럽게, 앞머리 끝은 살짝·옆머리 아래쪽은 크게 흔들린다. 다른 파츠 배율: 장식 1.03 · 얼굴 1 · 뒷머리 0.6 (`parts.json` 의 `rig.layers`).

## 다시 빌드

```bash
node scripts/live2d/colorseg.mjs art/jiny/source.png art/jiny/masks
node scripts/live2d/layers.mjs masks art/jiny/source.png art/jiny/masks <폴더>   # 파츠별로 다시 그릴 영역 마스크
#   → scripts/sd/inpaint.mjs 로 각 마스크를 그려 art/jiny/drawn/ 에 (아래 표)
node scripts/live2d/layers.mjs split art/jiny/source.png art/jiny/masks art/jiny/drawn art/jiny/textures
node scripts/live2d/rig.mjs art/jiny/textures art/jiny/jiny.r2d.json          # 리그(git 제외)
node scripts/rev2d/cli.mjs sheet art/jiny/jiny.r2d.json -o out.png --sweep AngleX=-30,0,30   # 확인
node scripts/rev2d/bundle.mjs <Rev2D 폴더>                                   # → public/avatars/jiny/ (WebP)
```

## 일러스트 만들기 (로컬 ComfyUI, 무료)

- 모델: Illustrious-XL v0.1 (HuggingFace OnomaAIResearch) + LoRA "Honkai: Star Rail style" (civitai.com/models/1680519, 트리거 `Honkai: Star Rail style`)
- ComfyUI 포터블 `C:\Users\start\AI\ComfyUI_windows_portable` — `run_nvidia_gpu.bat` 로 켠 뒤(127.0.0.1:8188) 스크립트가 API 로 호출
- 원본: `txt2img.mjs`(1024 그대로, 업스케일하지 않음) seed 303 →  `cutout.py`(rembg isnet-anime)
  ```
  node scripts/sd/txt2img.mjs out.png 303 "(chibi:1.4), (deformed:1.2), super deformed, big head, small body, herta (honkai: star rail), long hair, grey hair, very long hair, blunt bangs, sidelocks, big purple eyes, purple flower hair ornament, black choker, black and purple dress, white frills, cute, round face" 1.0
  ```
- 파츠 그리기(`inpaint.mjs <원본RGB> <마스크> <출력> "<태그>" <denoise> <seed> "<부정>"`, 원본RGB = 배경 제거 전):

  | 파츠 | 태그 | 부정 | seed |
  | --- | --- | --- | --- |
  | face | `chibi, (bare forehead:1.4), (no bangs:1.5), forehead, skin, eyebrows` | `hair, bangs, fringe, hair strands, headband, hat` | 7 |
  | body | `chibi, (pale neck:1.3), skin, collarbone, black choker, black dress, white frills, white sleeves, bare shoulders` | `hair, hair strand, grey hair, long hair, mouth, chin, face, dark smear` | 35 |
  | sclera | `chibi, (blank white eyes:1.5), (empty eyes:1.4), no pupils, white sclera` | `purple eyes, pupils, iris, eye highlights, colored eyes` | 7 |
  | eyes_closed | `chibi, (closed eyes:1.5), (eyes closed:1.3), eyelashes, light smile` | `open eyes, iris, pupils, purple eyes, eye highlights` | 7 |
  | eyes_half | `chibi, purple eyes, (half-closed eyes:1.4), sleepy, droopy eyelids` (d 0.95) | `wide eyes, closed eyes` | 7 |
  | mouth_a | `chibi, open mouth, :d, smile, small fang` (d 0.9) | `closed mouth` | 7 |

- 헤르타(붕괴: 스타레일) 컨셉 오마주 팬아트. 개인 블로그 마스코트 용도
