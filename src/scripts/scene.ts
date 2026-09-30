import { animate, createTimeline, onScroll, stagger, steps } from 'animejs';
import { reduced } from './fx';
import { startSky } from './sky';

// LUNAR LAB 히어로 장면(anime.js v4). 부위 class 는 src/lib/scene.mjs, 레이어 구조는 HeroScene.astro 참고.
export function animateScene(root: HTMLElement) {
  const sky = root.querySelector<HTMLCanvasElement>('[data-sky]');
  if (sky) startSky(sky, root);
  if (reduced()) return;
  const $ = (s: string) => root.querySelector<SVGElement>(s);
  const $$ = (s: string) => [...root.querySelectorAll<SVGElement>(s)];

  // ── 스크롤 시차: 히어로가 화면을 벗어나는 동안 레이어마다 다른 거리만큼 처진다(스크롤과 동기화)
  const hero = root.closest<HTMLElement>('[data-hero]') ?? root;
  root.querySelectorAll<HTMLElement>('.L[data-scroll]').forEach((layer) => {
    const k = Number(layer.dataset.scroll);
    if (!k) return;
    animate(layer, {
      translateY: [0, k * root.offsetHeight],
      ease: 'linear',
      autoplay: onScroll({ target: hero, enter: 'start start', leave: 'start end', sync: 0.25 }),
    });
  });

  // ── 마우스 시차: 가까운 레이어일수록 크게
  const movers = [...root.querySelectorAll<HTMLElement>('.M[data-mouse]')];
  root.addEventListener('pointermove', (e) => {
    const r = root.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    movers.forEach((m) => {
      const k = Number(m.dataset.mouse);
      animate(m, { translateX: dx * k * 2, translateY: dy * k, duration: 700, ease: 'outQuad' });
    });
  });
  root.addEventListener('pointerleave', () => animate(movers, { translateX: 0, translateY: 0, duration: 1200, ease: 'outElastic(1, .6)' }));

  // ── 창밖
  animate($('.moon-halo')!, { opacity: [0.7, 1], scale: [0.96, 1.05], duration: 3200, loop: true, alternate: true, ease: 'inOutSine' });
  animate($('.planet')!, { translateY: [-3, 3], rotate: [-4, 4], duration: 5200, loop: true, alternate: true, ease: 'inOutSine' });
  animate($$('.base-light'), { opacity: [1, 0.25], duration: 900, delay: stagger(300), loop: true, alternate: true, ease: steps(2) });

  // ── 방
  animate($$('.led'), { opacity: [1, 0.3], duration: 500, delay: stagger(220), loop: true, alternate: true, ease: steps(1) });
  animate($$('.neon-box, .neon-text'), { opacity: [1, 0.72, 1, 0.9, 1], duration: 2600, loop: true, ease: 'linear', delay: 1200 });
  animate($$('.leaf'), { rotate: [-2, 2], duration: 3000, loop: true, alternate: true, ease: 'inOutSine' });
  const code = $('.code-scroll');
  if (code) animate(code, { translateY: [0, -110], duration: 9000, loop: true, ease: 'linear' });

  // 오른쪽 모니터: 초미니 플랫포머(장애물이 오면 점프, 넘으면 점수)
  const mini = $('.mini-hero'), obstacle = $('.mini-obstacle'), score = $('.mini-score');
  if (mini && obstacle) {
    let pts = 0;
    createTimeline({ loop: true, onLoop: () => { pts += 10; if (score) score.textContent = `SCORE ${String(pts).padStart(4, '0')}`; } })
      .add(obstacle, { translateX: [0, -180], duration: 1800, ease: 'linear' }, 0)
      .add(mini, { translateY: [0, -26, 0], duration: 520, ease: 'outQuad' }, 1100)
      .add(mini, { rotate: [0, 360], duration: 520, ease: 'inOutQuad' }, 1100);
  }

  // ── 책상: 김, 앞발 타자 + 눌린 키 불빛
  $$('.steam').forEach((s, i) => animate(s, { translateY: [4, -10], opacity: [0, 0.5, 0], scaleY: [0.8, 1.1], duration: 2400, delay: i * 1000, loop: true, ease: 'outSine' }));
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
}
