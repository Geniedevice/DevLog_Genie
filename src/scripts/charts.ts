import { animate, createDrawable, set, stagger } from 'animejs';
import { reduced } from './fx';

// 차트: 툴팁 + 화면에 들어올 때 한 번 재생되는 등장 애니메이션.
// ⚠️ 스크롤 전까지 완성된 모양이 보였다가 0 으로 튀면 어색하다. 그래서 시작 상태를 먼저 set() 해 둔다.

type Prep = { start: () => void };

const PREP: Record<string, (el: HTMLElement) => Prep> = {
  area(el) {
    const line = el.querySelectorAll<SVGPathElement>('.line');
    const drawable = createDrawable(line);
    set(drawable, { draw: '0 0' });
    set(el.querySelectorAll('.fill'), { opacity: 0 });
    set(el.querySelectorAll('.dot'), { scale: 0 });
    return {
      start: () => {
        animate(drawable, { draw: ['0 0', '0 1'], duration: 1400, ease: 'inOutCubic' });
        animate(el.querySelectorAll('.fill'), { opacity: [0, 1], duration: 900, delay: 500, ease: 'outQuad' });
        animate(el.querySelectorAll('.dot'), { scale: [0, 1], duration: 500, delay: stagger(70, { start: 300 }), ease: 'outBack(3)' });
      },
    };
  },
  bar(el) {
    const bars = el.querySelectorAll('.bar');
    set(bars, { scaleY: 0 });
    return { start: () => animate(bars, { scaleY: [0, 1], duration: 900, delay: stagger(90), ease: 'outElastic(1, .7)' }) };
  },
  donut(el) {
    const segs = createDrawable(el.querySelectorAll<SVGPathElement>('.seg'));
    set(segs, { draw: '0 0' });
    return { start: () => animate(segs, { draw: ['0 0', '0 1'], duration: 700, delay: stagger(450), ease: 'inOutQuad' }) };
  },
  hbar(el) {
    const fills = [...el.querySelectorAll<HTMLElement>('.fill')];
    set(fills, { width: '0%' });
    return { start: () => fills.forEach((f, i) => animate(f, { width: ['0%', `${f.dataset.w}%`], duration: 900, delay: i * 80, ease: 'outExpo' })) };
  },
  heatmap(el) {
    const cells = el.querySelectorAll('.grid .cell');
    const cols = Number(el.dataset.cols);
    set(cells, { scale: 0.2, opacity: 0 });
    // 칸 순서가 행 우선이라 grid:[열, 행]. 오늘(오른쪽 끝)에서 과거로 번져 나간다
    return { start: () => animate(cells, { scale: [0.2, 1], opacity: [0, 1], duration: 500, delay: stagger(9, { grid: [cols, 7], from: 'last' }), ease: 'outBack(2)' }) };
  },
  radial(el) {
    const g = createDrawable(el.querySelectorAll<SVGPathElement>('.gauge'));
    set(g, { draw: '0 0' });
    return { start: () => animate(g, { draw: ['0 0', '0 1'], duration: 1600, ease: 'outExpo' }) };
  },
  kpi(el) {
    const line = el.querySelectorAll<SVGPathElement>('.spark-line');
    if (!line.length) return { start: () => {} };
    const d = createDrawable(line);
    set(d, { draw: '0 0' });
    set(el.querySelectorAll('.spark-area'), { opacity: 0 });
    return {
      start: () => {
        animate(d, { draw: ['0 0', '0 1'], duration: 1200, ease: 'inOutCubic' });
        animate(el.querySelectorAll('.spark-area'), { opacity: [0, 0.14], duration: 800, delay: 600 });
      },
    };
  },
};

export function animateCharts(root: ParentNode = document) {
  wireTooltips();
  if (reduced()) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        preps.get(e.target)?.start();
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  const preps = new Map<Element, Prep>();
  root.querySelectorAll<HTMLElement>('[data-chart]').forEach((el) => {
    const p = PREP[el.dataset.chart!]?.(el);
    if (!p) return;
    preps.set(el, p);
    io.observe(el);
  });
}

let wired = false;
function wireTooltips() {
  if (wired) return;
  wired = true;
  const tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.setAttribute('role', 'tooltip');
  document.body.append(tip);

  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const show = (target: HTMLElement, x: number, y: number) => {
    const data = JSON.parse(target.dataset.tip!) as { t: string; r: [string, string, string][] };
    tip.innerHTML = `<b>${esc(data.t)}</b>${data.r.map(([l, v, c]) => `<div class="row"><i style="background:${c}"></i>${esc(l)}<span>${esc(v)}</span></div>`).join('')}`;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = `${Math.min(innerWidth - w - 8, Math.max(8, x + 14))}px`;
    tip.style.top = `${Math.max(8, y - h - 12)}px`;
    tip.classList.add('on');
  };
  document.addEventListener('pointermove', (e) => {
    const t = (e.target as HTMLElement).closest?.<HTMLElement>('[data-tip]');
    if (t) show(t, e.clientX, e.clientY);
    else tip.classList.remove('on');
  });
  document.addEventListener('scroll', () => tip.classList.remove('on'), { passive: true });
}
