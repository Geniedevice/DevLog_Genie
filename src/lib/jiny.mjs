// JINY — 보라 헤드폰을 쓴 흰 토끼. 사이트의 대표 캐릭터.
// 색은 캐릭터 고유색이라 테마와 무관하게 고정. 같은 SVG 를 페이지(애니메이션)와 이미지 생성(sharp) 양쪽에서 쓴다.
// 움직이는 부위에는 class 를 붙여 두고 anime.js 가 잡는다(src/scripts/jiny.ts).

const C = {
  line: '#16141f',
  fur: '#f7f6fb',
  furShade: '#dedbea',
  earIn: '#e9e4f3',
  hood: '#262338',
  hoodie: '#1c1a2a',
  hoodieHi: '#2b2842',
  band: '#2e2a47',
  glow: '#a594ff',
  glowHi: '#d8d0ff',
  eye: '#15131d',
  blush: '#f4a3bf',
  nose: '#e98aa8',
  chair: '#221f33',
  chairHi: '#2f2b46',
  desk: '#d4d0e3',
  deskEdge: '#b9b4cc',
  kb: '#2a2740',
  key: '#3d3959',
};

const star = (x, y, r, fill, cls = 'spark') =>
  `<path class="${cls}" d="M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r}Z" fill="${fill}"/>`;
const bar = (x, y, w, h, rot, fill) =>
  `<rect class="spark" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${w / 2}" fill="${fill}" transform="rotate(${rot} ${x} ${y})"/>`;

function keys() {
  let s = '';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 11; c++) s += `<rect class="key" x="${122 + c * 14.5}" y="${346 + r * 8.5}" width="11" height="6" rx="1.5" fill="${C.key}"/>`;
  return s;
}

/** @param {{ id?: string, desk?: boolean, sparks?: boolean }} [o] */
export function jinySvg(o = {}) {
  const id = o.id ?? 'jiny';
  const desk = o.desk ?? true;
  const sparks = o.sparks ?? true;
  return `<svg class="jiny" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="헤드폰을 쓰고 키보드를 두드리는 흰 토끼 JINY">
  <defs>
    <filter id="${id}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <radialGradient id="${id}-aura" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="${C.glow}" stop-opacity=".35"/><stop offset="1" stop-color="${C.glow}" stop-opacity="0"/></radialGradient>
  </defs>
  <circle class="aura" cx="200" cy="200" r="190" fill="url(#${id}-aura)"/>
  ${sparks ? `<g class="sparks">
    ${star(58, 250, 9, '#5ad1ff')}${star(340, 240, 10, '#5ad1ff')}${star(356, 150, 6, '#a594ff')}${star(46, 160, 5, '#ff6fae')}${star(330, 312, 6, '#b6f36b')}
    ${bar(74, 300, 6, 22, 30, '#ffd84a')}${bar(92, 262, 5, 16, -20, '#ff6fae')}${bar(318, 280, 6, 22, -25, '#ffd84a')}${bar(342, 206, 5, 14, 40, '#ff6fae')}${bar(60, 206, 5, 14, -40, '#b6f36b')}
    <circle class="spark" cx="84" cy="228" r="4" fill="#b6f36b"/><circle class="spark" cx="356" cy="268" r="3.5" fill="#a594ff"/><circle class="spark" cx="318" cy="176" r="3" fill="#b6f36b"/>
  </g>` : ''}
  <g class="chair"><rect x="96" y="70" width="208" height="270" rx="70" fill="${C.chair}"/><rect x="112" y="84" width="176" height="240" rx="60" fill="${C.chairHi}" opacity=".55"/></g>
  <g class="bunny">
    <g class="ear ear-l" style="transform-origin:170px 128px">
      <path d="M160 132C138 92 114 38 124 16C134-4 168 18 180 70C186 96 188 116 186 132Z" fill="${C.fur}" stroke="${C.line}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M163 118C148 88 134 50 139 34C145 24 160 44 168 78C172 96 173 108 172 118Z" fill="${C.earIn}"/>
    </g>
    <g class="ear ear-r" style="transform-origin:236px 126px">
      <path d="M222 132C226 96 240 44 266 16C284-2 306 6 300 32C292 66 268 100 250 136Z" fill="${C.fur}" stroke="${C.line}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M236 118C242 88 256 52 272 34C282 24 290 32 286 44C278 70 262 96 248 120Z" fill="${C.earIn}"/>
    </g>
    <g class="body">
      <path d="M98 400C98 330 120 282 200 278C280 282 302 330 302 400Z" fill="${C.hoodie}" stroke="${C.line}" stroke-width="4"/>
      <path d="M146 290C168 282 232 282 254 290" stroke="${C.hoodieHi}" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M188 290 187 297M212 290 213 297" stroke="#cfcbe0" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="187" cy="299" r="3" fill="#cfcbe0"/><circle cx="213" cy="299" r="3" fill="#cfcbe0"/>
      <text x="200" y="321" text-anchor="middle" font-family="'JetBrains Mono', 'Consolas', monospace" font-size="20" font-weight="700" letter-spacing="4" fill="#9d8fff">JINY</text>
    </g>
    <g class="head">
      <path d="M200 272C122 272 86 236 86 188C86 132 136 104 200 104C264 104 314 132 314 188C314 236 278 272 200 272Z" fill="${C.fur}" stroke="${C.line}" stroke-width="4"/>
      <path d="M104 214C118 250 160 264 200 264C240 264 282 250 296 214C282 238 244 252 200 252C156 252 118 238 104 214Z" fill="${C.furShade}" opacity=".7"/>
      <g class="phones">
        <path d="M92 190C82 58 318 58 308 190" stroke="${C.band}" stroke-width="20" fill="none" stroke-linecap="round"/>
        <path class="phone-line" d="M104 184C96 74 304 74 296 184" stroke="${C.glow}" stroke-width="3" fill="none" stroke-linecap="round" filter="url(#${id}-glow)"/>
        <rect class="phone-light" x="170" y="82" width="60" height="13" rx="6.5" fill="${C.glowHi}" filter="url(#${id}-glow)"/>
        <rect x="68" y="158" width="42" height="76" rx="19" fill="${C.band}" stroke="${C.line}" stroke-width="4"/>
        <rect class="cup-glow" x="75" y="168" width="10" height="56" rx="5" fill="${C.glow}" filter="url(#${id}-glow)"/>
        <rect x="290" y="158" width="42" height="76" rx="19" fill="${C.band}" stroke="${C.line}" stroke-width="4"/>
        <rect class="cup-glow" x="315" y="168" width="10" height="56" rx="5" fill="${C.glow}" filter="url(#${id}-glow)"/>
      </g>
      <g class="face">
        <ellipse class="blush" cx="136" cy="226" rx="20" ry="10" fill="${C.blush}" opacity=".75"/>
        <ellipse class="blush" cx="264" cy="226" rx="20" ry="10" fill="${C.blush}" opacity=".75"/>
        <path d="M128 222Q144 230 162 224M238 224Q256 230 272 222" stroke="#c6bfdc" stroke-width="3" fill="none" stroke-linecap="round"/>
        <g class="eyes">
          <g class="eye" style="transform-origin:151px 202px">
            <path d="M128 196Q151 186 174 196Q174 218 151 218Q128 218 128 196Z" fill="${C.eye}"/>
            ${star(156, 206, 7, '#8f7dff', 'twinkle')}<circle cx="142" cy="199" r="3" fill="#fff"/>
          </g>
          <g class="eye" style="transform-origin:249px 202px">
            <path d="M226 196Q249 186 272 196Q272 218 249 218Q226 218 226 196Z" fill="${C.eye}"/>
            ${star(254, 206, 7, '#8f7dff', 'twinkle')}<circle cx="240" cy="199" r="3" fill="#fff"/>
          </g>
          <path class="lids" d="M124 193Q151 180 178 193M222 193Q249 180 276 193" stroke="${C.line}" stroke-width="5" fill="none" stroke-linecap="round"/>
        </g>
        <path d="M194 226Q200 221 206 226Q200 233 194 226Z" fill="${C.nose}"/>
        <path class="mouth" d="M188 236Q194 243 200 236Q206 243 212 236" stroke="#5c3a4c" stroke-width="3" fill="none" stroke-linecap="round"/>
      </g>
    </g>
  </g>
  ${desk ? `<g class="desk">
    <rect x="0" y="366" width="400" height="34" fill="${C.desk}"/><rect x="0" y="366" width="400" height="3" fill="${C.deskEdge}"/>
    <ellipse cx="52" cy="376" rx="22" ry="11" fill="#2a2740" stroke="${C.line}" stroke-width="3"/>
    <g class="kb"><rect x="112" y="338" width="176" height="40" rx="7" fill="${C.kb}" stroke="${C.line}" stroke-width="4"/>${keys()}</g>
    <g class="paw paw-l" style="transform-origin:150px 340px"><ellipse cx="150" cy="338" rx="30" ry="17" fill="${C.fur}" stroke="${C.line}" stroke-width="4"/><path d="M140 344v6M150 345v6M160 344v6" stroke="#c6bfdc" stroke-width="2.5" stroke-linecap="round"/></g>
    <g class="paw paw-r" style="transform-origin:250px 340px"><ellipse cx="250" cy="338" rx="30" ry="17" fill="${C.fur}" stroke="${C.line}" stroke-width="4"/><path d="M240 344v6M250 345v6M260 344v6" stroke="#c6bfdc" stroke-width="2.5" stroke-linecap="round"/></g>
    <g class="bottle"><rect x="336" y="300" width="36" height="72" rx="9" fill="#f7f6fb" stroke="${C.line}" stroke-width="3"/><rect x="344" y="288" width="20" height="16" rx="3" fill="${C.line}"/><rect x="342" y="318" width="24" height="26" rx="4" fill="#e6e2f1"/></g>
    <g class="bowl"><path d="M290 368Q290 396 322 396Q354 396 354 368Z" fill="#a9d8f0" stroke="${C.line}" stroke-width="3"/><ellipse cx="322" cy="368" rx="32" ry="7" fill="#eef7fc" stroke="${C.line}" stroke-width="3"/>
      <circle cx="310" cy="367" r="4" fill="#ff6fae"/><circle cx="322" cy="365" r="4" fill="#ffd84a"/><circle cx="333" cy="368" r="4" fill="#5ad1ff"/><circle cx="316" cy="370" r="3" fill="#b6f36b"/>
      <path d="M336 364 352 346" stroke="#cfcbe0" stroke-width="5" stroke-linecap="round"/></g>
  </g>` : ''}
</svg>`;
}

/** 파비콘·로고용: 머리만 */
export function jinyHeadSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="60 0 280 280">
  <path d="M160 132C138 92 114 38 124 16C134-4 168 18 180 70C186 96 188 116 186 132Z" fill="${C.fur}" stroke="${C.line}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M222 132C226 96 240 44 266 16C284-2 306 6 300 32C292 66 268 100 250 136Z" fill="${C.fur}" stroke="${C.line}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M200 272C122 272 86 236 86 188C86 132 136 104 200 104C264 104 314 132 314 188C314 236 278 272 200 272Z" fill="${C.fur}" stroke="${C.line}" stroke-width="8"/>
  <path d="M92 190C82 58 318 58 308 190" stroke="${C.band}" stroke-width="22" fill="none" stroke-linecap="round"/>
  <path d="M104 184C96 74 304 74 296 184" stroke="${C.glow}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <rect x="64" y="154" width="48" height="82" rx="22" fill="${C.band}" stroke="${C.line}" stroke-width="6"/><rect x="288" y="154" width="48" height="82" rx="22" fill="${C.band}" stroke="${C.line}" stroke-width="6"/>
  <rect x="74" y="166" width="12" height="58" rx="6" fill="${C.glow}"/><rect x="314" y="166" width="12" height="58" rx="6" fill="${C.glow}"/>
  <ellipse cx="136" cy="228" rx="20" ry="10" fill="${C.blush}"/><ellipse cx="264" cy="228" rx="20" ry="10" fill="${C.blush}"/>
  <path d="M126 196Q151 184 176 196Q176 220 151 220Q126 220 126 196Z" fill="${C.eye}"/><path d="M224 196Q249 184 274 196Q274 220 249 220Q224 220 224 196Z" fill="${C.eye}"/>
  <circle cx="158" cy="206" r="6" fill="#8f7dff"/><circle cx="256" cy="206" r="6" fill="#8f7dff"/>
  <path d="M120 192Q151 176 182 192M218 192Q249 176 280 192" stroke="${C.line}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M188 238Q194 245 200 238Q206 245 212 238" stroke="#5c3a4c" stroke-width="5" fill="none" stroke-linecap="round"/>
</svg>`;
}
