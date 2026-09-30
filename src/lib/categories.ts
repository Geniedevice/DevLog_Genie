// 카테고리 = 의뢰 분류. 아이콘과 문장(紋章) 색을 고정해 게시판에서 한눈에 구분되게 한다.
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
