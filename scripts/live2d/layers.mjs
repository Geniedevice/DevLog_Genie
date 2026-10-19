// JINY 일러스트 한 장 → Live2D 식 파츠 레이어 PNG. 좌표는 art/jiny/parts.json.
//   node scripts/live2d/layers.mjs masks <출력 폴더>
//       인페인팅용 편집 마스크(eyes.mask.png, mouth.mask.png — 불투명 = 유지, 투명 = 다시 그림)
//   node scripts/live2d/layers.mjs split <배경 뺀 원본.png> <SAM 마스크 폴더> <변형 폴더> <출력 폴더>
//       → <출력>/<레이어>.png(크롭) + layers.json(크롭 위치). 변형 폴더: eyes_closed.png, eyes_half.png, mouth_a.png(인페인팅 결과)
//
// 레이어(뒤→앞): hairBack, body, pony, ribbon, face, eyeMaskL/R, irisL/R, eyesClosedL/R, eyesHalfL/R, mouthOpen, sideL, sideR, front, glasses
// 가려졌던 곳(앞머리 밑 이마, 머리카락 밑 몸, 홍채 밑 흰자, 턱 밑 목, 머리 뒤)은 주변 색을 번지게 채운다(push-pull).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const spec = JSON.parse(fs.readFileSync('art/jiny/parts.json', 'utf8'));
const N = spec.size, P = N * N;
const [cmd, ...args] = process.argv.slice(2);

// ── 기하 도우미
const inEllipse = ([cx, cy, rx, ry]) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
const ellipseSoft = ([cx, cy, rx, ry], feather = 6) => (x, y) => {
  const d = Math.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2); // 1 = 경계
  return Math.max(0, Math.min(1, (1 - d) * Math.min(rx, ry) / feather + 0.5));
};
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

async function maskImage(fn, file) {
  const a = Buffer.alloc(P * 4);
  each((i, x, y) => { a[i * 4 + 3] = Math.round(255 * (1 - fn(x, y))); }); // 바꿀 곳 = 투명
  await sharp(a, { raw: { width: N, height: N, channels: 4 } }).png().toFile(file);
}

if (cmd === 'masks') {
  const [out] = args;
  fs.mkdirSync(out, { recursive: true });
  const eL = ellipseSoft(spec.eyes.L.region), eR = ellipseSoft(spec.eyes.R.region), m = ellipseSoft(spec.mouth.region);
  await maskImage((x, y) => Math.max(eL(x, y), eR(x, y)), path.join(out, 'eyes.mask.png'));
  await maskImage(m, path.join(out, 'mouth.mask.png'));
  console.log('wrote', out);
  process.exit(0);
}
if (cmd !== 'split') throw new Error('usage: layers.mjs masks <out> | split <full.png> <masks> <variants> <out>');

const [fullP, maskDir, varDir, out] = args;
fs.mkdirSync(out, { recursive: true });
const rgba = async (p) => (await sharp(p).ensureAlpha().raw().toBuffer());
const gray = async (p) => (await sharp(p).greyscale().blur(0.8).raw().toBuffer()); // SAM 마스크 가장자리 1px 부드럽게
const src = await rgba(fullP);
const [H, R, G] = await Promise.all(['hair', 'ribbon', 'glasses'].map((id) => gray(path.join(maskDir, `${id}.png`))));
const A = new Float32Array(P);
each((i) => { A[i] = src[i * 4 + 3] / 255; });

// ── 픽셀마다 레이어 가중치(선글라스 > 리본 > 머리카락 > 얼굴/몸)
const w = Object.fromEntries(['glasses', 'ribbon', 'front', 'sideL', 'sideR', 'pony', 'face', 'body'].map((k) => [k, new Float32Array(P)]));
const hs = spec.hairSplit;
const hullSoft = ellipseSoft([...spec.faceHull.center, ...spec.faceHull.radius], 4);
const ears = (spec.ears ?? []).map((e) => ellipseSoft(e, 4));
each((i, x, y) => {
  const g = G[i] / 255, r = (R[i] / 255) * (1 - g), h = (H[i] / 255) * (1 - g) * (1 - r), rest = 1 - g - r - h;
  w.glasses[i] = g; w.ribbon[i] = r;
  const hk = x >= hs.ponyXMin ? 'pony' : y >= hs.sideL.yMin && x < hs.sideL.xMax ? 'sideL' : y >= hs.sideR.yMin && x > hs.sideR.xMin && x < hs.sideR.xMax ? 'sideR' : 'front';
  w[hk][i] = h;
  const head = Math.max(0, Math.min(1, jawY(x) + 2 - y)); // 턱선 아래 = 몸(1px 페더)
  const inFace = Math.max(hullSoft(x, y), ...ears.map((e) => e(x, y)));
  w.face[i] = rest * head * inFace; w.front[i] += rest * head * (1 - inFace); w.body[i] = rest * (1 - head);
});

// ── push-pull 채우기: src 가중치가 있는 곳의 색을 피라미드로 번져 target 에 채운다
function pushPull(weight, target) {
  const levels = [];
  let lw = N, lh = N, c = new Float32Array(P * 3), wt = new Float32Array(P);
  each((i) => { const k = weight[i] * A[i] > 0.95 ? 1 : 0; wt[i] = k; for (let j = 0; j < 3; j++) c[i * 3 + j] = (src[i * 4 + j] / 255) * k; });
  levels.push({ w: lw, h: lh, c, wt });
  while (lw > 1 || lh > 1) {
    const nw = Math.ceil(lw / 2), nh = Math.ceil(lh / 2), nc = new Float32Array(nw * nh * 3), nwt = new Float32Array(nw * nh);
    for (let y = 0; y < lh; y++) for (let x = 0; x < lw; x++) {
      const i = y * lw + x, o = (y >> 1) * nw + (x >> 1);
      nwt[o] += wt[i]; for (let j = 0; j < 3; j++) nc[o * 3 + j] += c[i * 3 + j];
    }
    levels.push({ w: (lw = nw), h: (lh = nh), c: (c = nc), wt: (wt = nwt) });
  }
  // 거친 단계부터: 가중치 없는 곳은 위 단계 색
  let up = null;
  for (let l = levels.length - 1; l >= 0; l--) {
    const L = levels[l], col = new Float32Array(L.w * L.h * 3);
    for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
      const i = y * L.w + x, k = Math.min(1, L.wt[i]);
      for (let j = 0; j < 3; j++) {
        const own = L.wt[i] > 0 ? L.c[i * 3 + j] / L.wt[i] : 0;
        const par = up ? bilinear(up, (x + 0.5) / 2 - 0.5, (y + 0.5) / 2 - 0.5, j) : own;
        col[i * 3 + j] = own * k + par * (1 - k);
      }
    }
    up = { w: L.w, h: L.h, col };
  }
  const outc = new Uint8Array(P * 3);
  each((i) => { if (target[i]) for (let j = 0; j < 3; j++) outc[i * 3 + j] = Math.round(up.col[i * 3 + j] * 255); });
  return outc;
}

function bilinear(u, fx, fy, j) {
  const x0 = Math.max(0, Math.min(u.w - 1, Math.floor(fx))), y0 = Math.max(0, Math.min(u.h - 1, Math.floor(fy)));
  const x1 = Math.min(u.w - 1, x0 + 1), y1 = Math.min(u.h - 1, y0 + 1), tx = Math.max(0, Math.min(1, fx - x0)), ty = Math.max(0, Math.min(1, fy - y0));
  const g = (x, y) => u.col[(y * u.w + x) * 3 + j];
  return (g(x0, y0) * (1 - tx) + g(x1, y0) * tx) * (1 - ty) + (g(x0, y1) * (1 - tx) + g(x1, y1) * tx) * ty;
}

// ── 레이어 합성: 원본 픽셀(가중치 × 알파) + 채운 영역(fill, 불투명)
const layers = {};
function layer(id, weight, fill = null, fillTarget = null, fromImage = src) {
  const buf = Buffer.alloc(P * 4);
  each((i) => {
    const a = (weight ? weight[i] : 0) * (fromImage[i * 4 + 3] / 255);
    const f = fillTarget ? fillTarget[i] : 0;
    const alpha = Math.max(a, f);
    if (alpha <= 0) return;
    for (let j = 0; j < 3; j++) buf[i * 4 + j] = Math.round((fromImage[i * 4 + j] * a + (fill ? fill[i * 3 + j] : 0) * Math.max(0, f - a)) / Math.max(a + Math.max(0, f - a), 1e-6));
    buf[i * 4 + 3] = Math.round(alpha * 255);
  });
  layers[id] = buf;
}
const mask = (fn) => { const m = new Float32Array(P); each((i, x, y) => { m[i] = fn(i, x, y); }); return m; };

// 얼굴: 앞머리·옆머리 밑 피부, 홍채 밑 흰자를 채운다
const hull = inEllipse([...spec.faceHull.center, ...spec.faceHull.radius]);
const faceFillT = mask((i, x, y) => (hull(x, y) && y < jawY(x) + 2 && w.face[i] < 0.95 ? 1 : 0));
const eyeRegion = ['L', 'R'].map((s) => inEllipse(spec.eyes[s].region));
const skinSrc = mask((i, x, y) => {
  const r = src[i * 4], g = src[i * 4 + 1], b = src[i * 4 + 2];
  return w.face[i] > 0.95 && (r + g + b) / 765 > 0.72 && r >= b && !eyeRegion.some((e) => e(x, y)) ? 1 : 0;
});
const faceFill = pushPull(skinSrc, faceFillT);
const eyeOpen = {}, irisIn = {};
for (const s of ['L', 'R']) { eyeOpen[s] = inPoly(spec.eyes[s].opening); const [cx, cy, r] = spec.eyes[s].iris; irisIn[s] = inEllipse([cx, cy, r + 2, r + 2]); }
const scleraSrc = mask((i, x, y) => { for (const s of ['L', 'R']) if (eyeOpen[s](x, y) && !irisIn[s](x, y)) { const l = (src[i * 4] + src[i * 4 + 1] + src[i * 4 + 2]) / 765; return l > 0.75 ? 1 : 0; } return 0; });
const scleraT = mask((i, x, y) => (['L', 'R'].some((s) => eyeOpen[s](x, y) && irisIn[s](x, y)) ? 1 : 0));
const sclera = pushPull(scleraSrc, scleraT);
{
  const fw = new Float32Array(w.face), ft = new Float32Array(P), fc = new Uint8Array(P * 3);
  each((i) => {
    if (scleraT[i]) { fw[i] = 0; ft[i] = 1; for (let j = 0; j < 3; j++) fc[i * 3 + j] = sclera[i * 3 + j]; }
    else if (faceFillT[i]) { ft[i] = 1; for (let j = 0; j < 3; j++) fc[i * 3 + j] = faceFill[i * 3 + j]; }
  });
  layer('face', fw, fc, ft);
}
// 눈 마스크(홍채를 눈 안쪽으로 자르는 용도 — 얼굴과 같은 픽셀이라 겹쳐 그려도 안 보인다)
for (const s of ['L', 'R']) {
  const m = mask((i, x, y) => (eyeOpen[s](x, y) ? 1 : 0));
  const buf = Buffer.alloc(P * 4);
  each((i) => { if (!m[i]) return; for (let j = 0; j < 4; j++) buf[i * 4 + j] = layers.face[i * 4 + j]; });
  layers[`eyeMask${s}`] = buf;
  layer(`iris${s}`, mask((i, x, y) => (eyeOpen[s](x, y) && irisIn[s](x, y) ? 1 - Math.max(w.front[i], w.sideL[i], w.sideR[i]) : 0)));
}
// 몸: 옆머리·포니테일 밑, 턱 밑 목을 채운다(행마다 몸이 있는 x 범위 안쪽만)
const span = new Int32Array(N * 2).fill(-1);
each((i, x, y) => { if (w.body[i] * A[i] > 0.5) { if (span[y * 2] < 0) span[y * 2] = x; span[y * 2 + 1] = x; } });
const nf = spec.neckFill;
const bodyFillT = mask((i, x, y) => {
  const hair = Math.max(w.sideL[i], w.sideR[i], w.pony[i], w.front[i]);
  if (hair > 0.05 && y >= jawY(x) && span[y * 2] >= 0 && x >= span[y * 2] && x <= span[y * 2 + 1]) return 1;
  return x >= nf.x[0] && x <= nf.x[1] && y >= nf.y[0] && y < jawY(x) + 4 ? 1 : 0;
});
layer('body', w.body, pushPull(w.body, bodyFillT), bodyFillT);
// 뒷머리: 머리 실루엣(앞머리·옆머리·얼굴·선글라스) 안쪽을 머리카락 색으로 — 앞 파츠가 움직여 생기는 틈을 메운다.
// 실루엣 밖으로는 칠하지 않는다(가만히 있을 때 테두리가 비치지 않게).
{
  const hairSrc = new Float32Array(P); each((i) => { hairSrc[i] = Math.max(w.front[i], w.sideL[i], w.sideR[i]); });
  const sil = mask((i) => ((w.front[i] + w.sideL[i] + w.sideR[i] + w.face[i] + w.glasses[i]) * A[i] > 0.5 ? 1 : 0));
  layer('hairBack', null, pushPull(hairSrc, sil), sil);
}
for (const id of ['pony', 'ribbon', 'sideL', 'sideR', 'front', 'glasses']) layer(id, w[id]);

// 그려 넣은 변형(인페인팅 결과)을 눈·입 영역만 잘라 스프라이트로. 머리카락 픽셀은 빼서 머리카락 레이어가 위를 덮게.
const hairW = (i) => Math.max(w.front[i], w.sideL[i], w.sideR[i]);
for (const [id, file, regions] of [['eyesClosed', 'eyes_closed.png', ['L', 'R']], ['eyesHalf', 'eyes_half.png', ['L', 'R']], ['mouthOpen', 'mouth_a.png', ['M']]]) {
  const img = await rgba(path.join(varDir, file));
  for (const s of regions) {
    const soft = ellipseSoft(s === 'M' ? spec.mouth.region : spec.eyes[s].region, 8);
    const buf = Buffer.alloc(P * 4);
    each((i, x, y) => {
      const a = soft(x, y) * (1 - hairW(i));
      if (a <= 0) return;
      for (let j = 0; j < 3; j++) buf[i * 4 + j] = img[i * 4 + j];
      buf[i * 4 + 3] = Math.round(a * 255);
    });
    layers[s === 'M' ? id : id + s] = buf;
  }
}

// ── 크롭해서 저장
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
