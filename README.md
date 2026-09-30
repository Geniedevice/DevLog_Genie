# Genie Devlog

Unreal Engine 게임 클라이언트 개발 기록. **https://geniedevice.github.io/DevLog_Genie/**

판타지 "모험가 길드" 콘셉트의 Astro 정적 사이트. 글 하나가 토벌 게시판에 꽂힌 **의뢰서** 한 장입니다.
`main` 에 push 하면 GitHub Actions 가 빌드해서 GitHub Pages 로 배포합니다.

| 영역 | 구성 |
| --- | --- |
| 디자인 토큰 | [shadcn/ui](https://ui.shadcn.com) 식 시맨틱 쌍(`--background`/`--foreground`, `--card`, `--primary` …) + 판타지 확장(`--parchment`, `--wood`, `--gold`) — `src/styles/tokens.css`. 밤(다크)·낮(라이트) |
| 컴포넌트 | shadcn 구조(Button 변형, Badge, Card, Tabs, Breadcrumb, Kbd, Command 팔레트)를 순수 CSS 로 — `src/styles/global.css` |
| 애니메이션 | [anime.js](https://animejs.com) v4 — `src/scripts/fx.ts` 한 곳에 모음. `prefers-reduced-motion` 이면 전부 끔 |

### 의뢰서 수치는 자동 계산

| 표시 | 계산 (`src/lib/quest.ts`) |
| --- | --- |
| 등급 S/A/B/C | 읽는 시간 12분↑ / 6분↑ / 3분↑ / 그 외 |
| 보상 EXP | 분당 250 |
| 의뢰 No. | 오래된 글부터 001 — 새 글이 생겨도 기존 번호는 유지 |
| 도장 | 공개 글 "토벌 완료", 초안 "모집 중" |
| 긴급 의뢰 | `pinned: true` 인 글(없으면 최신 글)이 게시판 맨 위에 크게 |

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
| `cover` | | 썸네일 `./cover.png`. 없으면 카테고리 색 셰이프 아트. 링크 미리보기(OG)에도 쓰임 |
| `coverAlt` | | 썸네일 대체 텍스트 |
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
- 댓글창 색은 `public/giscus/{light,dark}.css` (길드 팔레트). 색을 바꾸면 `node scripts/giscus-theme.mjs` 로 재생성
- ⚠️ 로컬 dev 에서는 CORS 때문에 giscus 기본 테마로 보입니다(배포 사이트에서만 커스텀 테마)
- ⚠️ 동작하려면 [giscus 앱](https://github.com/apps/giscus)이 이 레포에 설치돼 있어야 합니다.

## 최초 배포 설정

레포 Settings → Pages → Build and deployment → Source 를 **GitHub Actions** 로.
