// ComfyUI 인페인팅(마스크 안쪽만 다시 그림, 같은 체크포인트·LoRA). node inpaint.mjs <원본RGB.png> <rev2d mask.png> <출력.png> <표정 태그> [denoise] [seed]
// rev2d 마스크: 불투명 = 유지, 투명 = 바꿔도 됨 → ComfyUI LoadImage 의 MASK(= 1 − alpha)가 곧 인페인트 영역
import fs from 'node:fs';
import path from 'node:path';

const [src, mask, out, expr, denoise = '0.9', seed = '3', negExtra = ''] = process.argv.slice(2);
const HOST = 'http://127.0.0.1:8188';
const POS = `masterpiece, best quality, very aware, absurdres, newest, Honkai: Star Rail style, 1girl, solo, upper body, front view, looking at viewer, grey hair, ${expr}, blush, cel shading, clean lineart`;
const NEG = (negExtra ? negExtra + ', ' : '') + 'heterochromia, mismatched eyes, lowres, worst quality, low quality, bad anatomy, text, watermark, blurry, jpeg artifacts, extra eyes';

async function upload(file, name) {
  const fd = new FormData();
  fd.append('image', new Blob([fs.readFileSync(file)], { type: 'image/png' }), name);
  fd.append('overwrite', 'true');
  const r = await fetch(`${HOST}/upload/image`, { method: 'POST', body: fd });
  if (!r.ok) throw new Error(`upload ${r.status}`);
  return (await r.json()).name;
}
const image = await upload(src, 'inp-src.png');
const maskName = await upload(mask, `inp-${path.basename(mask)}`);
const prompt = {
  1: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: 'Illustrious-XL-v0.1.safetensors' } },
  10: { class_type: 'LoraLoader', inputs: { model: ['1', 0], clip: ['1', 1], lora_name: 'hsr_style_illustrious.safetensors', strength_model: 1, strength_clip: 1 } },
  2: { class_type: 'CLIPTextEncode', inputs: { clip: ['10', 1], text: POS } },
  3: { class_type: 'CLIPTextEncode', inputs: { clip: ['10', 1], text: NEG } },
  4: { class_type: 'LoadImage', inputs: { image } },
  11: { class_type: 'LoadImage', inputs: { image: maskName } },
  12: { class_type: 'GrowMask', inputs: { mask: ['11', 1], expand: 4, tapered_corners: true } },
  5: { class_type: 'VAEEncode', inputs: { pixels: ['4', 0], vae: ['1', 2] } },
  13: { class_type: 'SetLatentNoiseMask', inputs: { samples: ['5', 0], mask: ['12', 0] } },
  6: { class_type: 'KSampler', inputs: { model: ['10', 0], positive: ['2', 0], negative: ['3', 0], latent_image: ['13', 0], seed: +seed, steps: 30, cfg: 6, sampler_name: 'euler_ancestral', scheduler: 'normal', denoise: +denoise } },
  7: { class_type: 'VAEDecode', inputs: { samples: ['6', 0], vae: ['1', 2] } },
  8: { class_type: 'SaveImage', inputs: { images: ['7', 0], filename_prefix: 'inpaint' } },
};
const q = await (await fetch(`${HOST}/prompt`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })).json();
if (!q.prompt_id) throw new Error(JSON.stringify(q));
for (;;) {
  await new Promise((r) => setTimeout(r, 1500));
  const h = (await (await fetch(`${HOST}/history/${q.prompt_id}`)).json())[q.prompt_id];
  if (!h) continue;
  if (h.status?.status_str === 'error') throw new Error(JSON.stringify(h.status.messages).slice(0, 2000));
  const img = h.outputs?.['8']?.images?.[0];
  if (!img) continue;
  fs.writeFileSync(out, Buffer.from(await (await fetch(`${HOST}/view?filename=${encodeURIComponent(img.filename)}&type=output`)).arrayBuffer()));
  console.log('wrote', out);
  break;
}
