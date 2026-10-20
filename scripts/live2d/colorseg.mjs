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
const ribbons = cs.ribbons.map(inBox), brows = (cs.brows ?? []).map(inBox);

// 0 = 투명, 1 = 얼굴, 2 = 머리카락, 3 = 장식, 4 = 몸, 9 = 미정(검정 선)
const FACE = 1, HAIR = 2, ORN = 3, BODY = 4, TBD = 9;
const lab = new Uint8Array(P), cand = new Uint8Array(P); // cand: 턱 아래 회색(머리카락 후보) — 검은 선은 포함하지 않는다
for (let y = 0, i = 0; y < N; y++) for (let x = 0; x < N; x++, i++) {
  if (src[i * 4 + 3] < 8) continue;
  const r = src[i * 4], g = src[i * 4 + 1], b = src[i * 4 + 2];
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), S = mx - mn, L = 0.299 * r + 0.587 * g + 0.114 * b;
  const skin = r > 225 && g > 195 && b > 180 && r - b >= 10, white = L > 236 && S < 22, sat = S > 70, dark = L < 105;
  const grey = !skin && !white && !sat && !dark && S < 45;
  const head = y < jawY(x);
  let c;
  // 리본·꽃은 턱선 위아래 상관없이 장식(턱 밑까지 늘어진 리본이 몸으로 잡히면 그 뒤 머리 가닥이 끊긴다)
  if ((ribbons.some((f) => f(x, y)) && sat) || (flower(x, y) && !grey && !dark)) c = ORN;
  else if (head) {
    if (brows.some((b) => b(x, y)) && !grey) c = FACE; // 눈썹은 통째로 얼굴(앞머리와 나뉘면 움직일 때 두 줄)
    else if (eyes.some((e) => e(x, y)) || mouth(x, y)) c = dark ? TBD : FACE;
    else if (hull(x, y)) c = skin || white ? FACE : grey ? HAIR : sat ? FACE : TBD;
    else if (headband[0](x, y) && !headband[1](x, y) && !grey) c = ORN;
    else if (flower(x, y) && !grey) c = ORN;
    else if (ribbons.some((f) => f(x, y)) && (sat || dark)) c = ORN;
    else c = dark ? TBD : HAIR;
  } else {
    // 턱 아래는 위치로 정하지 않는다: 회색이면 후보로 두고, 아래에서 머리와 이어진 가닥만 남긴다
    // 그늘진 머리카락은 밝기 70 대까지 어둡다 → 진짜 검은 선(밝기 < 60)만 빼고 채도 낮은 색을 후보로
    const hairish = !skin && !white && !sat && S < 45 && L >= 60 && r >= b - 20;
    c = hairish ? HAIR : dark ? TBD : BODY;
    if (hairish) cand[i] = 1;
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

// 턱 아래 머리카락 정리: 옷 위 회색 그림자·주름이 머리카락으로 잡혀 따로 흔들리면 몸에서 떨어져 보인다.
// ① 턱 아래 머리카락을 R px 깎았다 되살려(열기) 가는 조각을 없애고 ② 머리(턱 위)와 이어진 덩어리만 남긴다.
{
  const R = 3, below = (i) => Math.floor(i / N) >= jawY(i % N);
  const isH = (m, x, y) => x >= 0 && y >= 0 && x < N && y < N && m[y * N + x];
  const morph = (m, keep) => { // keep = true: 이웃이 하나라도 있으면(팽창), false: 이웃이 모두 있어야(침식)
    const o = new Uint8Array(P);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let v = keep ? 0 : 1;
      for (let d = -R; d <= R && v === (keep ? 0 : 1); d++) for (let e = -R; e <= R; e++) {
        const h = isH(m, x + e, y + d);
        if (keep && h) { v = 1; break; }
        if (!keep && !h) { v = 0; break; }
      }
      o[y * N + x] = v;
    }
    return o;
  };
  // 턱 위는 머리카락 라벨, 턱 아래는 회색 후보만(투표로 머리카락이 된 검은 선은 다리 역할을 못 하게)
  const hair = new Uint8Array(P); for (let i = 0; i < P; i++) hair[i] = below(i) ? cand[i] : lab[i] === HAIR ? 1 : 0;
  for (let i = 0; i < P; i++) if (below(i) && lab[i] === HAIR && !cand[i]) lab[i] = BODY;
  const opened = morph(morph(hair, false), true);
  for (let i = 0; i < P; i++) if (below(i) && hair[i] && !opened[i]) { hair[i] = 0; lab[i] = BODY; }
  // 머리에서 이어진 것만(8-이웃 범람)
  const ribbonZone = (j) => ribbons.some((f) => f(j % N, (j / N) | 0)); // 리본 테두리 선도 통과
  const seen = new Uint8Array(P), stack = [];
  for (let i = 0; i < P; i++) if (hair[i] && !below(i)) { seen[i] = 1; stack.push(i); }
  while (stack.length) {
    const i = stack.pop(), x = i % N, y = (i / N) | 0;
    for (const [e, d] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const xx = x + e, yy = y + d, j = yy * N + xx;
      // 장식(리본 등)은 머리카락 앞에 얹힌 것 — 그 밑으로 가닥이 이어지므로 통과는 하되 머리카락으로 칠하지는 않는다
      if (xx >= 0 && yy >= 0 && xx < N && yy < N && (hair[j] || lab[j] === ORN || ribbonZone(j)) && !seen[j]) { seen[j] = 1; stack.push(j); }
    }
  }
  for (let i = 0; i < P; i++) if (hair[i] && !seen[i]) lab[i] = BODY;
  // ③ 머리카락 테두리의 검은 선은 머리카락을 따라간다(안 그러면 머리카락만 움직여 선이 제자리에 남는다): 4px 안의 어두운 픽셀
  const dark = (i) => 0.299 * src[i * 4] + 0.587 * src[i * 4 + 1] + 0.114 * src[i * 4 + 2] < 110 && src[i * 4 + 3] > 8;
  for (let pass = 0; pass < 4; pass++) {
    const add = [];
    for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
      const i = y * N + x;
      if (lab[i] !== BODY || !below(i) || !dark(i)) continue;
      if (lab[i - 1] === HAIR || lab[i + 1] === HAIR || lab[i - N] === HAIR || lab[i + N] === HAIR) add.push(i);
    }
    for (const i of add) lab[i] = HAIR;
  }
}

const save = (k, f) => { const m = Buffer.alloc(P); for (let i = 0; i < P; i++) m[i] = lab[i] === k ? 255 : 0; return sharp(m, { raw: { width: N, height: N, channels: 1 } }).png().toFile(path.join(out, f)); };
await Promise.all([save(HAIR, 'hair.png'), save(ORN, 'orn.png')]);
const count = [0, 0, 0, 0, 0]; for (let i = 0; i < P; i++) if (lab[i] < 5) count[lab[i]]++;
console.log('face', count[1], 'hair', count[2], 'orn', count[3], 'body', count[4]);
