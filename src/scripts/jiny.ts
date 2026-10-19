import { animate, random } from 'animejs';
import { achievement, reduced } from './fx';
import { sfx } from './sfx';

const NEON = ['#7b8cff', '#8fd4c1', '#f29cc8', '#f2cf7a', '#e7ebf5'];
const LINES = ['빌드 성공!', '버그 잡았다 🐛', '커밋 완료 ✨', '한 줄만 더…', 'GAS 최고', '크래시 없음!'];

// The approved illustration replaces the old procedural face rig.
export function animateJiny(root: HTMLElement) {
  const portrait = root.querySelector<HTMLElement>('.portrait-motion');
  const poke = root.querySelector<HTMLButtonElement>('[data-poke]');
  if (!portrait || !poke) return;
  let lastPoke = -Infinity;
  poke.addEventListener('click', () => {
    const time = performance.now();
    if (time - lastPoke < 900) return;
    lastPoke = time;
    sfx('jump');
    achievement('poke-jiny', 'JINY와 첫 인사');
    say(root);
    if (reduced()) return;
    burst(root);
    animate(portrait, {
      translateY: [0, -12, 0], rotate: [0, -2, 0],
      duration: 650, ease: 'outCubic',
    });
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
