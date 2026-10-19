import { homedir } from 'node:os';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
const root = resolve(process.env.REV2D_ROOT || join(homedir(),'Desktop','Rev2D-main'));
const { build } = await import(pathToFileURL(join(root,'node_modules/esbuild/lib/main.js')).href);
const sources = {'@rev2d/rig':'src/core/rig.ts','@rev2d/validate':'src/core/validate.ts','@rev2d/renderer':'editor/src/gl/renderer.ts'};
await build({entryPoints:['./scripts/rev2d-avatar-entry.ts'],outfile:'src/vendor/rev2d-avatar.js',bundle:true,format:'esm',minify:true,platform:'browser',plugins:[{
 name:'rev2d-website',setup(build){
  build.onResolve({filter:/^@rev2d\//},({path})=>({path:join(root,sources[path])}));
  build.onLoad({filter:/[\\/]gl[\\/]renderer\.ts$/},async({path})=>{
   const text=await readFile(path,'utf8');
   return {contents:text.replace('alpha: false','alpha: true').replace('gl.clearColor(workspace[0], workspace[1], workspace[2], 1)','gl.clearColor(0, 0, 0, 0)').replace('this.drawBackdrop(st, input, view);',''),loader:'ts'};
  });
 }
}]});
