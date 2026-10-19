import { Rig, buildRenderList } from '@rev2d/rig';
import { GlRenderer } from '@rev2d/renderer';
import { validateModel } from '@rev2d/validate';

export async function mountAvatar(canvas, modelUrl) {
  const response = await fetch(modelUrl);
  if (!response.ok) throw new Error(`Avatar model: ${response.status}`);
  const validation = validateModel(await response.json());
  if (!validation.model || validation.diagnostics.some(d => d.severity === 'error')) throw new Error('Invalid JINY rig');
  const model = validation.model;
  const textures = new Map();
  const info = {};
  await Promise.all(model.textures.map(async texture => {
    const imageResponse = await fetch(new URL(texture.path, modelUrl));
    if (!imageResponse.ok) throw new Error(`Avatar texture: ${texture.id}`);
    const bitmap = await createImageBitmap(await imageResponse.blob(), { premultiplyAlpha: 'premultiply' });
    textures.set(texture.id, {bitmap});
    info[texture.id] = {width:bitmap.width,height:bitmap.height};
  }));
  const rig = new Rig(model, {textures:info});
  const player = rig.player();
  let textureVersion = 1;
  const renderer = new GlRenderer(canvas, () => { textureVersion++; });
  const hidden = new Set();
  return {
    frame(options) {
      const width = canvas.clientWidth, height = canvas.clientHeight;
      if (!width || !height) return;
      renderer.setTextures(textures, textureVersion);
      renderer.render({
        list:buildRenderList(rig,player.update(options)),
        camera:{cx:model.meta.width/2,cy:model.meta.height/2,zoom:Math.min(width/model.meta.width,height/model.meta.height)},
        viewport:{width,height},dpr:Math.min(devicePixelRatio,2),background:'transparent',hidden,
        colors:{workspace:[0,0,0,0]},
      });
    },
    dispose() { renderer.dispose(); for(const {bitmap} of textures.values()) bitmap.close(); },
  };
}
