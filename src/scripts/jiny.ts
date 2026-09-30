import { animate, createTimeline, random, stagger } from 'animejs';
import { achievement, reduced } from './fx';
import { sfx } from './sfx';

// JINY 애니메이션(anime.js v4). 부위 class 는 src/lib/jiny.mjs 참고.
const NEON = ['#a99be8', '#8fd4c1', '#f29cc8', '#f2cf7a', '#e7ebf5'];
const LINES = ['빌드 성공!', '버그 잡았다 🐛', '커밋 완료 ✨', '한 줄만 더…', 'GAS 최고', '크래시 없음!', '시리얼 맛있다'];
const KEY = '#3d3959';

export function animateJiny(root: HTMLElement) {
  const $ = <T extends Element = SVGElement>(s: string) => root.querySelector<T>(s);
  const $$ = <T extends Element = SVGElement>(s: string) => [...root.querySelectorAll<T>(s)];
  if (reduced()) return;

  // 등장: 통 튀어나오고 반짝이가 차례로 켜진다
  animate($('.bunny')!, { scale: [0.86, 1], translateY: [24, 0], opacity: [0, 1], duration: 1100, ease: 'outElastic(1, .6)' });
  animate($$('.spark'), { scale: [0, 1], opacity: [0, 1], duration: 600, delay: stagger(60, { start: 400, from: 'random' }), ease: 'outBack(2)' });

  // 대기 동작 ─────────────────────────────
  const earR = $('.ear-r'), earL = $('.ear-l');
  if (earR) animate(earR, { rotate: [-3, 7], duration: 1900, loop: true, alternate: true, ease: 'inOutSine' });
  if (earL) animate(earL, { rotate: [2, -4], duration: 2400, loop: true, alternate: true, ease: 'inOutSine' });

  // 음악에 맞춰 까딱까딱
  animate($('.head')!, { translateY: [0, 3], rotate: [-1.2, 1.2], duration: 760, loop: true, alternate: true, ease: 'inOutSine' });
  animate($('.body')!, { scaleY: [1, 1.012], duration: 1520, loop: true, alternate: true, ease: 'inOutSine' });

  // 헤드폰 불빛이 숨 쉬듯
  animate($$('.phone-light, .cup-glow, .phone-line'), { opacity: [1, 0.35], duration: 1300, loop: true, alternate: true, ease: 'inOutSine', delay: stagger(120) });
  animate($('.aura')!, { scale: [1, 1.06], opacity: [0.85, 1], duration: 2600, loop: true, alternate: true, ease: 'inOutSine' });

  // 반짝이: 제각각 떠다니며 깜빡
  $$('.spark').forEach((s) =>
    animate(s, { translateY: [random(-6, 0), random(0, 8)], rotate: [0, random(-40, 40)], opacity: [0.45, 1], duration: random(1400, 2600), delay: random(600, 1600), loop: true, alternate: true, ease: 'inOutSine' }),
  );
  animate($$('.twinkle'), { rotate: [0, 90], scale: [0.8, 1.15], duration: 1600, loop: true, alternate: true, ease: 'inOutSine' });

  // 타자: 양손 번갈아 + 눌린 키가 보라로 번쩍
  const keys = $$<SVGRectElement>('.key');
  const pawL = $('.paw-l'), pawR = $('.paw-r');
  if (pawL && pawR && keys.length) {
    const flash = () => {
      const k = keys[Math.floor(Math.random() * keys.length)];
      animate(k, { fill: ['#b8aaff', KEY], duration: 380, ease: 'outQuad' });
    };
    const tl = createTimeline({ loop: true });
    tl.add(pawL, { translateY: [0, -5, 0], duration: 220, ease: 'inOutQuad', onBegin: flash })
      .add(pawR, { translateY: [0, -5, 0], duration: 220, ease: 'inOutQuad', onBegin: flash })
      .add(pawL, { translateY: [0, -4, 0], duration: 200, ease: 'inOutQuad', onBegin: flash })
      .add(pawR, { translateY: [0, -6, 0], duration: 260, ease: 'inOutQuad', onBegin: flash })
      .add(pawL, { translateY: 0, duration: 420 }); // 잠깐 쉼
  }

  // 눈 깜빡임: 2.5~5초마다, 가끔 두 번
  const eyes = $$('.eye');
  const blink = () => {
    const twice = Math.random() < 0.25;
    animate(eyes, {
      scaleY: twice ? [1, 0.08, 1, 0.08, 1] : [1, 0.08, 1],
      duration: twice ? 420 : 220,
      ease: 'inOutQuad',
      onComplete: () => setTimeout(blink, random(2500, 5000)),
    });
  };
  setTimeout(blink, 1800);

  // 눈동자가 커서를 따라온다
  const pupils = $('.eyes');
  if (pupils) {
    addEventListener(
      'pointermove',
      (e) => {
        const r = root.getBoundingClientRect();
        const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 1.5)));
        const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.45)) / (r.height * 1.5)));
        animate(pupils, { translateX: dx * 5, translateY: dy * 3, duration: 450, ease: 'outQuad' });
      },
      { passive: true },
    );
  }

  // 클릭: 깡충 + 귀 펄럭 + 색종이 + 말풍선
  const poke = root.querySelector<HTMLButtonElement>('[data-poke]');
  let busy = false;
  poke?.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    sfx('jump');
    achievement('poke-jiny', 'JINY와 첫 인사');
    const hop = createTimeline({ onComplete: () => (busy = false) });
    hop
      .add($('.bunny')!, { translateY: [0, -26], scaleY: [1, 1.04], duration: 220, ease: 'outQuad' })
      .add($('.bunny')!, { translateY: [-26, 0], scaleY: [1.04, 0.96, 1], duration: 420, ease: 'outBounce' });
    if (earL) animate(earL, { rotate: [-4, -22, 0], duration: 700, ease: 'outElastic(1, .5)' });
    if (earR) animate(earR, { rotate: [7, 26, 0], duration: 700, ease: 'outElastic(1, .5)' });
    animate($$('.blush'), { opacity: [0.75, 1, 0.75], scale: [1, 1.25, 1], duration: 700, ease: 'outQuad' });
    burst(root);
    say(root);
  });
}

function burst(root: HTMLElement) {
  const pieces = Array.from({ length: 22 }, (_, i) => {
    const c = document.createElement('span');
    c.className = 'confetti';
    c.style.background = NEON[i % NEON.length];
    if (i % 3 === 0) c.style.borderRadius = '50%';
    root.append(c);
    return c;
  });
  pieces.forEach((c) => {
    const angle = random(0, Math.PI * 2, 3);
    const dist = random(90, 190);
    animate(c, {
      translateX: [0, Math.cos(angle) * dist],
      translateY: [0, Math.sin(angle) * dist - 40, Math.sin(angle) * dist + 60],
      rotate: [0, random(-540, 540)],
      scale: [0.4, 1, 0.6],
      opacity: [1, 1, 0],
      duration: random(900, 1400),
      ease: 'outCubic',
      onComplete: () => c.remove(),
    });
  });
}

function say(root: HTMLElement) {
  root.querySelector('.bubble')?.remove();
  const b = document.createElement('span');
  b.className = 'bubble';
  b.textContent = LINES[Math.floor(Math.random() * LINES.length)];
  root.append(b);
  animate(b, { translateY: [10, -6], opacity: [0, 1], scale: [0.8, 1], duration: 380, ease: 'outBack(2)' });
  animate(b, { translateY: -18, opacity: 0, duration: 400, delay: 1500, ease: 'inQuad', onComplete: () => b.remove() });
}
