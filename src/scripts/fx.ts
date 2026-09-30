import { animate, createDrawable, createTimeline, random, scrambleText, splitText, stagger } from 'animejs';

// 모든 연출의 진입점. 모션 줄이기 설정이면 아무것도 하지 않고, 요소는 CSS 기본값(보이는 상태)으로 남는다.
// 숨김 초기 상태는 <html class="js-fx"> 일 때만 걸리므로 JS 가 안 돌아도 내용은 보인다.
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function onVisible(els: Iterable<Element>, cb: (el: HTMLElement) => void, rootMargin = '0px 0px -10% 0px') {
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
    animate(el, { opacity: [0, 1], translateY: [24, 0], duration: 800, ease: 'outExpo' }),
  );
  onVisible(root.querySelectorAll('[data-reveal-group]'), (g) =>
    animate(g.children, { opacity: [0, 1], translateY: [24, 0], duration: 800, delay: stagger(90), ease: 'outExpo' }),
  );
}

/** 제목 글자가 하나씩 튀어 오르며 자리 잡는다 */
export function titleIntro(el: HTMLElement | null, start = 200) {
  if (!el || reduced()) return;
  const { chars } = splitText(el, { chars: { class: 'char' } });
  el.style.opacity = '1';
  animate(chars, {
    opacity: [0, 1],
    translateY: ['0.7em', '0em'],
    rotate: [14, 0],
    duration: 900,
    delay: stagger(40, { start }),
    ease: 'outBack(1.6)',
  });
}

/** 룬 문자가 풀리듯 글자가 드러난다 */
export function runeScramble(el: HTMLElement | null) {
  if (!el || reduced()) return;
  animate(el, { innerHTML: scrambleText({ chars: 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ' }), duration: 1600 });
}

/** 마법진: 선이 그려진 뒤 천천히 회전(회전은 CSS) */
export function drawMagicCircle(root: Element | null) {
  if (!root || reduced()) return;
  const lines = root.querySelectorAll<SVGGeometryElement>('.draw');
  animate(createDrawable(lines), { draw: ['0 0', '0 1'], duration: 2200, delay: stagger(140), ease: 'inOutQuad' });
  animate(root.querySelectorAll('.rune'), { opacity: [0, 1], duration: 1200, delay: stagger(30, { start: 900 }), ease: 'outQuad' });
}

/** 숫자가 0 에서 목표치까지 차오른다 */
export function countUp(root: ParentNode = document) {
  if (reduced()) return;
  onVisible(root.querySelectorAll<HTMLElement>('[data-count]'), (el) => {
    const to = Number(el.dataset.count);
    const o = { v: 0 };
    animate(o, {
      v: to,
      duration: 1600,
      ease: 'outExpo',
      onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString('ko-KR')),
    });
  });
}

/** 게시판: 의뢰서가 위에서 떨어져 핀에 꽂히고, 도장이 쾅 찍힌다 */
export function boardIntro(board: HTMLElement | null) {
  if (!board || reduced()) return;
  onVisible(
    [board],
    () => {
      const posters = [...board.querySelectorAll<HTMLElement>('[data-poster]')].filter((p) => !p.closest('[hidden]'));
      const tl = createTimeline();
      posters.forEach((p, i) =>
        tl.add(p, { opacity: [0, 1], translateY: [-70, 0], rotate: [random(-16, 16), 0], scale: [1.06, 1], duration: 850, ease: 'outBack(1.2)' }, i * 110),
      );
      const stamps = posters.flatMap((p) => [...p.querySelectorAll('[data-stamp]')]);
      stamps.forEach((s, i) =>
        tl.add(s, { opacity: [0, 1], scale: [2.8, 1], duration: 360, ease: 'outQuad' }, posters.length * 110 + 350 + i * 110),
      );
    },
    '0px 0px -12% 0px',
  );
}

/** 필터를 바꿨을 때 새로 보이는 의뢰서만 가볍게 */
export function reshuffle(els: HTMLElement[]) {
  if (reduced() || !els.length) return;
  animate(els, { opacity: [0, 1], translateY: [18, 0], duration: 450, delay: stagger(60), ease: 'outQuad' });
  animate(els.flatMap((e) => [...e.querySelectorAll('[data-stamp]')]), { opacity: [0, 1], scale: [2.2, 1], duration: 300, delay: stagger(60, { start: 250 }), ease: 'outQuad' });
}

/** 도장 하나 (글 상단 등) */
export function stampIn(el: Element | null, delay = 600) {
  if (!el || reduced()) return;
  animate(el, { opacity: [0, 1], scale: [3, 1], rotate: [-30, -12], duration: 420, delay, ease: 'outQuad' });
}

/** 반딧불: 화면 곳곳을 느리게 떠다니며 깜빡인다 */
export function fireflies(layer: HTMLElement | null, count = 16) {
  if (!layer || reduced()) return;
  const drift = (el: HTMLElement) =>
    animate(el, {
      translateX: random(-140, 140),
      translateY: random(-120, 120),
      duration: random(6000, 11000),
      ease: 'inOutSine',
      onComplete: () => drift(el),
    });
  for (let i = 0; i < count; i++) {
    const f = document.createElement('span');
    f.className = 'firefly';
    f.style.left = `${random(0, 100)}%`;
    f.style.top = `${random(0, 100)}%`;
    const size = random(3, 6);
    f.style.width = f.style.height = `${size}px`;
    layer.append(f);
    drift(f);
    animate(f, { opacity: [0, random(0.5, 1, 2)], duration: random(1400, 3200), delay: random(0, 3000), loop: true, alternate: true, ease: 'inOutSine' });
  }
}

/** 다이얼로그 등장 */
export function popIn(el: Element) {
  if (reduced()) return;
  animate(el, { opacity: [0, 1], scale: [0.96, 1], translateY: [-8, 0], duration: 260, ease: 'outQuad' });
}
