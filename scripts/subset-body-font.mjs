// 본문 폰트(빛의 계승자 Regular·Bold)를 KS X 1001 한글 2,350자 + 영문·기호 + 사이트 글에 실제 쓰인 글자만 남겨 woff2 로 만든다.
// 원본 TTF 는 1.4MB. 목록에 없는 글자는 Pretendard 가 이어받는다(tokens.css 의 --font-sans).
// 원본 경로가 다르면 FONT_DIR 환경변수로. 글을 추가한 뒤 다시 실행하면 새 글자가 들어간다.
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import subsetFont from 'subset-font';

const FONT_DIR = process.env.FONT_DIR ?? 'C:/Users/start/Desktop/GameFile/heiroflight_fonts';
const FILES = {
  regular: `${FONT_DIR}/빛의 계승자 Regular/TTF(Window용)/HeirofLightRegular.ttf`,
  bold: `${FONT_DIR}/빛의 계승자 Bold/TTF(Window용)/HeirofLightBold.ttf`,
};

const chars = new Set();
for (let i = 32; i < 127; i++) chars.add(String.fromCharCode(i));
'·•…“”‘’—–~←→↑↓↗★☆♥▶◀▲▼■□●○✓×°±≥≤≠※'.split('').forEach((c) => chars.add(c));
const euckr = new TextDecoder('euc-kr');
for (let hi = 0xb0; hi <= 0xc8; hi++) for (let lo = 0xa1; lo <= 0xfe; lo++) chars.add(euckr.decode(new Uint8Array([hi, lo])));

// 글·컴포넌트에서 실제로 쓰인 한글·기호 (KS X 1001 밖의 글자 대비)
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
for (const f of walk('src').filter((f) => /\.(md|mdx|astro|ts|mjs)$/.test(f)))
  for (const c of readFileSync(f, 'utf8')) if (/[\u3131-\u318e\uac00-\ud7a3]/.test(c)) chars.add(c);

const text = [...chars].join('');
mkdirSync('public/fonts', { recursive: true });
for (const [name, path] of Object.entries(FILES)) {
  const src = readFileSync(path);
  const out = await subsetFont(src, text, { targetFormat: 'woff2' });
  writeFileSync(`public/fonts/heir-of-light-${name}.woff2`, out);
  console.log(`heir-of-light-${name}.woff2  ${(src.length / 1024) | 0}KB → ${(out.length / 1024) | 0}KB  (${chars.size}자)`);
}
