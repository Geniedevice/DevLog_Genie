// 색면 위주 데포르메 그림을 색 + 위치로 파츠 마스크(hair.png, orn.png)로 나눈다 — SAM 대신.
//   node scripts/live2d/colorseg.mjs <배경 뺀 원본.png> <출력 폴더>
// 회색(저채도) = 머리카락, 밝고 따뜻한 색 = 피부, 진한 보라·파랑 / 머리띠 띠 = 장식. 검정 외곽선은 이웃 파츠를 따라간다.
// 좌표 힌트(머리띠·꽃·리본 위치, 턱선, 얼굴 윤곽)는 art/jiny/parts.json 의 "colorseg".
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const spec = JSON.parse(fs.readFileSync('art/jiny/parts.json', 'utf8'));
const cs = spec.colorseg, N = spec.size, P = N * N;
const [inP, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const src = await sharp(inP).ensureAlpha().raw().toBuffer();
const jawY = (x) => { const j = spec.jaw; for (let i = 1; i < j.length; i++) if (x <= j[i][0]) { const t = (x - j[i - 1][0]) / (j[i][0] - j[i - 1][0]); return j[i - 1][1] + t * (j[i][1] - j[i - 1][1]); } return j.at(-1)[1]; };
const inE = ([cx, cy, rx, ry]) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
const hull = inE([...spec.faceHull.center, ...spec.faceHull.radius]);
const eyes = ['L', 'R'].map((s) => inE(spec.eyes[s].region)), mouth = inE(spec.mouth.region);
const flower = inE(cs.flower), headband = [inE(cs.headband.outer), inE(cs.headband.inner)];
const inBox = (b) => (x, y) => x >= b[0] && y >= b[1] && x < b[0] + b[2] && y < b[1] + b[3];
const ribbons = cs.ribbons.map(inBox);

// 0 = 투명, 1 = 얼굴, 2 = 머리카락, 3 = 장식, 4 = 몸, 9 = 미정(검정 선)
const FACE = 1, HAIR = 2, ORN = 3, BODY = 4, TBD = 9;
const lab = new Uint8Array(P);
for (let y = 0, i = 0; y < N; y++) for (let x = 0; x < N; x++, i++) {
  if (src[i * 4 + 3] < 8) continue;
  const r = src[i * 4], g = src[i * 4 + 1], b = src[i * 4 + 2];
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), S = mx - mn, L = 0.299 * r + 0.587 * g + 0.114 * b;
  const skin = r > 225 && g > 195 && b > 180 && r - b >= 10, white = L > 236 && S < 22, sat = S > 70, dark = L < 105;
  const grey = !skin && !white && !sat && !dark && S < 45;
  const head = y < jawY(x);
  let c;
  if (head) {
    if (eyes.some((e) => e(x, y)) || mouth(x, y)) c = dark ? TBD : FACE;
    else if (hull(x, y)) c = skin || white ? FACE : grey ? HAIR : sat ? FACE : TBD;
    else if (headband[0](x, y) && !headband[1](x, y) && !grey) c = ORN;
    else if (flower(x, y) && !grey) c = ORN;
    else if (ribbons.some((f) => f(x, y)) && (sat || dark)) c = ORN;
    else c = dark ? TBD : HAIR;
  } else {
    const hairCol = x < cs.hairX[0] || x > cs.hairX[1] || cs.strands.some((s) => inBox(s)(x, y));
    c = grey && hairCol && r >= b - 6 ? HAIR : dark ? TBD : BODY;
  }
  lab[i] = c;
}
// 미정(선) 픽셀은 이웃에서 가장 많은 파츠를 따라간다(바깥쪽부터 여러 번)
for (let pass = 0; pass < 12; pass++) {
  let changed = 0;
  const next = lab.slice();
  for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
    const i = y * N + x;
    if (lab[i] !== TBD) continue;
    const cnt = [0, 0, 0, 0, 0];
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const yy = y + dy, xx = x + dx; if (yy < 0 || xx < 0 || yy >= N || xx >= N) continue; const l = lab[yy * N + xx]; if (l && l < 5) cnt[l]++; }
    let best = 0; for (let k = 1; k < 5; k++) if (cnt[k] > cnt[best]) best = k;
    if (best) { next[i] = best; changed++; }
  }
  lab.set(next);
  if (!changed) break;
}
for (let y = 0, i = 0; y < N; y++) for (let x = 0; x < N; x++, i++) if (lab[i] === TBD) lab[i] = y < jawY(x) ? HAIR : BODY;

const save = (k, f) => { const m = Buffer.alloc(P); for (let i = 0; i < P; i++) m[i] = lab[i] === k ? 255 : 0; return sharp(m, { raw: { width: N, height: N, channels: 1 } }).png().toFile(path.join(out, f)); };
await Promise.all([save(HAIR, 'hair.png'), save(ORN, 'orn.png')]);
const count = [0, 0, 0, 0, 0]; for (let i = 0; i < P; i++) if (lab[i] < 5) count[lab[i]]++;
console.log('face', count[1], 'hair', count[2], 'orn', count[3], 'body', count[4]);
