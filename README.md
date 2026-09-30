# Genie Devlog

Unreal Engine 게임 클라이언트 개발 기록. **https://geniedevice.github.io/DevLog_Genie/**

Astro 정적 사이트 + Material 3 디자인(Baseline 스킴, Navigation Rail / Bottom Navigation Bar).
`main` 에 push 하면 GitHub Actions 가 빌드해서 GitHub Pages 로 배포합니다.

## 글 쓰기

```bash
npm run new -- "글 제목" my-post-slug
```

`src/content/posts/my-post-slug.md` 가 `draft: true` 로 생깁니다. 다 쓰면 `draft: false` 로 바꾸고 push.
서식 견본은 [`writing-guide.md`](src/content/posts/writing-guide.md) (로컬에서만 보이는 초안).

| 프런트매터 | 필수 | 설명 |
| --- | --- | --- |
| `title` | ✅ | 제목 |
| `description` | ✅ | 카드·검색·OG 에 쓰이는 요약 |
| `date` | ✅ | 작성일 `YYYY-MM-DD` |
| `updated` | | 수정일 |
| `category` | | 기본 `Devlog`. 카테고리별 아이콘·색은 `src/lib/categories.ts` |
| `tags` | | `[GAS, 트러블슈팅]` |
| `series` | | 같은 이름끼리 묶여 글 상단에 시리즈 목차 |
| `pinned` | | 홈 맨 앞 고정 |
| `draft` | | `true` 면 배포에서 제외 |

본문에서 `> [!NOTE]` `> [!TIP]` `> [!IMPORTANT]` `> [!WARNING]` `> [!CAUTION]` 콜아웃을 쓸 수 있습니다.

## 로컬 실행

```bash
npm install
npm run dev
```

http://localhost:4321/DevLog_Genie/ 에서 확인. 초안도 보입니다.

## 설정

- 사이트 이름·소개·링크: `src/site.config.ts`
- 소개 페이지: `src/pages/about.astro`
- 색 토큰: `src/styles/tokens.css` — [Material Theme Builder](https://material-foundation.github.io/material-theme-builder/) 에서 내보낸 값으로 교체 가능

### 댓글 (선택)

[giscus](https://giscus.app) 로 GitHub Discussions 기반 댓글을 켤 수 있습니다.

1. 레포 Settings → Features → Discussions 켜기, `Comments` 카테고리 생성
2. https://github.com/apps/giscus 설치
3. giscus.app 에서 받은 `repoId`, `categoryId` 를 `src/site.config.ts` 의 `giscus` 에 입력

## 최초 배포 설정

레포 Settings → Pages → Build and deployment → Source 를 **GitHub Actions** 로.
