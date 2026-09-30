// 사용법: npm run new -- "글 제목" [slug]
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const [title, slugArg] = process.argv.slice(2);
if (!title) {
  console.error('사용법: npm run new -- "글 제목" [slug]');
  process.exit(1);
}

const now = new Date(Date.now() + 9 * 3600 * 1000); // KST
const date = now.toISOString().slice(0, 10);
// 한글 제목은 URL 에 그대로 쓰면 퍼센트 인코딩으로 길어진다. slug 를 안 주면 날짜 기반으로 만든다.
const slug = slugArg ?? `${date}-${now.toISOString().slice(11, 16).replace(':', '')}`;
const dir = `src/content/posts/${slug}`;

if (existsSync(dir)) {
  console.error(`이미 있음: ${dir}`);
  process.exit(1);
}

mkdirSync(dir, { recursive: true });
writeFileSync(
  `${dir}/index.md`,
  `---
title: ${JSON.stringify(title)}
description: ""
date: ${date}
# cover: ./cover.png   # 이 폴더에 이미지를 넣고 주석 해제. 16:9 권장(1600x900)
# thumbText: "제목의 *강조*"   # 썸네일 위 큰 문구. *별표* 부분은 라벤더
# coverAlt: ""
category: Devlog
tags: []
draft: true
---

`,
);
console.log(`생성: ${dir}/index.md  (draft: true — 공개하려면 false 로)`);
console.log(`썸네일: ${dir}/cover.png 를 넣고 frontmatter 의 cover 주석을 해제`);
