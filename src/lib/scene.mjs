// LUNAR LAB 히어로 장면: 달 기지 작업실을 깊이별 레이어로 나눈다(뒤 → 앞).
//   창밖  : ① 별(캔버스, 페이지에서 그림) ② 달·행성 ③ 먼 산맥 ④ 가까운 지면·기지
//   실내  : ⑤ 방(창 구멍이 뚫린 벽, 선반, 모니터) ⑥ JINY(HTML 컴포넌트) ⑦ 책상 앞면
// 모든 레이어는 같은 viewBox(1200×520). 창밖 레이어는 페이지에서 창 모양으로 잘린 틀 안에 들어가
// 스크롤·마우스에 따라 제각각 다른 속도로 움직인다(src/scripts/scene.ts). 이미지 생성은 sceneBack() 한 장으로.

export const SCENE = { w: 1200, h: 520, jiny: { x: 620, y: 132, size: 330 } };
export const WINDOW = { x: 44, y: 34, w: 712, h: 292, r: 14 };

const P = {
  wall: '#151b2c', wall2: '#11172a', panel: '#1b2236', frame: '#0b0f1a',
  sky0: '#0b0f1f', sky1: '#171d38', lav: '#a99be8', lavHi: '#d6ceff', mint: '#8fd4c1', text: '#e7ebf5',
  far: '#2b3150', ground: '#262c45', ground2: '#1c2137', desk: '#1f2639', deskEdge: '#3a4466',
};

const svg = (cls, body, defs = '') =>
  `<svg class="scene-layer ${cls}" viewBox="0 0 1200 520" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
const inner = (s) => s.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

let seed = 7;
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;

/** 이미지 생성용 정적 별(페이지에서는 캔버스가 대신 그린다) */
function staticStars() {
  seed = 7;
  let s = '';
  for (let i = 0; i < 70; i++) {
    const x = 50 + rnd() * 700, y = 40 + rnd() * 210, r = rnd() * 1.4 + 0.5;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${rnd() > 0.85 ? P.lavHi : '#fff'}" opacity="${(0.4 + rnd() * 0.6).toFixed(2)}"/>`;
  }
  return s;
}

function books(x, y) {
  const cols = ['#a99be8', '#8fd4c1', '#e7ebf5', '#6c63b5', '#f29cc8', '#3f4a70', '#8fd4c1', '#a99be8'];
  let s = '', cx = x;
  cols.forEach((c, i) => {
    const w = 10 + (i % 3) * 3, h = 46 + (i % 4) * 6;
    s += `<rect x="${cx}" y="${y - h}" width="${w}" height="${h}" rx="2" fill="${c}" opacity=".85"/>`;
    cx += w + 2;
  });
  return s;
}

function codeLines(x, y, w, n, cls) {
  const cols = [P.lav, P.mint, P.text, P.mint, '#f29cc8', P.lav];
  let s = `<g class="${cls}">`;
  for (let i = 0; i < n; i++) {
    const ind = (i % 5 === 0 ? 0 : i % 3 === 0 ? 2 : 1) * 10;
    s += `<rect x="${x + ind}" y="${y + i * 10}" width="${(0.3 + ((i * 37) % 60) / 100) * (w - ind)}" height="4" rx="2" fill="${cols[i % cols.length]}" opacity=".85"/>`;
  }
  return s + '</g>';
}

/** ② 달·행성·빛무리 */
export function layerMoon() {
  return svg(
    'layer-moon',
    `<circle class="moon-halo" cx="600" cy="120" r="140" fill="url(#lm-halo)"/>
    <g class="moon"><circle cx="600" cy="120" r="66" fill="url(#lm-moon)"/>
    <circle cx="578" cy="104" r="11" fill="#8676d4" opacity=".55"/><circle cx="622" cy="140" r="15" fill="#8676d4" opacity=".45"/><circle cx="628" cy="96" r="6" fill="#8676d4" opacity=".5"/>
    <g clip-path="url(#lm-clip)"><circle cx="638" cy="104" r="66" fill="${P.sky0}" opacity=".6"/></g></g>
    <g class="planet" transform="translate(170 92)"><circle r="17" fill="${P.mint}" opacity=".85"/><ellipse rx="30" ry="7" fill="none" stroke="${P.mint}" stroke-width="2" opacity=".6" transform="rotate(-18)"/></g>`,
    `<radialGradient id="lm-moon" cx="35%" cy="35%"><stop offset="0" stop-color="${P.lavHi}"/><stop offset="1" stop-color="#8676d4"/></radialGradient>
    <radialGradient id="lm-halo"><stop offset="0" stop-color="${P.lav}" stop-opacity=".42"/><stop offset="1" stop-color="${P.lav}" stop-opacity="0"/></radialGradient>
    <clipPath id="lm-clip"><circle cx="600" cy="120" r="66"/></clipPath>`,
  );
}

/** ③ 먼 산맥(흐릿하고 밝은 쪽) */
export function layerFar() {
  return svg(
    'layer-far',
    `<path d="M-160 250 L-80 222 L0 262 L70 214 L130 240 L210 186 L290 236 L360 204 L450 246 L540 196 L620 232 L700 200 L780 240 L860 212 L960 250 V440 H-160Z" fill="${P.far}" opacity=".85"/>
    <path d="M0 262 L70 214 L130 240 L210 186 L290 236 L360 204 L450 246 L540 196 L620 232 L700 200 L780 240" fill="none" stroke="${P.lav}" stroke-width="1" opacity=".25"/>`,
  );
}

/** ④ 가까운 지면·기지 탑·돔 */
export function layerNear() {
  const towers = [[120, 248], [300, 244], [470, 238], [690, 236]]
    .map(([x, y], i) => `<g><rect x="${x}" y="${y - 44 - i * 6}" width="${14 + i * 3}" height="${48 + i * 6}" fill="#1a1f33"/><path d="M${x - 4} ${y - 44 - i * 6}h${22 + i * 3}l-${11 + i * 1.5} -16z" fill="#1a1f33"/><rect class="base-light" x="${x + 5}" y="${y - 30 - i * 6}" width="4" height="4" fill="${P.mint}"/></g>`)
    .join('');
  return svg(
    'layer-near',
    `<path d="M-160 262 Q-40 250 0 270 Q140 238 240 262 T440 250 T640 264 T800 244 T960 250 V460 H-160Z" fill="${P.ground}"/>
    ${towers}
    <path d="M380 262 a26 20 0 0 1 52 0z" fill="#20263e"/><rect class="base-light" x="402" y="252" width="6" height="3" fill="${P.lav}"/>
    <path d="M-160 300 Q0 286 0 298 Q180 276 320 292 T600 286 T800 280 T960 284 V460 H-160Z" fill="${P.ground2}"/>`,
  );
}

/** ⑤ 방: 창 구멍이 뚫린 벽 + 창틀·선반·포스터·모니터·본체 */
export function layerRoom() {
  const W = WINDOW;
  // evenodd 로 벽에 둥근 사각 구멍을 낸다
  const hole = `M${W.x + W.r} ${W.y}H${W.x + W.w - W.r}Q${W.x + W.w} ${W.y} ${W.x + W.w} ${W.y + W.r}V${W.y + W.h - W.r}Q${W.x + W.w} ${W.y + W.h} ${W.x + W.w - W.r} ${W.y + W.h}H${W.x + W.r}Q${W.x} ${W.y + W.h} ${W.x} ${W.y + W.h - W.r}V${W.y + W.r}Q${W.x} ${W.y} ${W.x + W.r} ${W.y}Z`;
  return svg(
    'layer-room',
    `<path d="M0 0H1200V520H0Z ${hole}" fill="${P.wall}" fill-rule="evenodd"/>
    ${[180, 900, 1100].map((x) => `<rect x="${x}" y="0" width="2" height="520" fill="${P.wall2}"/>`).join('')}
    <rect x="0" y="360" width="1200" height="2" fill="${P.panel}"/>
    <rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="${W.r}" fill="none" stroke="${P.frame}" stroke-width="10"/>
    <rect x="397" y="${W.y}" width="6" height="${W.h}" fill="${P.frame}"/>
    <rect x="30" y="322" width="740" height="12" rx="4" fill="${P.panel}"/>
    <rect class="glass" x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="${W.r}" fill="url(#lr-glass)"/>

    <g transform="translate(1062 36)">
      <rect class="neon-box" width="112" height="128" rx="6" fill="#0e1322" stroke="${P.lav}" stroke-width="2" filter="url(#lr-glow)"/>
      ${['GOOD', 'GAMES', 'BETTER', 'PEOPLE'].map((t, i) => `<text x="56" y="${30 + i * 20}" text-anchor="middle" font-family="Galmuri11, 'JetBrains Mono', monospace" font-size="12" font-weight="700" fill="${P.lavHi}" letter-spacing="1" class="neon-text">${t}</text>`).join('')}
      <text x="56" y="116" text-anchor="middle" font-size="12" fill="${P.lav}">♥</text>
    </g>
    <rect x="800" y="120" width="220" height="8" rx="3" fill="${P.panel}"/>
    ${books(812, 120)}
    <g transform="translate(960 118)"><path d="M-14 0h28l-4 -20h-20z" fill="#3a4466"/><path class="leaf" d="M0 -20 C-10 -40 -24 -44 -26 -34 M0 -20 C4 -44 16 -52 22 -40 M0 -20 C-2 -46 6 -58 10 -52" stroke="${P.mint}" stroke-width="5" fill="none" stroke-linecap="round"/></g>

    <rect x="470" y="250" width="190" height="120" rx="8" fill="${P.frame}" stroke="#2a3350" stroke-width="3"/>
    <rect x="478" y="258" width="174" height="104" rx="4" fill="#0a1419"/>
    <g clip-path="url(#lr-scr1)">${codeLines(488, 268, 150, 22, 'code-scroll')}</g>
    <rect x="555" y="370" width="20" height="44" fill="#2a3350"/>
    <rect x="950" y="240" width="200" height="125" rx="8" fill="${P.frame}" stroke="#2a3350" stroke-width="3"/>
    <rect x="958" y="248" width="184" height="109" rx="4" fill="#0d1224"/>
    <g clip-path="url(#lr-scr2)">
      <circle cx="1110" cy="275" r="14" fill="${P.lav}" opacity=".8"/>
      <path d="M958 332 H1142 V357 H958Z" fill="#232a47"/>
      <g class="mini-obstacle"><rect x="1140" y="318" width="10" height="14" fill="#f29cc8"/></g>
      <g class="mini-hero"><rect x="988" y="318" width="12" height="14" rx="2" fill="${P.mint}"/><rect x="991" y="321" width="2" height="2" fill="#0d1224"/><rect x="996" y="321" width="2" height="2" fill="#0d1224"/></g>
      <text x="966" y="264" font-family="Galmuri11, monospace" font-size="9" fill="${P.text}" opacity=".7" class="mini-score">SCORE 0000</text>
    </g>
    <rect x="1040" y="365" width="20" height="50" fill="#2a3350"/>
    <rect x="890" y="300" width="30" height="110" rx="4" fill="#161c2f" stroke="#2a3350" stroke-width="2"/>
    <circle class="led" cx="905" cy="318" r="3" fill="${P.mint}"/><circle class="led" cx="905" cy="332" r="3" fill="${P.lav}"/>
    <rect x="897" y="350" width="16" height="3" rx="1.5" fill="#2a3350"/><rect x="897" y="358" width="16" height="3" rx="1.5" fill="#2a3350"/>`,
    `<linearGradient id="lr-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".05"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity=".03"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="lr-scr1"><rect x="478" y="258" width="174" height="104" rx="4"/></clipPath>
    <clipPath id="lr-scr2"><rect x="958" y="248" width="184" height="109" rx="4"/></clipPath>
    <filter id="lr-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
  );
}

/** ⑦ 책상 앞면: 스탠드, 키보드, 앞발, 마우스, 머그, 명판, 화분 */
export function sceneFront() {
  let keys = '';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 14; c++) keys += `<rect class="fkey" x="${694 + c * 12.5}" y="${432 + r * 8}" width="9.5" height="5.5" rx="1.2" fill="#3d4768"/>`;
  return svg(
    'scene-front',
    `<g transform="translate(410 300)">
      <path class="lamp-light" d="M26 38 L-40 116 H110 Z" fill="url(#sf-lamp)"/>
      <path d="M0 114 L10 40 L40 20" stroke="#2f3854" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M22 10 L60 24 L48 44 Z" fill="#3a4466"/><circle cx="46" cy="38" r="5" fill="#ffe7b0"/>
      <rect x="-16" y="110" width="34" height="8" rx="3" fill="#2f3854"/>
    </g>
    <rect x="-120" y="410" width="1440" height="200" fill="url(#sf-desk)"/>
    <rect x="-120" y="408" width="1440" height="5" fill="${P.deskEdge}"/>
    <rect x="684" y="424" width="192" height="36" rx="7" fill="#262e46" stroke="#11172a" stroke-width="3"/>
    ${keys}
    <g class="fpaw fpaw-l"><ellipse cx="742" cy="426" rx="26" ry="14" fill="#f7f6fb" stroke="#16141f" stroke-width="3.5"/><path d="M734 431v5M742 432v5M750 431v5" stroke="#c6bfdc" stroke-width="2" stroke-linecap="round"/></g>
    <g class="fpaw fpaw-r"><ellipse cx="820" cy="426" rx="26" ry="14" fill="#f7f6fb" stroke="#16141f" stroke-width="3.5"/><path d="M812 431v5M820 432v5M828 431v5" stroke="#c6bfdc" stroke-width="2" stroke-linecap="round"/></g>
    <ellipse cx="920" cy="440" rx="16" ry="10" fill="#262e46" stroke="#11172a" stroke-width="3"/>
    <g transform="translate(990 392)">
      <path class="steam" d="M10 -8 q-6 -10 0 -20 q6 -10 0 -20" stroke="#e7ebf5" stroke-width="3" fill="none" stroke-linecap="round" opacity=".45"/>
      <path class="steam" d="M22 -6 q-6 -10 0 -20 q6 -10 0 -20" stroke="#e7ebf5" stroke-width="3" fill="none" stroke-linecap="round" opacity=".35"/>
      <rect x="0" y="0" width="34" height="32" rx="6" fill="#e7ebf5"/><path d="M34 8 h6 a7 7 0 0 1 0 14 h-6" stroke="#e7ebf5" stroke-width="5" fill="none"/>
      <rect x="9" y="10" width="16" height="10" rx="3" fill="#a99be8"/>
    </g>
    <g transform="translate(70 446)">
      <rect width="190" height="46" rx="10" fill="#141a2b" stroke="#3a4466" stroke-width="2"/>
      <text x="22" y="30" font-family="Galmuri11, 'JetBrains Mono', monospace" font-size="15" font-weight="700" fill="${P.lav}" letter-spacing="4">LUNAR LAB</text>
      <g transform="translate(164 23)"><circle r="9" fill="${P.lav}"/><ellipse rx="15" ry="4" fill="none" stroke="${P.mint}" stroke-width="2" transform="rotate(-20)"/></g>
    </g>
    <g transform="translate(1150 410)"><path d="M-18 0h36l-5 -30h-26z" fill="#6c63b5"/><path class="leaf" d="M0 -30 C-6 -60 -26 -66 -30 -54 M0 -30 C6 -64 22 -72 28 -58 M0 -30 C0 -66 8 -80 14 -74" stroke="${P.mint}" stroke-width="6" fill="none" stroke-linecap="round"/></g>`,
    `<radialGradient id="sf-lamp" cx="50%" cy="0%" r="100%"><stop offset="0" stop-color="#ffe7b0" stop-opacity=".28"/><stop offset="1" stop-color="#ffe7b0" stop-opacity="0"/></radialGradient>
    <linearGradient id="sf-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.desk}"/><stop offset="1" stop-color="#151b2b"/></linearGradient>`,
  );
}

/** 이미지 생성(sharp)용: 창밖 + 방을 한 장으로. JINY·앞면은 호출하는 쪽에서 얹는다 */
export function sceneBack() {
  const W = WINDOW;
  return `<svg viewBox="0 0 1200 520" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="sb-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky0}"/><stop offset="1" stop-color="${P.sky1}"/></linearGradient>
  <clipPath id="sb-win"><rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="${W.r}"/></clipPath></defs>
  <g clip-path="url(#sb-win)"><rect width="1200" height="520" fill="url(#sb-sky)"/>${staticStars()}${inner(layerMoon())}${inner(layerFar())}${inner(layerNear())}</g>
  ${inner(layerRoom())}
</svg>`;
}
