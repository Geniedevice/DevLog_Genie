import { animate, createTimeline, random, stagger, steps } from 'animejs';
import { reduced } from './fx';

// LUNAR LAB 히어로 장면 연출(anime.js v4). 부위 class 는 src/lib/scene.mjs 참고.
export function animateScene(root: HTMLElement) {
  if (reduced()) return;
  const $ = (s: string) => root.querySelector<SVGElement>(s);
  const $$ = (s: string) => [...root.querySelectorAll<SVGElement>(s)];

  // 별: 일부만 제각각 반짝
  $$('.star.tw').forEach((s) => animate(s, { opacity: [random(0.2, 0.5, 2), 1], scale: [0.7, 1.3], duration: random(900, 2200), delay: random(0, 1500), loop: true, alternate: true, ease: 'inOutSine' }));
  animate($('.moon-halo')!, { opacity: [0.7, 1], scale: [0.96, 1.04], duration: 3200, loop: true, alternate: true, ease: 'inOutSine' });

  // 별똥별: 4~8초마다 창을 가로지른다
  const shoot = $('.shooting');
  const fire = () => {
    if (!shoot) return;
    const x = random(300, 740), y = random(40, 120);
    animate(shoot, {
      translateX: [x, x - 260],
      translateY: [y, y + 100],
      opacity: [0, 1, 1, 0],
      duration: 1100,
      ease: 'inQuad',
      onComplete: () => setTimeout(fire, random(4000, 8000)),
    });
  };
  setTimeout(fire, 1800);

  // 기지 불빛, 본체 LED
  animate($$('.base-light'), { opacity: [1, 0.25], duration: 900, delay: stagger(300), loop: true, alternate: true, ease: steps(2) });
  animate($$('.led'), { opacity: [1, 0.3], duration: 500, delay: stagger(220), loop: true, alternate: true, ease: steps(1) });
  animate($$('.neon-box, .neon-text'), { opacity: [1, 0.72, 1, 0.9, 1], duration: 2600, loop: true, ease: 'linear', delay: 1200 });

  // 왼쪽 모니터: 코드가 위로 흘러간다
  const code = $('.code-scroll');
  if (code) animate(code, { translateY: [0, -110], duration: 9000, loop: true, ease: 'linear' });

  // 오른쪽 모니터: 초미니 플랫포머(장애물이 오면 점프, 넘으면 점수)
  const hero = $('.mini-hero'), obstacle = $('.mini-obstacle'), score = $('.mini-score');
  if (hero && obstacle) {
    let pts = 0;
    const run = createTimeline({ loop: true, onLoop: () => { pts += 10; if (score) score.textContent = `SCORE ${String(pts).padStart(4, '0')}`; } });
    run
      .add(obstacle, { translateX: [0, -180], duration: 1800, ease: 'linear' }, 0)
      .add(hero, { translateY: [0, -26, 0], duration: 520, ease: 'outQuad' }, 1100)
      .add(hero, { rotate: [0, 360], duration: 520, ease: 'inOutQuad' }, 1100);
  }

  // 머그의 김
  $$('.steam').forEach((s, i) => animate(s, { translateY: [4, -10], opacity: [0, 0.5, 0], scaleY: [0.8, 1.1], duration: 2400, delay: i * 1000, loop: true, ease: 'outSine' }));

  // 앞발 타자 + 눌린 키 불빛
  const keys = $$('.fkey');
  const flash = () => animate(keys[Math.floor(Math.random() * keys.length)], { fill: ['#c9bdff', '#3d4768'], duration: 360, ease: 'outQuad' });
  const pl = $('.fpaw-l'), pr = $('.fpaw-r');
  if (pl && pr && keys.length) {
    createTimeline({ loop: true })
      .add(pl, { translateY: [0, -5, 0], duration: 200, onBegin: flash })
      .add(pr, { translateY: [0, -5, 0], duration: 200, onBegin: flash })
      .add(pl, { translateY: [0, -4, 0], duration: 180, onBegin: flash })
      .add(pr, { translateY: [0, -6, 0], duration: 240, onBegin: flash })
      .add(pl, { translateY: 0, duration: 380 });
  }

  // 시차: 마우스 쪽으로 창밖 풍경이 깊이별로 다르게 움직인다
  const far = $('.parallax-far'), mid = $('.parallax-mid'), near = $('.parallax-near');
  root.addEventListener('pointermove', (e) => {
    const r = root.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    if (far) animate(far, { translateX: dx * -6, translateY: dy * -4, duration: 600, ease: 'outQuad' });
    if (mid) animate(mid, { translateX: dx * -14, translateY: dy * -8, duration: 600, ease: 'outQuad' });
    if (near) animate(near, { translateX: dx * -22, duration: 600, ease: 'outQuad' });
  });
}
