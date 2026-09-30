// 픽셀 폰트(Galmuri11 Bold)를 영문·숫자·기호만 남겨 수 KB 로 줄인다. 원본은 한글까지 들어 있어 ~170KB.
// 픽셀 폰트는 HUD·머리말 같은 영문 UI 에만 쓰므로 한글은 필요 없다. 글자를 추가하려면 CHARS 를 고치고 다시 실행.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import subsetFont from 'subset-font';

const CHARS = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('') + '·★♥▶◀▲▼■□●○…';
const src = readFileSync('node_modules/galmuri/dist/Galmuri11-Bold.woff2');
const out = await subsetFont(src, CHARS, { targetFormat: 'woff2' });
mkdirSync('public/fonts', { recursive: true });
writeFileSync('public/fonts/galmuri11-bold-latin.woff2', out);
console.log(`public/fonts/galmuri11-bold-latin.woff2  ${src.length} → ${out.length} bytes`);
