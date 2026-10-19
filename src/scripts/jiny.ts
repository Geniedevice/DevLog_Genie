import { animate, random } from 'animejs';
import { mountAvatar } from '../vendor/rev2d-avatar.js';
import { achievement, reduced } from './fx';
import { sfx } from './sfx';

export async function animateJiny(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas.rig');
  if (!canvas || root.dataset.mounted) return;
  root.dataset.mounted = '';
  let avatar: Awaited<ReturnType<typeof mountAvatar>>;
  try {
    avatar = await mountAvatar(canvas, new URL(root.dataset.model!, location.href).href);
  } catch (error) {
    console.warn('JINY avatar could not load; keeping the portrait.', error);
    delete root.dataset.mounted;
    return;
  }
  let visible = false, frameId = 0, lastFrame = 0, clock = 0;
  let pokedAt = -Infinity, blinkAt = 2 + Math.random() * 3;
  let gazeX = 0, gazeY = 0, aimX = 0, aimY = 0, lastPointer = -Infinity;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const poke = root.querySelector<HTMLButtonElement>('[data-poke]');
  const draw = (time: number) => {
    frameId = 0;
    if (!visible || document.hidden || !root.isConnected) return;
    const dt = lastFrame ? Math.min((time - lastFrame) / 1000, 0.05) : 0;
    if (dt && dt < 1 / 32) { frameId = requestAnimationFrame(draw); return; }
    lastFrame = time;
    clock += dt;
    const quiet = motion.matches;
    const idle = time - lastPointer > 4000;
    const k = 1 - Math.exp(-dt * 5);
    gazeX += ((idle ? 0 : aimX) - gazeX) * k;
    gazeY += ((idle ? 0 : aimY) - gazeY) * k;
    const blink = clock - blinkAt;
    const eye = blink < 0 || blink > 0.23 ? 1 : Math.min(1, Math.abs(blink - 0.08) / (blink < 0.08 ? 0.08 : 0.15));
    if (blink > 0.23) blinkAt = clock + 2.5 + Math.random() * 3;
    const p = Number.isFinite(pokedAt) ? clock - pokedAt : 10;
    const happy = !quiet && p < 1.6 ? Math.max(0, Math.min(1, p * 8, (1.6 - p) * 3)) : 0;
    avatar.frame({time: quiet ? 0 : clock, physics: !quiet, params: {
      AngleX: quiet ? 0 : gazeX * 20 + Math.sin(clock * 0.65) * 3,
      AngleY: quiet ? 0 : -gazeY * 14 + Math.sin(clock * 0.8) * 2,
      AngleZ: quiet ? 0 : Math.sin(clock * 0.7) * 5 + happy * 5,
      EyeBallX: quiet ? 0 : gazeX * 0.7, EyeBallY: quiet ? 0 : -gazeY * 0.6,
      EyeLOpen: quiet ? 1 : eye, EyeROpen: quiet ? 1 : eye,
      BodyAngleX: quiet ? 0 : Math.sin(clock * 0.5) * 3,
      Breath: quiet ? 0 : 0.5 + Math.sin(clock * 1.4) * 0.5,
      MouthForm: happy * 0.7, MouthOpen: happy * (0.1 + 0.3 * Math.abs(Math.sin(p * 12))),
    }});
    root.dataset.live = '';
    if (!quiet) frameId = requestAnimationFrame(draw);
  };
  const resume = () => {
    lastFrame = 0;
    if (visible && !document.hidden && !frameId) frameId = requestAnimationFrame(draw);
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) { cancelAnimationFrame(frameId); frameId = 0; }
    else resume();
  });
  observer.observe(root);
  const resize = new ResizeObserver(resume);
  resize.observe(root);
  document.addEventListener('visibilitychange', resume, {signal:controller.signal});
  motion.addEventListener('change', resume, {signal:controller.signal});
  window.addEventListener('pointermove', event => {
    if (!visible || motion.matches || event.pointerType === 'touch') return;
    const rect = root.getBoundingClientRect();
    aimX = Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / rect.width));
    aimY = Math.max(-1, Math.min(1, (event.clientY - rect.top - rect.height * 0.38) / rect.height));
    lastPointer = performance.now();
  }, {passive:true,signal:controller.signal});
  poke?.addEventListener('click', () => {
    if (clock - pokedAt < 0.9 && !motion.matches) return;
    pokedAt = clock;
    sfx('jump');
    achievement('poke-jiny', 'JINY');
    say(root);
    if (!reduced()) burst(root);
    resume();
  }, {signal:controller.signal});
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    controller.abort(); observer.disconnect(); resize.disconnect();
    cancelAnimationFrame(frameId); avatar.dispose();
  }, {once:true});
}

const NEON = ['#7b8cff', '#8fd4c1', '#f29cc8', '#f2cf7a', '#e7ebf5'];
const LINES = ['빌드 성공!', '버그 잡았다 🐛', '커밋 완료 ✨', '한 줄만 더…', 'GAS 최고', '크래시 없음!'];


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
