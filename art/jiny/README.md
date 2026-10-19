# JINY 아바타 원본

사이트의 JINY(은랑 컨셉 오마주, 정면 버튜버 흉상)는 일러스트 한 장을 **Live2D 식 파츠 레이어로 나눠** [Rev2D](https://github.com/RevStudio/Rev2D) 리그로 만든 것이다.
여기 있는 건 다시 빌드할 때 필요한 원본뿐이고, 사이트가 읽는 결과물은 `public/avatars/jiny/` 에 있다.

| 파일 | 내용 |
| --- | --- |
| `source.png` | 스타레일 화풍 일러스트(1536², 투명 배경). 로컬 ComfyUI 로 생성 — 아래 "일러스트 만들기" |
| `parts.json` | 파츠 분리 좌표: SAM 점 프롬프트, 턱선, 머리카락 구역, 얼굴 윤곽, 눈 열림 폴리곤·홍채, 입·볼 위치 |
| `masks/` | SAM 으로 딴 파츠 마스크(얼굴·머리카락·리본·선글라스) |
| `variants/` | 그려 넣은 표정: 감은 눈, 반쯤 감은 눈, 입 벌림. 같은 모델·LoRA 로 인페인팅 |

## 파츠(뒤 → 앞)

`hairBack` 뒷머리 바탕 · `body` 몸 · `pony` 드릴 포니테일 · `ribbon` 리본 · `face` 얼굴 · `eyeMask`·`iris` 눈 흰자 클립과 홍채 ·
`eyesHalf`·`eyesClosed` 그려 넣은 눈 · `mouthOpen` 벌린 입 · `blush` 볼터치(벡터) · `sideL/R` 옆머리 · `front` 앞머리 · `glasses` 선글라스

가려졌던 곳은 주변 색으로 채운다(push-pull): 앞머리 밑 이마, 홍채 밑 흰자, 머리카락 밑 몸, 턱 밑 목, 머리 실루엣 안쪽 뒷머리.
고개를 돌리면 파츠마다 이동 배율이 다른 구면 회전으로 움직여 입체가 생긴다(앞머리 1.15 · 선글라스 1.05 · 얼굴 1 · 옆머리 0.7 · 리본 0.5 · 뒷머리 0.35 · 포니테일 0.15).
머리카락·리본은 물리(진자)로 흔들린다. 배율·물리는 `scripts/live2d/rig.mjs` 맨 위.

## 다시 빌드

```bash
python scripts/sd/seg.py art/jiny/source.png art/jiny/parts.json art/jiny/masks          # SAM 마스크(그림이 바뀌었을 때만)
node scripts/live2d/layers.mjs split art/jiny/source.png art/jiny/masks art/jiny/variants art/jiny/textures
node scripts/live2d/rig.mjs art/jiny/textures art/jiny/jiny.r2d.json                    # 리그(git 제외)
node scripts/rev2d/cli.mjs sheet art/jiny/jiny.r2d.json -o out.png --sweep AngleX=-30,0,30   # 확인
node scripts/rev2d/bundle.mjs <Rev2D 폴더>                                             # → public/avatars/jiny/ (WebP)
```

`seg.py`·`cutout.py` 는 ComfyUI 내장 python(rembg 설치됨)으로 돌린다. Rev2D 위치는 `REV2D_ROOT`(기본: 바탕화면 `Rev2D-main`).

## 일러스트 만들기 (로컬 ComfyUI, 무료)

- 모델: Illustrious-XL v0.1 (HuggingFace OnomaAIResearch) + LoRA "Honkai: Star Rail style" (civitai.com/models/1680519, 트리거 `Honkai: Star Rail style`, 세기 1.15)
- ComfyUI 포터블은 `C:\Users\start\AI\ComfyUI_windows_portable` — `run_nvidia_gpu.bat` 로 켠 뒤(127.0.0.1:8188) 스크립트가 API 로 호출한다
- 순서: 이전 일러스트를 1024 img2img(`STYLE=v6`, denoise 0.62, seed 202) → 1536 hires(denoise 0.3, seed 5) → `grade.mjs`(세기 0.7: 그림자 남보라 틴트·대비·채도) → `cutout.py`(rembg isnet-anime)
  ```
  STYLE=v6 node scripts/sd/gen.mjs <입력.png> <출력 접두사> <denoise> <seed> <lora 세기>
  node scripts/sd/grade.mjs <입력.png> <출력.png> 0.7
  node scripts/live2d/layers.mjs masks <폴더>     # 눈·입 인페인팅 마스크
  node scripts/sd/inpaint.mjs <원본RGB.png> <폴더>/eyes.mask.png <출력.png> "<표정 태그>" <denoise> <seed> "<부정 태그>"
  ```
- 감은 눈은 주변이 뜬 눈이라 묻히기 쉽다: `(closed eyes:1.5)`, 부정 `open eyes, iris, pupils`, denoise 1.0. 인페인팅 결과도 `grade.mjs` 로 같은 색보정
- 은랑(붕괴: 스타레일) 컨셉 오마주. 캐릭터 LoRA·공식 그림은 쓰지 않고 화풍 LoRA 와 특징 태그만 썼다
