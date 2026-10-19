# JINY 아바타 원본

사이트의 JINY(은랑 컨셉 오마주, 정면 버튜버 흉상)는 일러스트 한 장을 [Rev2D](https://github.com/RevStudio/Rev2D) 아바타로 리깅한 것이다.
여기 있는 건 다시 빌드할 때 필요한 원본뿐이고, 사이트가 읽는 결과물은 `public/avatars/jiny/` 에 있다.

| 파일 | 내용 |
| --- | --- |
| `source.png` | Codex 이미지 생성으로 만든 일러스트(1254², 투명 배경). 프롬프트는 아래 |
| `avatar.json` | 랜드마크: 머리·얼굴·눈·입·머리카락 가닥 7개·리본 진자 3개·몸. 좌표는 `source.png` 픽셀 |
| `variants/` | 그려 넣은 변형: 감은 눈, 반쯤 감은 눈, 입 "a". 생성 그림을 마스크 안쪽만 원본에 합성한 것(`scripts/rev2d/composite.mjs`) |

## 다시 빌드

```bash
node scripts/rev2d/cli.mjs avatar build art/jiny            # 레이어·모델(art/jiny/jiny.r2d.json, textures/ — git 제외)
node scripts/rev2d/cli.mjs avatar variants import art/jiny  # variants/ 를 스프라이트로
node scripts/rev2d/cli.mjs avatar poses art/jiny            # 리뷰 시트 art/jiny/review/
node scripts/rev2d/bundle.mjs <Rev2D 폴더>                  # → public/avatars/jiny/ (WebP), src/vendor/rev2d-player.js
```

`cli.mjs` 는 Rev2D CLI 래퍼다. 생성 일러스트는 불투명 픽셀 알파가 ~252 라 머리카락 마스크 임계값만 240 으로 낮춘다.
Rev2D 위치는 `REV2D_ROOT`(기본: 바탕화면 `Rev2D-main`).

변형을 새로 그릴 때: `avatar variants request art/jiny <id>` → 이미지 생성기에 `source.png`·마스크·프롬프트 → 결과를
`composite.mjs source.png 생성.png variant-requests/<id>.mask.png variants/<id>.png` 로 합성 → `variants import`.

## 일러스트 프롬프트(요지)

정면·좌우대칭 흉상(리본 끝~가슴), 청록 눈의 나른하고 자신감 있는 눈매, 입 다문 작은 미소.
은회색 머리(라벤더 그늘), 턱선 옆머리, 캐릭터 왼쪽(화면 오른쪽) 높은 사이드 포니테일 끝은 은색→코발트→인디고로 물드는 드릴 컬.
흰 삼각 무늬의 남색 리본(위로 솟은 두 고리), 머리 위로 올린 보라 사각 선글라스, 흰 화살 핀 두 개, 검정 피어싱.
코발트 어깨 패널의 검정 크롭 재킷, 흰 퍼 칼라, 핑크 네온 심전도 라인이 있는 검정 이너, 은색 지퍼.
셀 셰이딩, 글자·워터마크 없음, 투명 배경, 정사각 고해상도. 특정 캐릭터 이름이나 원본 그림은 넣지 않았다.
