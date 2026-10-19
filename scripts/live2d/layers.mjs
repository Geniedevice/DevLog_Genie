// JINY 일러스트 → Live2D 식 파츠 레이어. 좌표는 art/jiny/parts.json, 가려진 곳은 파츠별로 따로 그린 그림(인페인팅)에서 가져온다.
//   node scripts/live2d/layers.mjs masks <배경 뺀 원본.png> <SAM 마스크 폴더> <출력 폴더>
//       파츠별로 따로 그릴 영역의 편집 마스크(불투명 = 유지, 투명 = 다시 그림):
//       face(앞머리·장식 밑 이마) · body(옆머리 밑 몸, 턱 밑 목) · hairBack(얼굴 자리를 뒷머리로) · sclera(홍채 뺀 흰자) · eyes · mouth
//   node scripts/live2d/layers.mjs split <원본.png> <SAM 마스크 폴더> <그린 파츠 폴더> <출력 폴더>
//       그린 파츠 폴더: face.png body.png sclera.png eyes_closed.png eyes_half.png mouth_a.png (원본과 같은 크기)
//       hairBack.png 는 선택 — 없으면 머리카락 대표색(밝은 회색 중앙값) 단색. 고개를 돌릴 때 가장자리에만 보이는 곳이라 셀 화풍엔 단색이 깔끔하다
//       → <출력>/<레이어>.png(크롭) + layers.json
//
// 레이어(뒤→앞): hairBack, body, face, eyeMaskL/R, irisL/R, eyesHalfL/R, eyesClosedL/R, mouthOpen, sideL, sideR, front, orn
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const spec = JSON.parse(fs.readFileSync('art/jiny/parts.json', 'utf8'));
const N = spec.size, P = N * N;
const [cmd, fullP, maskDir, a3, a4] = process.argv.slice(2);

const ellipseSoft = ([cx, cy, rx, ry], feather = 6) => (x, y) => {
  const d = Math.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2);
  return Math.max(0, Math.min(1, (1 - d) * Math.min(rx, ry) / feather + 0.5));
};
const inEllipse = ([cx, cy, rx, ry]) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
function inPoly(pts) {
  const xs = [], ys = [];
  for (let i = 0; i < pts.length; i += 2) xs.push(pts[i]), ys.push(pts[i + 1]);
  return (x, y) => {
    let c = false;
    for (let i = 0, j = xs.length - 1; i < xs.length; j = i++) if ((ys[i] > y) !== (ys[j] > y) && x < ((xs[j] - xs[i]) * (y - ys[i])) / (ys[j] - ys[i]) + xs[i]) c = !c;
    return c;
  };
}
const jawY = (x) => {
  const j = spec.jaw;
  for (let i = 1; i < j.length; i++) if (x <= j[i][0]) { const t = (x - j[i - 1][0]) / (j[i][0] - j[i - 1][0]); return j[i - 1][1] + t * (j[i][1] - j[i - 1][1]); }
  return j.at(-1)[1];
};
const each = (fn) => { for (let y = 0, i = 0; y < N; y++) for (let x = 0; x < N; x++, i++) fn(i, x, y); };
const mask = (fn) => { const m = new Float32Array(P); each((i, x, y) => { m[i] = fn(i, x, y); }); return m; };
const rgba = (p) => sharp(p).ensureAlpha().raw().toBuffer();
const gray = (p) => sharp(p).greyscale().raw().toBuffer();
function grow(m, r) { // 이진 마스크를 r px 넓힌다(가로·세로 최대 필터)
  const t = new Float32Array(P), o = new Float32Array(P);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let v = 0; for (let d = -r; d <= r && !v; d++) { const xx = x + d; if (xx >= 0 && xx < N && m[y * N + xx] > 0.5) v = 1; } t[y * N + x] = v; }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let v = 0; for (let d = -r; d <= r && !v; d++) { const yy = y + d; if (yy >= 0 && yy < N && t[yy * N + x] > 0.5) v = 1; } o[y * N + x] = v; }
  return o;
}

// ── 원본 픽셀을 파츠로 나눈다(장식 > 머리카락 > 얼굴 / 몸)
const src = await rgba(fullP);
const [H, O] = await Promise.all(['hair', 'orn'].map((id) => gray(path.join(maskDir, `${id}.png`))));
const A = new Float32Array(P); each((i) => { A[i] = src[i * 4 + 3] / 255; });
const w = Object.fromEntries(['orn', 'front', 'sideL', 'sideR', 'face', 'body'].map((k) => [k, new Float32Array(P)]));
const hullSoft = ellipseSoft([...spec.faceHull.center, ...spec.faceHull.radius], 3);
const sd = spec.side;
each((i, x, y) => {
  const o = O[i] / 255, h = (H[i] / 255) * (1 - o), rest = 1 - o - h;
  w.orn[i] = o;
  const side = y >= sd.yMin || (y >= sd.frameYMin && (x < sd.frameX[0] || x > sd.frameX[1]));
  w[side ? (x < sd.splitX ? 'sideL' : 'sideR') : 'front'][i] = h;
  const head = Math.max(0, Math.min(1, jawY(x) + 1.5 - y)), inFace = hullSoft(x, y);
  w.face[i] = rest * head * inFace; w.front[i] += rest * head * (1 - inFace); w.body[i] = rest * (1 - head);
});
const hairAll = (i) => Math.max(w.front[i], w.sideL[i], w.sideR[i], w.orn[i]);
const hull = inEllipse([...spec.faceHull.center, ...spec.faceHull.radius]);
const eyeOpen = {}, irisIn = {};
for (const s of ['L', 'R']) { eyeOpen[s] = inPoly(spec.eyes[s].opening); const [cx, cy, rx, ry] = spec.eyes[s].iris; irisIn[s] = inEllipse([cx, cy, rx + 2, ry + 2]); }

// 파츠별로 다시 그릴 영역(= 다른 파츠에 가려져 원본에 없는 곳)
const nf = spec.neckFill, tx = spec.torsoX;
const targets = {
  face: grow(mask((i, x, y) => (hull(x, y) && y < jawY(x) + 2 && hairAll(i) > 0.3 ? 1 : 0)), 3),
  body: grow(mask((i, x, y) => ((y >= jawY(x) - 2 && x >= tx[0] && x <= tx[1] && hairAll(i) > 0.3) || (x >= nf.x[0] && x <= nf.x[1] && y >= nf.y[0] && y <= nf.y[1]) ? 1 : 0)), 3),
  hairBack: mask((i, x, y) => ((w.face[i] + w.front[i] + w.orn[i]) * A[i] > 0.5 && y < jawY(x) + 4 ? 1 : 0)),
  sclera: grow(mask((i, x, y) => (['L', 'R'].some((s) => eyeOpen[s](x, y) && irisIn[s](x, y)) ? 1 : 0)), 2),
};

async function writeMask(m, file) { // m = 다시 그릴 곳(1) → 투명
  const a = Buffer.alloc(P * 4); each((i) => { a[i * 4 + 3] = Math.round(255 * (1 - m[i])); });
  await sharp(a, { raw: { width: N, height: N, channels: 4 } }).png().toFile(file);
}
if (cmd === 'masks') {
  const out = a3; fs.mkdirSync(out, { recursive: true });
  for (const [id, m] of Object.entries(targets)) await writeMask(m, path.join(out, `${id}.mask.png`));
  const eL = ellipseSoft(spec.eyes.L.region), eR = ellipseSoft(spec.eyes.R.region), mo = ellipseSoft(spec.mouth.region);
  await writeMask(mask((i, x, y) => Math.max(eL(x, y), eR(x, y))), path.join(out, 'eyes.mask.png'));
  await writeMask(mask((i, x, y) => mo(x, y)), path.join(out, 'mouth.mask.png'));
  console.log('masks:', [...Object.keys(targets), 'eyes', 'mouth'].join(' '));
  process.exit(0);
}
if (cmd !== 'split') throw new Error('usage: layers.mjs masks <full.png> <masks> <out> | split <full.png> <masks> <drawn> <out>');

const drawnDir = a3, out = a4;
fs.mkdirSync(out, { recursive: true });
const drawn = Object.fromEntries(await Promise.all(['face', 'body', 'sclera', 'eyes_closed', 'eyes_half', 'mouth_a'].map(async (id) => [id, await rgba(path.join(drawnDir, `${id}.png`))])));
if (fs.existsSync(path.join(drawnDir, 'hairBack.png'))) drawn.hairBack = await rgba(path.join(drawnDir, 'hairBack.png'));
else {
  const vals = [[], [], []];
  each((i) => { if (w.front[i] * A[i] > 0.95) { const L = src[i * 4] * 0.3 + src[i * 4 + 1] * 0.59 + src[i * 4 + 2] * 0.11; if (L > 120) for (let j = 0; j < 3; j++) vals[j].push(src[i * 4 + j]); } });
  const med = vals.map((v) => v.sort((a, b) => a - b)[v.length >> 1] ?? 180);
  drawn.hairBack = Buffer.alloc(P * 4); each((i) => { for (let j = 0; j < 3; j++) drawn.hairBack[i * 4 + j] = med[j]; drawn.hairBack[i * 4 + 3] = 255; });
}

// 레이어 = 원본 픽셀(가중치 × 알파) 위에, 가려졌던 곳은 따로 그린 그림의 픽셀(불투명)
const layers = {};
function layer(id, weight, fillImg, fillMask) {
  const buf = Buffer.alloc(P * 4);
  each((i) => {
    const a = (weight ? weight[i] : 0) * A[i], f = fillMask ? fillMask[i] * (1 - a) : 0, al = a + f;
    if (al <= 0) return;
    for (let j = 0; j < 3; j++) buf[i * 4 + j] = Math.round((src[i * 4 + j] * a + (fillImg ? fillImg[i * 4 + j] : 0) * f) / al);
    buf[i * 4 + 3] = Math.round(Math.min(1, al) * 255);
  });
  layers[id] = buf;
}
// 얼굴: 이마는 face.png, 홍채 자리는 sclera.png
const faceW = new Float32Array(w.face), faceFill = Buffer.alloc(P * 4), faceT = new Float32Array(P);
each((i) => {
  if (targets.sclera[i]) { faceW[i] = 0; faceT[i] = 1; for (let j = 0; j < 4; j++) faceFill[i * 4 + j] = drawn.sclera[i * 4 + j]; }
  else if (targets.face[i]) { faceT[i] = 1; for (let j = 0; j < 4; j++) faceFill[i * 4 + j] = drawn.face[i * 4 + j]; }
});
layer('face', faceW, faceFill, faceT);
for (const s of ['L', 'R']) {
  const buf = Buffer.alloc(P * 4);
  each((i, x, y) => { if (eyeOpen[s](x, y)) for (let j = 0; j < 4; j++) buf[i * 4 + j] = layers.face[i * 4 + j]; });
  layers[`eyeMask${s}`] = buf;
  layer(`iris${s}`, mask((i, x, y) => (eyeOpen[s](x, y) && irisIn[s](x, y) ? (1 - hairAll(i)) * (1 - w.body[i]) : 0)));
}
layer('body', w.body, drawn.body, targets.body);
layer('hairBack', null, drawn.hairBack, targets.hairBack);
for (const id of ['sideL', 'sideR', 'front', 'orn']) layer(id, w[id]);

// 그려 넣은 표정: 눈·입 영역만, 머리카락 픽셀은 빼서 머리카락 레이어가 위를 덮게
for (const [id, file, regs] of [['eyesClosed', 'eyes_closed', ['L', 'R']], ['eyesHalf', 'eyes_half', ['L', 'R']], ['mouthOpen', 'mouth_a', ['M']]]) {
  for (const s of regs) {
    const soft = ellipseSoft(s === 'M' ? spec.mouth.region : spec.eyes[s].region, 8), buf = Buffer.alloc(P * 4);
    each((i, x, y) => {
      const a = soft(x, y) * (1 - hairAll(i));
      if (a <= 0) return;
      for (let j = 0; j < 3; j++) buf[i * 4 + j] = drawn[file][i * 4 + j];
      buf[i * 4 + 3] = Math.round(a * 255);
    });
    layers[s === 'M' ? id : id + s] = buf;
  }
}

const meta = {};
for (const [id, buf] of Object.entries(layers)) {
  let x0 = N, y0 = N, x1 = -1, y1 = -1;
  each((i, x, y) => { if (buf[i * 4 + 3] > 2) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } });
  if (x1 < 0) { console.warn('empty layer', id); continue; }
  const rect = [x0, y0, x1 - x0 + 1, y1 - y0 + 1];
  await sharp(buf, { raw: { width: N, height: N, channels: 4 } }).extract({ left: rect[0], top: rect[1], width: rect[2], height: rect[3] }).png().toFile(path.join(out, `${id}.png`));
  meta[id] = rect;
}
fs.writeFileSync(path.join(out, 'layers.json'), JSON.stringify(meta, null, 1));
console.log('layers:', Object.keys(meta).join(' '));
