// 사용법: npm run new -- "글 제목" [slug]
import { existsSync, writeFileSync } from 'node:fs';

const [title, slugArg] = process.argv.slice(2);
if (!title) {
  console.error('사용법: npm run new -- "글 제목" [slug]');
  process.exit(1);
}

const now = new Date(Date.now() + 9 * 3600 * 1000); // KST
const date = now.toISOString().slice(0, 10);
// 한글 제목은 URL 에 그대로 쓰면 퍼센트 인코딩으로 길어진다. slug 를 안 주면 날짜 기반으로 만든다.
const slug = slugArg ?? `${date}-${now.toISOString().slice(11, 16).replace(':', '')}`;
const file = `src/content/posts/${slug}.md`;

if (existsSync(file)) {
  console.error(`이미 있음: ${file}`);
  process.exit(1);
}

writeFileSync(
  file,
  `---
title: ${JSON.stringify(title)}
description: ""
date: ${date}
category: Devlog
tags: []
draft: true
---

`,
);
console.log(`생성: ${file}  (draft: true — 공개하려면 false 로)`);
