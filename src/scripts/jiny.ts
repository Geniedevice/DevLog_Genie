import { animate, random } from 'animejs';
import { mountRig, type ViewBox } from '../vendor/rev2d-player.js';
import { achievement, reduced } from './fx';
import { sfx } from './sfx';

// JINY: 일러스트 한 장(art/jiny)을 Rev2D 아바타로 리깅한 텍스처 리그를 WebGL2 로 실시간 구동.
// 리그의 idle 애니메이션(숨쉬기·몸 흔들림) 위에 커서 시선, 무작위 깜빡임, 클릭 반응을 파라미터로 얹는다.
// 감은 눈·벌린 입은 그려 넣은 스프라이트, 머리카락·드릴 포니테일·리본은 리그 물리(진자)가 따라 흔든다.
const NEON = ['#7b8cff', '#8fd4c1', '#f29cc8', '#f2cf7a', '#e7ebf5'];
const LINES = ['빌드 성공!', '버그 잡았다 🐛', '커밋 완료 ✨', '한 줄만 더…', 'GAS 최고', '크래시 없음!', '시리얼 맛있다'];

// 모델·텍스처는 페이지에 JINY 가 여럿(히어로·사이드바)이어도 한 번만 받는다
let assets: Promise<{ model: { meta: { width: number; height: number } }; images: Record<string, ImageBitmap> }> | undefined;
const load = (base: string) => (assets ??= (async () => {
  const model = await (await fetch(base + 'jiny.rig.json')).json();
  const entries = await Promise.all(model.textures.map(async (t: { id: string; path: string }) =>
    [t.id, await createImageBitmap(await (await fetch(base + t.path)).blob())] as const));
  return { model, images: Object.fromEntries(entries) };
})());

export async function animateJiny(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  let jiny: ReturnType<typeof mountRig>;
  try {
    const { model, images } = await load(root.dataset.base!);
    const view: ViewBox = [0, 0, model.meta.width, model.meta.height]; // 일러스트 전체(리본 끝~가슴)
    jiny = mountRig(canvas, model as never, view, images);
  } catch {
    return; // WebGL2 없음·로딩 실패: 정지 그림(img)이 그대로 보인다
  }
  root.dataset.live = '';

  const fit = () => {
    const s = Math.round(canvas.clientWidth * Math.min(devicePixelRatio, 2));
    if (s && canvas.width !== s) canvas.width = canvas.height = s;
  };
  new ResizeObserver(fit).observe(canvas);
  fit();

  if (reduced()) {
    const still = () => jiny.frame({ time: 0, physics: false });
    still();
    new ResizeObserver(still).observe(canvas);
    return;
  }

  // 시선: 커서를 향해(부드럽게 따라감). 커서가 한동안 없으면 정면으로 돌아온다
  const look = { x: 0, y: 0 }, aim = { x: 0, y: 0 };
  let lastMove = -1e9;
  addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    aim.x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 1.2)));
    aim.y = Math.max(-1, Math.min(1, -(e.clientY - (r.top + r.height * 0.4)) / (r.height * 1.2)));
    lastMove = performance.now();
  }, { passive: true });

  // 눈 깜빡임: 2.5~5.5초마다, 가끔 두 번
  let blinkAt = 1.5, blinkTwice = false;
  const eyeOpen = (t: number) => {
    const d = t - blinkAt;
    const one = (u: number) => (u < 0 || u > 0.22 ? 1 : Math.abs(u - 0.08) / (u < 0.08 ? 0.08 : 0.14));
    const v = Math.min(one(d), blinkTwice ? one(d - 0.26) : 1);
    if (d > 0.6) { blinkAt = t + random(2.5, 5.5, 2); blinkTwice = Math.random() < 0.25; }
    return Math.min(1, v);
  };

  // 클릭 반응: 깡충 + 고개 갸웃(머리카락·리본이 출렁) + 웃으며 말하기
  let pokedAt = -1e9;
  const poke = root.querySelector<HTMLButtonElement>('[data-poke]');
  poke?.addEventListener('click', () => {
    if (now() - pokedAt < 0.9) return;
    pokedAt = now();
    sfx('jump');
    achievement('poke-jiny', 'JINY와 첫 인사');
    burst(root);
    say(root);
  });

  const t0 = performance.now();
  const now = () => (performance.now() - t0) / 1000;
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) requestAnimationFrame(tick); }).observe(canvas);

  let prev = 0;
  function tick() {
    if (!visible) return;
    const t = now(), dt = Math.min(0.05, t - prev);
    prev = t;
    const idle = performance.now() - lastMove > 4000;
    const k = 1 - Math.exp(-dt * 5);
    look.x += ((idle ? 0 : aim.x) - look.x) * k;
    look.y += ((idle ? 0 : aim.y) - look.y) * k;
    const p = t - pokedAt; // 클릭 뒤 경과 초
    const hop = p < 0.6 ? Math.sin((p / 0.6) * Math.PI) ** 1.5 : 0;
    const happy = p < 1.8 ? Math.min(1, p * 8, (1.8 - p) * 3) : 0;
    canvas.style.translate = hop ? `0 ${(-hop * 4).toFixed(2)}%` : '';
    const eyes = eyeOpen(t);
    jiny.frame({
      time: t,
      animations: ['idle'],
      params: {
        AngleX: look.x * 18 + Math.sin(t * 0.9) * 2, // ±20 안: 파츠가 벌어지지 않는 범위
        AngleY: look.y * 14 + Math.sin(t * 1.3) * 1.5 - hop * 6,
        AngleZ: Math.sin(t * 0.7) * 2 + happy * 7 * Math.sin(Math.min(p, 1) * Math.PI),
        EyeBallX: look.x * 0.8,
        EyeBallY: look.y * 0.7,
        EyeLOpen: eyes,
        EyeROpen: eyes,
        Cheek: happy,
        MouthForm: happy,
        MouthOpen: happy * (0.3 + 0.5 * Math.abs(Math.sin(p * 11))),
      },
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
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
