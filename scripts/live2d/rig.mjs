// 파츠 레이어(layers.mjs 결과) → Live2D 식 Rev2D 리그. node scripts/live2d/rig.mjs <레이어 폴더> <출력 jiny.r2d.json>
// 레이어마다 이동량이 다른 구면 회전으로 고개를 돌린다: 앞머리 > 얼굴 > 옆머리 > 뒷머리. 캐릭터별 값은 art/jiny/parts.json 의 "rig".
// 이게 한 장을 통째로 휘는 방식과의 차이 — 파츠가 서로 다른 거리만큼 움직여서 입체가 생긴다.
import fs from 'node:fs';
import path from 'node:path';

const [dir, outP] = process.argv.slice(2);
const rects = JSON.parse(fs.readFileSync(path.join(dir, 'layers.json'), 'utf8'));
const spec = JSON.parse(fs.readFileSync('art/jiny/parts.json', 'utf8'));
const N = spec.size;
const RG = spec.rig;
const C = RG.center, R = RG.radius; // 머리 구의 중심·반지름(source 픽셀)
const PHI = RG.phi;                  // AngleX/Y = ±30 일 때 회전(라디안)
// 레이어별 설정: depth = 얼굴 대비 이동 배율(1 = 얼굴, >1 앞으로 나온 것, <1 머리 뒤쪽), parent(head·body·face·eyes), grid(워프 칸 수), sway(물리 파라미터)
const L = Object.fromEntries(Object.entries(RG.layers).filter(([id]) => rects[id]));
const SWAY = RG.sway; // 파라미터 → 끝 흔들림(px)

const m = { format: 'rev2d', version: 1, meta: { name: 'jiny', width: N, height: N, background: 'transparent', fps: 30, author: 'GENIE LAB', description: 'JINY: Live2D 식 파츠 분리 리그(scripts/live2d). 레이어별 깊이 구면 회전, 머리카락·리본 물리.' },
  parameters: [], bones: [], warps: [], parts: [], bindings: [], physics: [], animations: [], textures: [] };
const param = (id, min, max, def, group) => m.parameters.push({ id, min, max, default: def, group });
param('AngleX', -30, 30, 0, 'Face'); param('AngleY', -30, 30, 0, 'Face'); param('AngleZ', -30, 30, 0, 'Face');
param('EyeLOpen', 0, 1, 1, 'Eyes'); param('EyeROpen', 0, 1, 1, 'Eyes'); param('EyeBallX', -1, 1, 0, 'Eyes'); param('EyeBallY', -1, 1, 0, 'Eyes');
param('MouthOpen', 0, 1, 0, 'Mouth'); param('MouthForm', -1, 1, 0, 'Mouth'); param('Cheek', 0, 1, 0, 'Face');
param('BodyAngleX', -10, 10, 0, 'Body'); param('Breath', 0, 1, 0, 'Body');
for (const h of Object.keys(SWAY)) param(h, -1, 1, 0, 'Hair');

// 뼈: 엉덩이 → 어깨선 → 목 → 머리(목 위에서 기울기)
m.bones.push(
  { id: 'root', x: RG.neck[0], y: N, length: 0 },
  { id: 'body', parent: 'root', x: 0, y: 0, rotation: -90, length: N - RG.neck[1] },
  { id: 'head', parent: 'body', x: N - RG.neck[1], y: 0, length: 300 },
);
m.bindings.push(
  { target: 'bone:head.rotation', params: ['AngleZ'], keys: [{ at: [-30], value: -7 }, { at: [30], value: 7 }] },
  { target: 'bone:body.rotation', params: ['BodyAngleX'], keys: [{ at: [-10], value: -91.8 }, { at: [10], value: -88.2 }] },
);

const pad = (r, p) => [r[0] - p, r[1] - p, r[2] + 2 * p, r[3] + 2 * p];
const lattice = (rect, cols, rows) => { const pts = []; for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) pts.push([rect[0] + (rect[2] * i) / cols, rect[1] + (rect[3] * j) / rows]); return pts; };
// 구면 회전 오프셋: 머리 구 위의 점이 φ 만큼 돌 때의 화면 이동 × 레이어 배율 k
const sphere = (p, k, ax, ay) => {
  const rx = R[0], ry = R[1], sgn = k;
  const u = Math.max(-0.97, Math.min(0.97, (p[0] - C[0]) / rx)), v = Math.max(-0.97, Math.min(0.97, (p[1] - C[1]) / ry));
  const fx = (ax / 30) * PHI.x, fy = (ay / 30) * PHI.y;
  const dx = sgn * rx * (Math.sin(Math.asin(u) + fx) - u) * Math.cos(Math.asin(v) * 0.6);
  const dy = -sgn * ry * (Math.sin(Math.asin(v) + fy) - v);
  return [dx, dy];
};
const r1 = (v) => Math.round(v * 100) / 100;

// ── 텍스처·워프·파츠
for (const [id, cfg] of Object.entries(L)) {
  const rect = rects[id];
  if (!rect) throw new Error(`layer ${id} missing in layers.json`);
  m.textures.push({ id, path: `textures/${id}.png`, width: rect[2], height: rect[3] });
  let parent = cfg.parent;
  if (cfg.grid) {
    const wid = `${id}Warp`, wr = pad(rect, 24), n = cfg.grid;
    m.warps.push({ id: wid, parent: cfg.parent === 'body' ? 'body' : 'head', rect: wr.map(Math.round), cols: n, rows: n });
    parent = wid;
    const pts = lattice(wr.map(Math.round), n, n);
    if (cfg.depth !== undefined) {
      const keys = [];
      for (const ay of [-30, 0, 30]) for (const ax of [-30, 0, 30]) keys.push({ at: [ax, ay], value: ax || ay ? pts.flatMap((p) => sphere(p, cfg.depth, ax, ay).map(r1)) : {} });
      m.bindings.push({ target: `warp:${wid}.offsets`, params: ['AngleX', 'AngleY'], keys });
    }
    if (cfg.sway) {
      // 뿌리(위쪽)는 고정, 아래로 갈수록 크게(끝 흔들림 px 은 rig.sway)
      const amp = SWAY[cfg.sway].amp, top = wr[1];
      const off = (k) => pts.flatMap((p) => { const t = Math.abs(p[1] - top) / wr[3]; const s = amp * k * t ** 1.6; return [r1(s), r1(Math.abs(s) * 0.12)]; });
      m.bindings.push({ target: `warp:${wid}.offsets`, params: [cfg.sway], keys: [{ at: [-1], value: off(-1) }, { at: [0], value: {} }, { at: [1], value: off(1) }] });
    }
    if (id === 'body') {
      const off = pts.flatMap((p) => { const t = Math.max(0, 1 - (p[1] - RG.breath[0]) / RG.breath[1]); return [0, r1(-RG.breath[2] * t)]; });
      m.bindings.push({ target: `warp:${wid}.offsets`, params: ['Breath'], keys: [{ at: [0], value: {} }, { at: [1], value: off }] });
    }
  } else if (parent === 'face') parent = 'faceWarp';
  else if (parent === 'eyes') parent = 'eyeBallWarp';
  const cells = Math.max(2, Math.round(Math.max(rect[2], rect[3]) / 48));
  m.parts.push({ id, parent, z: cfg.z, ...(cfg.mask && { mask: [cfg.mask] }),
    shape: { type: 'image', texture: id, x: rect[0], y: rect[1], w: rect[2], h: rect[3], cols: Math.min(24, cells), rows: Math.min(24, cells) } });
}
// 눈동자: 얼굴 워프 안의 작은 워프로 시선
const eyesRect = RG.eyesRect;
m.warps.push({ id: 'eyeBallWarp', parent: 'faceWarp', rect: eyesRect, cols: 1, rows: 1 });
const eb = (dx, dy) => Array.from({ length: 4 }, () => [dx, dy]).flat();
m.bindings.push(
  { target: 'warp:eyeBallWarp.offsets', params: ['EyeBallX'], keys: [{ at: [-1], value: eb(-9, 0) }, { at: [0], value: {} }, { at: [1], value: eb(9, 0) }] },
  { target: 'warp:eyeBallWarp.offsets', params: ['EyeBallY'], keys: [{ at: [-1], value: eb(0, 5) }, { at: [0], value: {} }, { at: [1], value: eb(0, -5) }] },
);
// 눈 깜빡임: 그려 넣은 반쯤 감은 눈 → 감은 눈을 겹쳐 바꾼다(캐릭터 왼쪽 눈 = 화면 오른쪽 = R 레이어)
for (const [s, p] of [['L', 'EyeROpen'], ['R', 'EyeLOpen']]) {
  m.bindings.push(
    { target: `part:eyesClosed${s}.opacity`, params: [p], keys: [{ at: [0.15], value: 1 }, { at: [0.22], value: 0 }] },
    // 반쯤 감은 눈은 끝까지 불투명하게 두고 그 위로 감은 눈만 페이드 — 둘이 반투명하게 겹쳐 홍채가 비치지 않게
    { target: `part:eyesHalf${s}.opacity`, params: [p], keys: [{ at: [0.62], value: 1 }, { at: [0.72], value: 0 }] },
    { target: `part:iris${s}.opacity`, params: [p], keys: [{ at: [0.62], value: 0 }, { at: [0.72], value: 1 }] },
  );
}
m.bindings.push({ target: 'part:mouthOpen.opacity', params: ['MouthOpen'], keys: [{ at: [0.08], value: 0 }, { at: [0.3], value: 1 }] });
// 볼터치(벡터): 클릭하면 진해진다
for (const [s, [cx, cy]] of Object.entries(spec.cheeks)) {
  m.parts.push({ id: `blush${s}`, parent: 'faceWarp', z: 9, shape: { type: 'ellipse', cx, cy, rx: RG.blush[0], ry: RG.blush[1], detail: 4 },
    fill: { type: 'radial', center: [cx, cy], radius: RG.blush[0], stops: [[0, 'rgba(255,120,150,0.75)'], [1, 'rgba(255,120,150,0)']] }, opacity: 0 });
  m.bindings.push({ target: `part:blush${s}.opacity`, params: ['Cheek'], keys: [{ at: [0], value: 0 }, { at: [1], value: 0.9 }] });
}

// ── 물리: 고개·몸 움직임에 머리카락·리본이 늦게 따라온다
const phys = (id, out, len, stiff, damp) => m.physics.push({ id,
  inputs: [{ param: 'AngleX', type: 'x', weight: 0.8 }, { param: 'AngleZ', type: 'angle', weight: 0.5 }, { param: 'BodyAngleX', type: 'x', weight: 2 }],
  outputs: [{ param: out, type: 'angle', scale: 0.06 }], segments: [{ length: len, mass: 1 }, { length: len, mass: 1 }], damping: damp, stiffness: stiff });
for (const [p, c] of Object.entries(SWAY)) phys(p, p, c.len, c.stiff, c.damp);

// ── 대기 모션: 숨쉬기 + 몸 흔들림
const loop = (target, vals) => ({ target, keys: vals.map((v, i) => ({ t: i, v, ...(i < vals.length - 1 && { ease: 'smooth' }) })) });
m.animations.push({ id: 'idle', duration: 4, loop: true, tracks: [loop('param:Breath', [0, 0.5, 1, 0.5, 0]), loop('param:BodyAngleX', [0, 2.5, 0, -2.5, 0])] });

fs.writeFileSync(outP, JSON.stringify(m, null, 1));
console.log('wrote', outP, `${m.parts.length} parts, ${m.warps.length} warps, ${m.bindings.length} bindings`);
