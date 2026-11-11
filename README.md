# DevLog

Unreal Engine 게임 클라이언트 개발 기록. **https://geniedevice.github.io/DevLog_Genie/**

**GENIE LAB** 콘셉트(달 기지 작업실)의 게임 개발 블로그. 대표 캐릭터 **JINY**(드릴 사이드 포니테일에 선글라스를 올린 은발 소녀)가 주인공인 Astro 정적 사이트입니다.
첫 화면은 게임 타이틀 화면(장면 + 시작 메뉴)이고, 그 아래로 랜딩 페이지처럼 주제 띠 · 스크롤 문장 · 게임 프로젝트 레일이 이어진다. 글 목록은 패치노트처럼 한 줄에 글 하나, 글 페이지는 시청 페이지 구성, **통계** 페이지에는 차트와 데이터 표가 있습니다.
`main` 에 push 하면 GitHub Actions 가 빌드해서 GitHub Pages 로 배포합니다.

| 영역 | 구성 |
| --- | --- |
| 팔레트 | 달 기지 작업실의 밤: 먹색 `#121318` · Surface `#1A1B21` · Text `#ECEBE5` 위에 강조색 하나당 뜻 하나. Lamp `#F2C66D`(책상 등불 — 브랜드·이동) · Mint `#8FD4C1`(완료·성장) · Moon `#7B8CFF`(그림·차트 전용) · Rose·Sky(차트 전용). 낮은 종이 `#F4F2EC` 위에 진한 등불색. 컴포넌트에 hex 를 쓰지 않고 `src/styles/tokens.css` 토큰만 쓴다 |
| 히어로 장면 | `src/lib/scene.mjs` 를 깊이 7겹으로: ① 캔버스 밤하늘(`src/scripts/sky.ts`, 커서 별자리·별똥별) ② 달 ③ 먼 산맥 ④ 지면·기지 ⑤ 방 ⑥ JINY ⑦ 책상. 레이어마다 스크롤(anime.js `onScroll` 동기화)·마우스 시차가 다르다 |
| 랜딩 구간 | 홈 타이틀 화면 아래. `Kinetic.astro`: 태그 · 게임 이름이 큰 글자로 왼쪽으로 흐르고, 스크롤이 빠를수록 빨라지며 기운다. `Statement.astro`: 스크롤한 만큼 단어에 불이 들어오고, 숫자는 슬롯처럼 돌아 선다. `StageRail.astro`: 화면에 고정된 채 세로 스크롤이 가로 이동이 되고(판마다 트랙 매트 열림 · 그림 시차 · 스테이지가 바뀌면 RGB 글리치), 아래 경로선은 진행만큼 그려진다 |
| VFX | 타이틀 화면에 필름 그레인 · 비네트. 처음 열 때 한 번만: 노출이 올라오는 장면, 오른쪽에서 왼쪽으로 지나가는 빛샘 · 아나모픽 줄, 색수차로 갈라졌다 모이는 이름, 글자 위를 지나가는 빛. 스크롤로 떠날 때 카메라가 장면 안으로 민다. 시작 메뉴 · 스테이지(`data-iris`)를 누르면 다음 페이지가 누른 자리에서 원으로 열린다 |
| 레이아웃 | 위쪽 머리말 하나(`src/components/SiteHeader.astro`): 넓으면 메뉴 줄(밑줄이 포인터를 따라 미끄러지고 페이지를 건너갈 때도 이어진다), 좁으면 전체 화면 메뉴. 본문 폭은 `--content-max`(1200px) 한 줄에 맞춘다 |
| 마이크로 인터랙션 | `src/scripts/micro.ts`: 자석 버튼, 누른 자리 물결. 글 끝의 "다 읽었어요" 체크박스(체크 그리기·+XP) |
| 카운터·진행률 | 글 읽기 진행률 링(% · 남은 분), 홈 목록의 읽음 표시 |
| 캐릭터 | 헤르타 컨셉의 데포르메 버튜버 아바타. 로컬 ComfyUI(스타레일 화풍 LoRA)로 그린 일러스트를 **Live2D 식 파츠 16장**(앞머리·옆머리·뒷머리·장식·얼굴·눈·입·몸)으로 나누고 가려진 부분은 파츠별로 따로 그려 [Rev2D](https://github.com/RevStudio/Rev2D) 리그로 구동(`public/avatars/jiny/`, `src/scripts/jiny.ts`): 파츠별 깊이로 고개 돌리기, 숨쉬기, 커서 시선, 깜빡임, 머리카락·장식 물리. 클릭하면 깡충 + 갸웃 + 웃으며 말하기 + 볼터치. 원본·빌드 방법은 [`art/jiny/`](art/jiny/README.md) |
| 게임 요소 | 픽셀 HUD(레벨·XP 칸·연속 기록), 업적 알림, 8비트 효과음(`src/scripts/sfx.ts`, Web Audio 합성, **기본 꺼짐**) |
| 컴포넌트 | shadcn 구조(Button, Badge, Card, Chip, Breadcrumb, Kbd, Command 팔레트, Data Table)를 순수 CSS/TS 로. 아이콘은 **lucide**(shadcn 기본 세트) — `<Icon name="…" />` |
| 차트 | `src/components/charts/` — KPI(스파크라인), 영역·막대·도넛·가로막대, 레벨 게이지, 기록 잔디. 수치는 `src/lib/stats.ts` 가 빌드 때 계산 |
| 애니메이션 | [anime.js](https://animejs.com) v4 + View Transitions. 기준은 `.claude/skills` 의 video-motion-craft · remotion-motion-graphics · motion-doctrine: 이징은 역할로(도착 ease-out · 퇴장 ease-in, `--ease-*` 토큰), 퇴장은 등장보다 짧게, 페이지 이동은 왼쪽으로 흐르고 뒤로 가기만 반대, 도착한 것은 가만히(숨쉬기 · 깜빡임 · 스크롤 페이드 없음. 계속 도는 것은 장면 속 기계 · 주제 띠 · 필름 그레인뿐). `prefers-reduced-motion` 이면 전부 끔 |
| 폰트 | 전부 npm 으로 받아 자체 호스팅(외부 CDN 없음): Pretendard(본문), JetBrains Mono(코드), Galmuri11(픽셀 HUD — 영문만 남겨 2.6KB, `scripts/subset-pixel-font.mjs`) |
| 북마크 | 방문자 브라우저(localStorage)에만 저장 — `src/scripts/bookmarks.ts` |

⚠️ 기록 잔디는 **빌드한 날**을 기준으로 그린다. 글을 안 올려도 재배포하면 한 칸씩 밀린다.

### 레벨·경험치는 자동 계산 (`src/lib/quest.ts`)

| 표시 | 계산 |
| --- | --- |
| XP | 글 하나당 읽는 시간 분당 50 XP |
| Lv. | 누적 1,000 XP 마다 1 레벨 |
| 🔥 연속 기록 | 가장 최근 글 날짜부터 거꾸로, 하루도 빠짐없이 글이 있던 날 수 |

## 글 쓰기

```bash
npm run new -- "글 제목" my-post-slug
```

글 하나가 폴더 하나입니다. 이미지는 전부 그 폴더에 둡니다.

```
src/content/posts/my-post-slug/
├── index.md      ← 본문 (draft: true 로 생성됨)
├── cover.png     ← 썸네일 (16:9, 1600×900 권장)
└── shot-01.png   ← 본문 이미지: ![설명](./shot-01.png)
```

다 쓰면 `draft: false` 로 바꾸고 push. 이미지는 빌드 때 WebP·여러 크기로 자동 최적화됩니다.
서식 견본은 [`writing-guide`](src/content/posts/writing-guide/index.md) (로컬에서만 보이는 초안).

| 프런트매터 | 필수 | 설명 |
| --- | --- | --- |
| `title` | ✅ | 제목 |
| `description` | ✅ | 카드·검색·OG 에 쓰이는 요약 |
| `date` | ✅ | 작성일 `YYYY-MM-DD` |
| `cover` | | 썸네일 `./cover.png`. 없으면 분류 색 배경 + 제목. 링크 미리보기(OG)에도 쓰임 |
| `coverAlt` | | 썸네일 대체 텍스트 |
| `thumbText` | | 썸네일 위 큰 문구(유튜브식). `"타격감의 *비밀*"` — `*별표*` 부분은 등불색 강조, 줄바꿈은 `\n` |
| `pixelArt` | | 픽셀아트 커버면 `true` (확대해도 흐려지지 않게). 사진에는 쓰지 말 것 |
| `updated` | | 수정일 |
| `category` | | 기본 `Devlog`. 카테고리별 아이콘·색은 `src/lib/categories.ts` |
| `tags` | | `[GAS, 트러블슈팅]` |
| `series` | | 같은 이름끼리 묶여 글 상단에 시리즈 목차 |
| `pinned` | | 홈 맨 앞 고정 |
| `draft` | | `true` 면 배포에서 제외 |

본문에서 `> [!NOTE]` `> [!TIP]` `> [!IMPORTANT]` `> [!WARNING]` `> [!CAUTION]` 콜아웃을 쓸 수 있습니다.
이미지 바로 다음 줄을 `*캡션*` 한 줄로 쓰면 캡션이 되고, 본문 이미지는 클릭하면 크게 보입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

http://localhost:4321/DevLog_Genie/ 에서 확인. 초안도 보입니다.

### JINY 리그 고치기

원본과 다시 빌드하는 방법은 [`art/jiny/README.md`](art/jiny/README.md). 요약: `colorseg.mjs` → `layers.mjs masks` → 파츠별 인페인팅 → `layers.mjs split` → `rig.mjs` → `scripts/rev2d/bundle.mjs <Rev2D 폴더>` 로 사이트용(WebP)으로 굳혀 커밋.

## 설정

- 사이트 이름·소개·링크: `src/site.config.ts`
- 소개 페이지: `src/pages/about.astro`
- 색 토큰: `src/styles/tokens.css` — 밤(다크)·낮(라이트) 두 벌. 이름은 shadcn 규칙(표면/`-foreground` 쌍)

### 댓글

[giscus](https://giscus.app) — 글마다 GitHub Discussions 의 **Announcements** 카테고리에 스레드가 하나씩 생깁니다(경로 기준 매핑).
방문자는 GitHub 로그인 후 댓글을 달 수 있고, 스레드 관리는 레포의 Discussions 탭에서 합니다.

- 설정값: `src/site.config.ts` 의 `giscus` (`repoId` 를 비우면 꺼짐)
- 댓글창 색은 `public/giscus/{light,dark}.css` (사이트 팔레트). 색을 바꾸면 `node scripts/giscus-theme.mjs` 로 재생성
- ⚠️ 로컬 dev 에서는 CORS 때문에 giscus 기본 테마로 보입니다(배포 사이트에서만 커스텀 테마)
- ⚠️ 동작하려면 [giscus 앱](https://github.com/apps/giscus)이 이 레포에 설치돼 있어야 합니다.

## 최초 배포 설정

레포 Settings → Pages → Build and deployment → Source 를 **GitHub Actions** 로.
