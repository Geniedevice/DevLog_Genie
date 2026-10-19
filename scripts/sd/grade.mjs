// 스타레일풍 색보정: 그림자에 차가운 남보라를 섞고(밝은 곳은 그대로), 중간톤 대비·채도를 살짝 올린다.
//   node scripts/sd/grade.mjs <입력.png> <출력.png> [세기 0..1 = 0.6]
// 흰 배경(밝기 > 0.97)은 건드리지 않아 배경 제거에 영향이 없다.
import sharp from 'sharp';

const [inP, outP, k = '0.6'] = process.argv.slice(2);
const amt = +k;
const SHADOW = [52, 44, 120]; // 그림자 틴트(남보라)
const { data, info } = await sharp(inP).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const out = Buffer.alloc(data.length);
for (let i = 0; i < data.length; i += 3) {
  const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  if (l > 0.97) { out[i] = data[i]; out[i + 1] = data[i + 1]; out[i + 2] = data[i + 2]; continue; }
  const s = amt * (1 - l) ** 2 * 0.55; // 어두울수록 틴트
  const c = (v) => { const x = (v - 0.5) * (1 + 0.12 * amt) + 0.5; return x; }; // 중간톤 대비
  let rgb = [r, g, b].map((v, j) => c(v) * (1 - s) + (SHADOW[j] / 255) * s);
  const m = (rgb[0] + rgb[1] + rgb[2]) / 3;
  rgb = rgb.map((v) => m + (v - m) * (1 + 0.15 * amt)); // 채도
  for (let j = 0; j < 3; j++) out[i + j] = Math.max(0, Math.min(255, Math.round(rgb[j] * 255)));
}
await sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } }).png().toFile(outP);
console.log('wrote', outP);
