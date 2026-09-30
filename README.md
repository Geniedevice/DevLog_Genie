# DevLog

Unreal Engine 게임 클라이언트 개발 기록. **https://geniedevice.github.io/DevLog_Genie/**

대표 캐릭터 **JINY**(보라 헤드폰을 쓴 흰 토끼)가 주인공인 Astro 정적 사이트. 글 목록은 유튜브식 **16:9 썸네일 그리드**, 글 페이지는 시청 페이지 구성,
**통계** 페이지에는 차트와 데이터 표가 있습니다. `main` 에 push 하면 GitHub Actions 가 빌드해서 GitHub Pages 로 배포합니다.

| 영역 | 구성 |
| --- | --- |
| 캐릭터 | `src/lib/jiny.mjs` 한 벌의 SVG 로 히어로·파비콘·OG 이미지를 모두 만든다. 움직임은 `src/scripts/jiny.ts` (깜빡임·귀·헤드폰 빛·타자·눈동자 추적, 클릭하면 점프 + 색종이 + 말풍선) |
| 디자인 토큰 | [shadcn/ui](https://ui.shadcn.com) 식 시맨틱 쌍 + 차트 팔레트 `--chart-1…5` — `src/styles/tokens.css`. 밤(다크)·낮(라이트) |
| 컴포넌트 | shadcn 구조(Button, Badge, Card, Tabs, Breadcrumb, Kbd, Command 팔레트, **Data Table**)를 순수 CSS/TS 로 |
| 차트 | `src/components/charts/` — KPI(스파크라인), 영역·막대·도넛·가로막대, 레벨 게이지, 기록 잔디. 수치는 `src/lib/stats.ts` 가 빌드 때 계산 |
| 애니메이션 | [anime.js](https://animejs.com) v4 — `src/scripts/fx.ts`, `charts.ts`, `jiny.ts`. `prefers-reduced-motion` 이면 전부 끔 |
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
| `thumbText` | | 썸네일 위 큰 문구(유튜브식). `"상태 관리의\n경계"` — 둘째 줄은 강조색 |
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
