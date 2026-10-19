// 그려 넣은 변형 합성: 이미지 생성기는 그림 전체를 다시 그려서 마스크 밖이 미세하게 달라진다(→ import 거부).
// 마스크 안쪽만 생성 그림을 쓰고 밖은 원본 그대로: out = src·keep + gen·(1 − keep), keep = 마스크 알파(불투명 검정 = 유지)
//   node scripts/rev2d/composite.mjs <source.png> <생성.png> <mask.png> <out.png>
import sharp from 'sharp';
const [srcP, genP, maskP, outP] = process.argv.slice(2);
const raw = (p) => sharp(p).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const [src, gen, mask] = await Promise.all([srcP, genP, maskP].map(raw));
const { width, height } = src.info;
if (gen.info.width !== width || gen.info.height !== height) throw new Error(`size ${gen.info.width}x${gen.info.height} != ${width}x${height}`);
const out = Buffer.alloc(src.data.length);
for (let i = 0; i < out.length; i += 4) {
  const keep = mask.data[i + 3] / 255;
  for (let c = 0; c < 4; c++) out[i + c] = Math.round(src.data[i + c] * keep + gen.data[i + c] * (1 - keep));
}
await sharp(out, { raw: { width, height, channels: 4 } }).png().toFile(outP);
console.log('wrote', outP);
