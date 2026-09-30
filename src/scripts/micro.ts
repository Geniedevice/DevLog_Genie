import { animate } from 'animejs';
import { reduced } from './fx';

// 마이크로 인터랙션: 사용자의 손짓에 바로 반응하는 작은 움직임들.
// 이벤트 위임으로 한 번만 걸어 두므로 나중에 생긴 요소(검색 결과 등)에도 적용된다.
const MAGNETIC = '.btn-default, .chip, .search-box, [data-magnetic]';
const RIPPLE = '.btn, .chip, .item, .pill, .tab';
const TILT = '[data-tilt]';

export function wireMicro() {
  if (reduced()) return;
  const coarse = matchMedia('(pointer: coarse)').matches;

  // 자석: 커서 쪽으로 살짝 끌려오고, 벗어나면 탄성 있게 제자리로
  if (!coarse) {
    let current: HTMLElement | null = null;
    document.addEventListener('pointermove', (e) => {
      const el = (e.target as Element).closest?.<HTMLElement>(MAGNETIC) ?? null;
      if (current && current !== el) {
        animate(current, { translateX: 0, translateY: 0, duration: 700, ease: 'outElastic(1, .45)' });
      }
      current = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      animate(el, { translateX: dx * 0.18, translateY: dy * 0.3, duration: 250, ease: 'outQuad' });
    });
  }

  // 물결: 누른 자리에서 퍼져 나간다
  document.addEventListener('pointerdown', (e) => {
    const el = (e.target as Element).closest?.<HTMLElement>(RIPPLE);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.2;
    const dot = document.createElement('span');
    dot.className = 'ripple';
    dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.append(dot);
    animate(dot, { scale: [0, 1], opacity: [0.35, 0], duration: 650, ease: 'outQuad', onComplete: () => dot.remove() });
  });

  // 기울기: 카드가 커서 방향으로 입체감 있게 기울고, 빛 반사가 따라온다
  if (!coarse) {
    document.addEventListener('pointermove', (e) => {
      const el = (e.target as Element).closest?.<HTMLElement>(TILT);
      document.querySelectorAll<HTMLElement>(`${TILT}[data-tilting]`).forEach((other) => {
        if (other === el) return;
        other.removeAttribute('data-tilting');
        animate(other, { rotateX: 0, rotateY: 0, duration: 600, ease: 'outElastic(1, .6)' });
        other.style.setProperty('--glare', '0');
      });
      if (!el) return;
      el.setAttribute('data-tilting', '');
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      animate(el, { rotateX: (0.5 - py) * 8, rotateY: (px - 0.5) * 10, duration: 300, ease: 'outQuad' });
      el.style.setProperty('--gx', `${px * 100}%`);
      el.style.setProperty('--gy', `${py * 100}%`);
      el.style.setProperty('--glare', '1');
    });
  }
}
