// 8비트 효과음. 파일 없이 Web Audio 로 즉석 합성한다.
// 기본은 꺼짐(방문자가 사이드바 스피커 버튼으로 켠다). 켜짐 여부는 이 브라우저에만 저장.
const KEY = 'devlog:sound';
type Sound = 'hover' | 'click' | 'select' | 'coin' | 'jump' | 'achievement' | 'boot';

let ctx: AudioContext | null = null;

export function soundOn(): boolean {
  try {
    return localStorage.getItem(KEY) === 'on';
  } catch {
    return false;
  }
}

export function setSound(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* 저장 못 해도 이번 페이지에서는 동작 */
  }
  document.documentElement.dataset.sound = on ? 'on' : 'off';
  if (on) sfx('select', true);
}

// [주파수(Hz), 길이(초), 파형]을 차례로 울린다
const NOTES: Record<Sound, [number, number, OscillatorType][]> = {
  hover: [[880, 0.025, 'square']],
  click: [[660, 0.04, 'square'], [990, 0.05, 'square']],
  select: [[523, 0.06, 'square'], [784, 0.08, 'square']],
  coin: [[988, 0.07, 'square'], [1319, 0.16, 'square']],
  jump: [[330, 0.05, 'square'], [494, 0.05, 'square'], [659, 0.09, 'square']],
  achievement: [[523, 0.08, 'triangle'], [659, 0.08, 'triangle'], [784, 0.08, 'triangle'], [1047, 0.22, 'triangle']],
  boot: [[262, 0.06, 'square'], [392, 0.06, 'square'], [523, 0.12, 'square']],
};

export function sfx(name: Sound, force = false) {
  if (!force && !soundOn()) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    let t = ctx.currentTime;
    for (const [freq, dur, type] of NOTES[name]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      // 클릭 잡음이 안 나게 짧게 페이드
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(name === 'hover' ? 0.025 : 0.06, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
      t += dur * 0.9;
    }
  } catch {
    /* Web Audio 를 못 쓰는 환경은 조용히 */
  }
}

/** 버튼·카드·칩에 마우스를 올리거나 누를 때 효과음(켜져 있을 때만) */
export function wireUiSounds() {
  document.documentElement.dataset.sound = soundOn() ? 'on' : 'off';
  const target = 'a, button, [role="tab"], .chip, [data-card]';
  let last: Element | null = null;
  document.addEventListener('pointerover', (e) => {
    const el = (e.target as Element).closest?.(target);
    if (el && el !== last) sfx('hover');
    last = el;
  });
  document.addEventListener('click', (e) => {
    if ((e.target as Element).closest?.('[data-sound-toggle]')) return;
    if ((e.target as Element).closest?.(target)) sfx('click');
  });
}
