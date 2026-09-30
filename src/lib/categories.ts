// 카테고리마다 아이콘·색을 고정한다. 커버 없는 글의 썸네일 배경에 쓰인다.
const ICONS: Record<string, string> = {
  Devlog: 'history_edu',
  Unreal: 'swords',
  'C++': 'terminal',
  GAS: 'auto_fix_high',
  Graphics: 'palette',
  Troubleshooting: 'bug_report',
  TIL: 'menu_book',
  Algorithm: 'extension',
  Retrospect: 'hourglass_top',
};
const TONES = ['gold', 'arcane', 'ember', 'emerald'] as const;
export type Tone = (typeof TONES)[number];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function categoryStyle(name: string): { icon: string; tone: Tone } {
  return { icon: ICONS[name] ?? 'flag', tone: TONES[hash(name) % TONES.length] };
}
