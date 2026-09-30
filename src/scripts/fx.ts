import { animate, random, scrambleText, set, splitText, stagger } from 'animejs';

// 모든 연출의 진입점(anime.js v4). 모션 줄이기 설정이면 아무것도 하지 않는다.
// 숨김 초기 상태는 <html class="js-fx"> 일 때만 걸리므로 JS 가 안 돌아도 내용은 보인다.
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function onVisible(els: Iterable<Element>, cb: (el: HTMLElement) => void, rootMargin = '0px 0px -8% 0px') {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        cb(e.target as HTMLElement);
      }
    },
    { rootMargin },
  );
  for (const el of els) io.observe(el);
}

/** `data-reveal` 은 혼자, `data-reveal-group` 은 자식들이 차례로 떠오른다 */
export function revealOnScroll(root: ParentNode = document) {
  if (reduced()) return;
  onVisible(root.querySelectorAll('[data-reveal]'), (el) =>
    animate(el, { opacity: [0, 1], translateY: [16, 0], duration: 700, ease: 'outExpo' }),
  );
  onVisible(root.querySelectorAll('[data-reveal-group]'), (g) =>
    animate(g.children, { opacity: [0, 1], translateY: [16, 0], duration: 700, delay: stagger(70), ease: 'outExpo' }),
  );
}

/** 제목: 글자가 아래 마스크에서 차례로 솟아오른다 */
export function headline(el: HTMLElement | null, start = 150) {
  if (!el || reduced()) return;
  const { chars } = splitText(el, { chars: { class: 'char', wrap: 'clip' } });
  el.style.opacity = '1';
  animate(chars, { translateY: ['110%', '0%'], duration: 900, delay: stagger(28, { start }), ease: 'outExpo' });
}

/** 영문 머리말이 터미널처럼 뒤섞이다 자리 잡는다 */
export function scramble(el: HTMLElement | null) {
  if (!el || reduced()) return;
  el.style.opacity = '1';
  animate(el, { innerHTML: scrambleText({ chars: 'A-Z0-9' }), duration: 1400 });
}

/** 경험치 바가 차오르고 숫자가 따라 오른다 */
export function xpBar(root: HTMLElement | null) {
  if (!root) return;
  const fill = root.querySelector<HTMLElement>('[data-xp-fill]');
  const num = root.querySelector<HTMLElement>('[data-xp-num]');
  const pct = Number(root.dataset.pct ?? 0);
  const to = Number(num?.dataset.value ?? 0);
  if (reduced()) return;
  if (fill) animate(fill, { width: ['0%', `${pct}%`], duration: 1600, delay: 500, ease: 'outExpo' });
  if (num) {
    const o = { v: 0 };
    animate(o, { v: to, duration: 1600, delay: 500, ease: 'outExpo', onUpdate: () => (num.textContent = Math.round(o.v).toLocaleString('ko-KR')) });
  }
}

/** 숫자가 0 에서 목표치까지 */
export function countUp(root: ParentNode = document) {
  if (reduced()) return;
  onVisible(root.querySelectorAll<HTMLElement>('[data-count]'), (el) => {
    const to = Number(el.dataset.count);
    const o = { v: 0 };
    animate(o, { v: to, duration: 1400, ease: 'outExpo', onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString('ko-KR')) });
  });
}

/** 썸네일 카드가 차례로 떠오른다 */
export function cardsIn(cards: HTMLElement[]) {
  if (reduced() || !cards.length) return;
  animate(cards, { opacity: [0, 1], translateY: [24, 0], scale: [0.97, 1], duration: 800, delay: stagger(60), ease: 'outExpo' });
}

/** 밑줄 탭 인디케이터가 선택된 탭으로 미끄러진다 */
export function moveIndicator(indicator: HTMLElement | null, tab: HTMLElement | null, instant = false) {
  if (!indicator || !tab) return;
  const to = { translateX: tab.offsetLeft, width: tab.offsetWidth };
  if (instant || reduced()) return set(indicator, to);
  animate(indicator, { ...to, duration: 420, ease: 'outExpo' });
}

/** 반딧불: 영역 안을 느리게 떠다니며 깜빡인다 */
export function fireflies(layer: HTMLElement | null, count = 14) {
  if (!layer || reduced()) return;
  const drift = (el: HTMLElement) =>
    animate(el, {
      translateX: random(-90, 90),
      translateY: random(-60, 60),
      duration: random(5000, 9000),
      ease: 'inOutSine',
      onComplete: () => drift(el),
    });
  for (let i = 0; i < count; i++) {
    const f = document.createElement('span');
    f.className = 'firefly';
    f.style.left = `${random(35, 100)}%`;
    f.style.top = `${random(10, 95)}%`;
    const size = random(2, 5);
    f.style.width = f.style.height = `${size}px`;
    layer.append(f);
    drift(f);
    animate(f, { opacity: [0, random(0.5, 1, 2)], duration: random(1200, 2800), delay: random(0, 2500), loop: true, alternate: true, ease: 'inOutSine' });
  }
}

/** 다이얼로그·패널 등장 */
export function popIn(el: Element) {
  if (reduced()) return;
  animate(el, { opacity: [0, 1], scale: [0.97, 1], translateY: [-6, 0], duration: 240, ease: 'outQuad' });
}

/** 하단 토스트 */
export function toast(message: string, icon = 'check_circle') {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('role', 'status');
  t.innerHTML = `<span class="msr">${icon}</span>${message}`;
  document.body.append(t);
  if (reduced()) return setTimeout(() => t.remove(), 1800);
  animate(t, { opacity: [0, 1], translateY: [12, 0], duration: 300, ease: 'outExpo' });
  animate(t, { opacity: 0, translateY: 8, duration: 300, delay: 1800, ease: 'inQuad', onComplete: () => t.remove() });
}

/** 북마크 아이콘이 톡 튄다 */
export function pop(el: Element) {
  if (reduced()) return;
  animate(el, { scale: [1, 1.35, 1], duration: 420, ease: 'outBack(2)' });
}
