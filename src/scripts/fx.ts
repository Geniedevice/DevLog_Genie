import { animate, set, stagger } from 'animejs';
import { icon, type IconName } from './icons';
import { sfx } from './sfx';

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

/** 숫자가 0 에서 목표치까지 */
export function countUp(root: ParentNode = document) {
  if (reduced()) return;
  onVisible(root.querySelectorAll<HTMLElement>('[data-count]'), (el) => {
    const to = Number(el.dataset.count);
    const o = { v: 0 };
    animate(o, { v: to, duration: 1400, ease: 'outExpo', onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString('ko-KR')) });
  });
}

/** 분류 · 정렬을 바꾼 결과가 도착한다(누른 것이 원인인 등장만. 스크롤로는 띄우지 않는다) */
export function cardsIn(cards: HTMLElement[]) {
  if (reduced() || !cards.length) return;
  animate(cards, { opacity: [0, 1], translateY: [12, 0], duration: 520, delay: stagger(50), ease: 'outExpo' });
}

/** 밑줄 탭 인디케이터가 선택된 탭으로 미끄러진다 */
export function moveIndicator(indicator: HTMLElement | null, tab: HTMLElement | null, instant = false) {
  if (!indicator || !tab) return;
  const to = { translateX: tab.offsetLeft, width: tab.offsetWidth };
  if (instant || reduced()) return set(indicator, to);
  animate(indicator, { ...to, duration: 420, ease: 'outExpo' });
}

/** 다이얼로그·패널 등장 */
export function popIn(el: Element) {
  if (reduced()) return;
  animate(el, { opacity: [0, 1], scale: [0.97, 1], translateY: [-6, 0], duration: 240, ease: 'outQuad' });
}

function showToast(t: HTMLElement, hold: number) {
  document.querySelector('.toast')?.remove();
  t.setAttribute('role', 'status');
  document.body.append(t);
  if (reduced()) return setTimeout(() => t.remove(), hold);
  animate(t, { opacity: [0, 1], translateY: [16, 0], scale: [0.94, 1], duration: 360, ease: 'outBack(2)' });
  animate(t, { opacity: 0, translateY: 8, duration: 300, delay: hold, ease: 'inQuad', onComplete: () => t.remove() });
}

/** 하단 토스트 */
export function toast(message: string, name: IconName = 'circle-check') {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `${icon(name)}${message}`;
  showToast(t, 1800);
}

/** 게임식 업적 달성 알림. 같은 업적은 한 번만 뜬다(브라우저에 기록) */
export function achievement(id: string, title: string) {
  const key = `devlog:achv:${id}`;
  try {
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, '1');
  } catch {
    return false;
  }
  const t = document.createElement('div');
  t.className = 'toast achv';
  t.innerHTML = `<span class="badge-ico">${icon('trophy', 18)}</span><span><small>ACHIEVEMENT UNLOCKED</small>${title}</span>`;
  showToast(t, 2600);
  sfx('achievement');
  return true;
}

/** 북마크 아이콘이 톡 튄다 */
export function pop(el: Element) {
  if (reduced()) return;
  animate(el, { scale: [1, 1.35, 1], duration: 420, ease: 'outBack(2)' });
}
