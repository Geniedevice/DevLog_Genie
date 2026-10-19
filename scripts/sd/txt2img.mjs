// ComfyUI txt2img(Illustrious-XL + 스타레일 화풍 LoRA), SDXL 기본 해상도 그대로(업스케일하지 않아 선이 무르지 않다).
//   node scripts/sd/txt2img.mjs <출력.png> <seed> "<캐릭터 태그>" [lora 세기 = 1.0] [크기 = 1024]
import fs from 'node:fs';

const [out, seed, tags, lora = '1.0', size = '1024'] = process.argv.slice(2);
const HOST = 'http://127.0.0.1:8188';
const POS = [
  'masterpiece, best quality, very aware, absurdres, newest',
  'Honkai: Star Rail style, official art, game cg',
  '1girl, solo, upper body, front view, facing viewer, looking at viewer, symmetrical, straight-on, centered, head and shoulders, arms at sides',
  tags,
  'eyes open, closed mouth, light smile',
  'sharp lineart, clean lineart, cel shading, hard shadows, flat colors, crisp, high detail eyes',
  'simple background, white background',
].join(', ');
const NEG = 'heterochromia, mismatched eyes, lowres, worst quality, low quality, blurry, depth of field, soft focus, bokeh, bad anatomy, bad hands, hands, extra fingers, text, watermark, signature, logo, jpeg artifacts, profile, side view, looking away, 3d, realistic, multiple views, cropped head, hat';

const ss = +size;
const prompt = {
  1: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: 'Illustrious-XL-v0.1.safetensors' } },
  10: { class_type: 'LoraLoader', inputs: { model: ['1', 0], clip: ['1', 1], lora_name: 'hsr_style_illustrious.safetensors', strength_model: +lora, strength_clip: +lora } },
  2: { class_type: 'CLIPTextEncode', inputs: { clip: ['10', 1], text: POS } },
  3: { class_type: 'CLIPTextEncode', inputs: { clip: ['10', 1], text: NEG } },
  5: { class_type: 'EmptyLatentImage', inputs: { width: ss, height: ss, batch_size: 1 } },
  6: { class_type: 'KSampler', inputs: { model: ['10', 0], positive: ['2', 0], negative: ['3', 0], latent_image: ['5', 0], seed: +seed, steps: 32, cfg: 6, sampler_name: 'euler_ancestral', scheduler: 'normal', denoise: 1 } },
  7: { class_type: 'VAEDecode', inputs: { samples: ['6', 0], vae: ['1', 2] } },
  8: { class_type: 'SaveImage', inputs: { images: ['7', 0], filename_prefix: 'txt2img' } },
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
