# JINY 아바타 원본

사이트의 JINY(은랑 컨셉 오마주, 정면 버튜버 흉상)는 일러스트 한 장을 [Rev2D](https://github.com/RevStudio/Rev2D) 아바타로 리깅한 것이다.
여기 있는 건 다시 빌드할 때 필요한 원본뿐이고, 사이트가 읽는 결과물은 `public/avatars/jiny/` 에 있다.

| 파일 | 내용 |
| --- | --- |
| `source.png` | 스타레일 화풍 일러스트(1536², 투명 배경). 로컬 ComfyUI 로 생성 — 아래 "일러스트 만들기" |
| `avatar.json` | 랜드마크: 머리·얼굴·눈·입·머리카락 가닥 7개·리본 진자 3개·몸. 좌표는 `source.png` 픽셀 |
| `variants/` | 그려 넣은 변형: 감은 눈, 반쯤 감은 눈, 입 "a". 같은 모델·LoRA 로 인페인팅(`scripts/sd/inpaint.mjs`)하고 마스크 안쪽만 원본에 합성(`scripts/rev2d/composite.mjs`) |

## 다시 빌드

```bash
node scripts/rev2d/cli.mjs avatar build art/jiny            # 레이어·모델(art/jiny/jiny.r2d.json, textures/ — git 제외)
node scripts/rev2d/cli.mjs avatar variants import art/jiny  # variants/ 를 스프라이트로
node scripts/rev2d/cli.mjs avatar poses art/jiny            # 리뷰 시트 art/jiny/review/
node scripts/rev2d/bundle.mjs <Rev2D 폴더>                  # → public/avatars/jiny/ (WebP), src/vendor/rev2d-player.js
```

`cli.mjs` 는 Rev2D CLI 래퍼다(머리카락 마스크 임계값을 240 으로 낮춰 생성 그림의 반투명 가장자리도 잡는다).
Rev2D 위치는 `REV2D_ROOT`(기본: 바탕화면 `Rev2D-main`).

변형을 새로 그릴 때: `avatar variants request art/jiny <id>` → 이미지 생성기에 `source.png`·마스크·프롬프트 → 결과를
`composite.mjs source.png 생성.png variant-requests/<id>.mask.png variants/<id>.png` 로 합성 → `variants import`.

## 일러스트 만들기 (로컬 ComfyUI, 무료)

- 모델: Illustrious-XL v0.1 (HuggingFace OnomaAIResearch) + LoRA "Honkai: Star Rail style" (civitai.com/models/1680519, 트리거 `Honkai: Star Rail style`, 세기 1.0)
- ComfyUI 포터블은 `C:UsersstartAIComfyUI_windows_portable` — `run_nvidia_gpu.bat` 로 켠 뒤(127.0.0.1:8188) 스크립트가 API 로 호출한다
- 순서: 이전 Codex 일러스트를 1024 img2img(denoise 0.62, seed 23) → 1536 으로 늘려 hires(denoise 0.28, seed 5) → `cutout.py`(rembg isnet-anime)로 배경 제거
  ```
  node scripts/sd/gen.mjs <입력.png> <출력 접두사> <denoise> <seed> <lora 세기>
  node scripts/sd/inpaint.mjs <원본RGB.png> art/jiny/variant-requests/<id>.mask.png <출력.png> "<표정 태그>" <denoise> <seed> "<부정 태그>"
  python scripts/sd/cutout.py <입력.png> <출력.png>     # ComfyUI 내장 python 에 rembg 설치됨
  ```
- 감은 눈은 주변이 뜬 눈이라 묻히기 쉽다: `(closed eyes:1.5)`, 부정 `open eyes, iris, pupils`, denoise 1.0
- 은랑(붕괴: 스타레일) 컨셉 오마주. 캐릭터 LoRA·공식 그림은 쓰지 않고 화풍 LoRA 와 특징 태그만 썼다
