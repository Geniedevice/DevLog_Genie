// 16×18 픽셀 JINY. 글자 한 칸 = 픽셀 한 칸. 눈은 따로 그려 깜빡임 프레임을 바꿔 끼운다.
const COLORS = {
  O: '#151a2b', // 외곽선
  W: '#f4f2fb', // 털
  S: '#d9d4ea', // 귀 안쪽
  P: '#7d6bd6', // 헤드폰
  L: '#c9bdff', // 헤드폰 불빛·눈 반짝
  E: '#151a2b', // 눈
  K: '#f3a3c2', // 볼
  H: '#232b40', // 후드
  M: '#8fd4c1', // 후드 글씨
};

const BODY = [
  '...OO......OO...',
  '..OWWO....OWWO..',
  '..OWSO....OSWO..',
  '..OWSO....OSWO..',
  '..OWSO....OSWO..',
  '...OWOLLLLOWO...',
  '..OPWWWWWWWWPO..',
  '.OPWWWWWWWWWWPO.',
  'OPPWWWWWWWWWWPPO',
  'OPPWWWWWWWWWWPPO',
  'OPPWKWWWWWWKWPPO',
  '.OPWWWWOOWWWWPO.',
  '..OWWWWWWWWWWO..',
  '...OOOOOOOOOO...',
  '..OHHHHHHHHHHO..',
  '.OHHHMMMMMMHHHO.',
  '.OWWHHHHHHHHWWO.',
  '..OOOOOOOOOOOO..',
];
// 눈 뜬 프레임 / 감은 프레임 (행 8~9)
const EYES_OPEN = { 8: '....EE....EE....', 9: '....EL....EL....' };
const EYES_SHUT = { 9: '....EE....EE....' };

function cells(rows, offset = 0) {
  let s = '';
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c !== '.') s += `<rect x="${x}" y="${y + offset}" width="1" height="1" fill="${COLORS[c]}"/>`;
    }
  });
  return s;
}
const layer = (map) => Object.entries(map).map(([y, row]) => cells([row], Number(y))).join('');

export function pixelJinySvg(cls = '') {
  return `<svg class="pixel-jiny ${cls}" viewBox="0 0 16 18" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g class="pj-body">${cells(BODY)}
    <g class="pj-light">${cells(['......LLLL......'], 5)}</g>
    <g class="pj-eyes-open">${layer(EYES_OPEN)}</g>
    <g class="pj-eyes-shut" opacity="0">${layer(EYES_SHUT)}</g>
  </g>
</svg>`;
}
