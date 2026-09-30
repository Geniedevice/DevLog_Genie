// 카테고리마다 아이콘·톤을 고정해 카드 목록에서 한눈에 구분되게 한다. 없는 카테고리는 이름 해시로 톤을 고른다.
const ICONS: Record<string, string> = {
  Devlog: 'edit_note',
  Unreal: 'sports_esports',
  'C++': 'code',
  GAS: 'bolt',
  Graphics: 'palette',
  Troubleshooting: 'build',
  TIL: 'school',
  Algorithm: 'function',
  Retrospect: 'history_edu',
};
const TONES = ['primary', 'secondary', 'tertiary'] as const;
const SHAPES = ['cookie9', 'clover4', 'flower8', 'cookie12'] as const;

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function categoryStyle(name: string) {
  const h = hash(name);
  return { icon: ICONS[name] ?? 'article', tone: TONES[h % TONES.length], shape: SHAPES[h % SHAPES.length] };
}
