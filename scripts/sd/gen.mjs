// ComfyUI API 로 img2img(+LoRA) 한 장. node gen.mjs <입력.png> <출력 접두사> [denoise] [seed] [lora 세기]
// 서버: http://127.0.0.1:8188 (run_nvidia_gpu.bat 로 띄운 ComfyUI)
import fs from 'node:fs';
import path from 'node:path';

const [input, outPrefix, denoise = '0.55', seed = '7', loraStrength = '1.0'] = process.argv.slice(2);
const HOST = 'http://127.0.0.1:8188';
const CKPT = 'Illustrious-XL-v0.1.safetensors';
const LORA = fs.existsSync('C:/Users/start/AI/ComfyUI_windows_portable/ComfyUI/models/loras/hsr_style_illustrious.safetensors') ? 'hsr_style_illustrious.safetensors' : null;

const STYLE = process.env.STYLE === 'v6';
const POS = STYLE ? [
  'masterpiece, best quality, very aware, absurdres, newest',
  'Honkai: Star Rail style, official art, game cg, splash art',
  '1girl, solo, upper body, front view, looking at viewer, symmetrical, straight-on, centered',
  'grey hair, silver hair, side ponytail, drill hair, ringlets, gradient hair, blue hair tips, purple hair tips, short bangs, eyes visible, sidelocks',
  'dark blue hair ribbon with halftone pattern, eyewear on head, purple-tinted rectangular sunglasses, x hair clip',
  'aqua eyes, detailed eyes, glossy eyes, half-closed eyes, smug, light smile, closed mouth, blush, stud earrings',
  'black cropped jacket, off shoulder, white fur collar, black turtleneck crop top, zipper, neon trim',
  'sharp lineart, thick outlines, cel shading, hard shadows, rim lighting, cool color palette, high contrast, vivid colors, glossy hair highlights, comic style',
  'simple background, white background',
].join(', ') : [
  'masterpiece, best quality, very aware, absurdres, newest',
  LORA ? 'Honkai: Star Rail style,' : 'honkai: star rail, official art, game cg,',
  '1girl, solo, upper body, front view, looking at viewer, symmetrical, straight-on',
  'grey hair, silver hair, side ponytail, drill hair, ringlets, gradient hair, blue hair tips, purple hair tips, short hair with long ponytail, bangs, hair between eyes',
  'dark blue hair ribbon, hair bow, eyewear on head, purple-tinted rectangular sunglasses, hair clip',
  'aqua eyes, matching eye color, half-closed eyes, smug, light smile, closed mouth, blush, stud earrings',
  'black cropped jacket, off shoulder, fur-trimmed jacket, white fur collar, black turtleneck crop top, zipper, glowing pink heartbeat line',
  'cel shading, clean lineart, sharp focus, simple background, white background',
].join(', ');
const NEG = 'heterochromia, mismatched eyes, lowres, worst quality, low quality, bad anatomy, bad hands, extra fingers, text, watermark, signature, logo, blurry, jpeg artifacts, profile, side view, looking away, hands, 3d, realistic, multiple views, cropped head';

async function upload(file) {
  const fd = new FormData();
  fd.append('image', new Blob([fs.readFileSync(file)], { type: 'image/png' }), path.basename(file));
  fd.append('overwrite', 'true');
  const r = await fetch(`${HOST}/upload/image`, { method: 'POST', body: fd });
  if (!r.ok) throw new Error(`upload ${r.status}`);
  return (await r.json()).name;
}

const image = await upload(input);
const model = LORA ? ['10', 0] : ['1', 0], clip = LORA ? ['10', 1] : ['1', 1];
const prompt = {
  1: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: CKPT } },
  ...(LORA && { 10: { class_type: 'LoraLoader', inputs: { model: ['1', 0], clip: ['1', 1], lora_name: LORA, strength_model: +loraStrength, strength_clip: +loraStrength } } }),
  2: { class_type: 'CLIPTextEncode', inputs: { clip, text: POS } },
  3: { class_type: 'CLIPTextEncode', inputs: { clip, text: NEG } },
  4: { class_type: 'LoadImage', inputs: { image } },
  5: { class_type: 'VAEEncode', inputs: { pixels: ['4', 0], vae: ['1', 2] } },
  6: { class_type: 'KSampler', inputs: { model, positive: ['2', 0], negative: ['3', 0], latent_image: ['5', 0], seed: +seed, steps: 30, cfg: 6, sampler_name: 'euler_ancestral', scheduler: 'normal', denoise: +denoise } },
  7: { class_type: 'VAEDecode', inputs: { samples: ['6', 0], vae: ['1', 2] } },
  8: { class_type: 'SaveImage', inputs: { images: ['7', 0], filename_prefix: 'jiny' } },
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
  const buf = Buffer.from(await (await fetch(`${HOST}/view?filename=${encodeURIComponent(img.filename)}&type=output`)).arrayBuffer());
  const out = `${outPrefix}${STYLE ? '-v6' : ''}-d${denoise}-s${seed}${LORA ? `-l${loraStrength}` : '-nolora'}.png`;
  fs.writeFileSync(out, buf);
  console.log('wrote', out);
  break;
}
