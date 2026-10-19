// Rev2D 리그를 WebGL2 캔버스(투명 배경)에 그리는 작은 플레이어.
// 에디터의 셰이더·패커(editor/src/gl)를 그대로 쓰고, 배경·카메라·숨김 처리만 뺐다.
// 이 파일은 사이트 빌드에 들어가지 않는다 — scripts/rev2d/bundle.mjs 가 src/vendor/rev2d-player.js 로 묶는다.
import { Rig, buildRenderList } from 'rev2d/src/core/rig.js';
import type { Model, PoseOptions } from 'rev2d/src/core/types.js';
import { FramePacker, maskModeOf } from 'rev2d/editor/src/gl/pack.js';
import { createPrograms, FLOATS_PER_VERTEX } from 'rev2d/editor/src/gl/shaders.js';

export type ViewBox = [number, number, number, number];

export function mountRig(canvas: HTMLCanvasElement, model: Model, viewBox: ViewBox) {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true, depth: false, stencil: false });
  if (!gl) throw new Error('WebGL2 unavailable');
  const rig = new Rig(model);
  const player = rig.player();
  const packer = new FramePacker();
  const programs = createPrograms(gl);
  const vao = gl.createVertexArray()!, vbo = gl.createBuffer()!, ibo = gl.createBuffer()!;
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  const stride = FLOATS_PER_VERTEX * 4;
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, stride, 8);
  gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, stride, 24);
  // 텍스처 없는 벡터 리그라 흰 1x1 텍스처 하나로 충분
  const white = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, white);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
  for (const p of [programs.mesh, programs.coverage]) { gl.useProgram(p.program); gl.uniform1i(p.uniforms.u_tex, 0); gl.uniform1i(p.uniforms.u_useTex, 0); }
  gl.useProgram(programs.mesh.program);
  gl.uniform1i(programs.mesh.uniforms.u_mask, 1);
  gl.disable(gl.CULL_FACE);
  gl.blendEquation(gl.FUNC_ADD);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  let cov: { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number } | null = null;

  function coverage(w: number, h: number) {
    if (cov && cov.w === w && cov.h === h) return cov;
    if (cov) { gl!.deleteTexture(cov.tex); gl!.deleteFramebuffer(cov.fbo); }
    const tex = gl!.createTexture()!;
    gl!.activeTexture(gl!.TEXTURE1);
    gl!.bindTexture(gl!.TEXTURE_2D, tex);
    gl!.texStorage2D(gl!.TEXTURE_2D, 1, gl!.R8, w, h);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.NEAREST);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.NEAREST);
    gl!.bindTexture(gl!.TEXTURE_2D, null);
    gl!.activeTexture(gl!.TEXTURE0);
    const fbo = gl!.createFramebuffer()!;
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
    return (cov = { tex, fbo, w, h });
  }

  /** 한 프레임: 포즈 계산(물리는 이전 호출에서 이어서) → 그리기. 캔버스 크기는 호출하는 쪽이 맞춘다. */
  function frame(opts: PoseOptions) {
    const list = buildRenderList(rig, player.update(opts));
    const W = canvas.width, H = canvas.height;
    const [vx, vy, vw, vh] = viewBox;
    const sx = 2 / vw, sy = -2 / vh;
    const view = [sx, sy, -1 - vx * sx, 1 - vy * sy] as const;
    const packed = packer.pack(list.draws, new Set());
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    gl!.viewport(0, 0, W, H);
    gl!.clearColor(0, 0, 0, 0);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.bindVertexArray(vao);
    gl!.bufferData(gl!.ARRAY_BUFFER, packed.vertices, gl!.DYNAMIC_DRAW);
    gl!.bufferData(gl!.ELEMENT_ARRAY_BUFFER, packed.indices, gl!.DYNAMIC_DRAW);
    gl!.enable(gl!.BLEND);
    for (const p of [programs.coverage, programs.mesh]) { gl!.useProgram(p.program); gl!.uniform4f(p.uniforms.u_view, ...view); } // mesh 를 마지막에 = 켜 둔 채로
    let maskedBy: unknown = null;
    for (const { item, range } of packed.draws) {
      const mode = maskModeOf(item);
      if (mode === 'skip' || range.count === 0) continue;
      let maskMode = 0;
      if (item.masks && (mode === 'mask' || mode === 'invert')) {
        if (maskedBy !== item.masks) {
          // 마스크 파츠의 알파 합을 R8 텍스처에 그려 두고, 가려지는 파츠가 그 값을 곱한다
          const c = coverage(W, H);
          gl!.bindFramebuffer(gl!.FRAMEBUFFER, c.fbo);
          gl!.clear(gl!.COLOR_BUFFER_BIT);
          gl!.useProgram(programs.coverage.program);
          for (const m of item.masks) {
            const r = packed.masks.get(m);
            if (r && r.count) gl!.drawElements(gl!.TRIANGLES, r.count, gl!.UNSIGNED_INT, r.first * 4);
          }
          gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
          gl!.activeTexture(gl!.TEXTURE1);
          gl!.bindTexture(gl!.TEXTURE_2D, c.tex);
          gl!.activeTexture(gl!.TEXTURE0);
          gl!.useProgram(programs.mesh.program);
          maskedBy = item.masks;
        }
        maskMode = mode === 'invert' ? 2 : 1;
      }
      gl!.uniform1i(programs.mesh.uniforms.u_maskMode, maskMode);
      gl!.drawElements(gl!.TRIANGLES, range.count, gl!.UNSIGNED_INT, range.first * 4);
    }
  }

  return { frame, rig };
}
