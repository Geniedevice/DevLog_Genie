import { reduced } from './fx';

// 페이지 전체 배경: 깊이 3단 별 + 성운 두 덩이. 스크롤하면 먼 층일수록 느리게 흘러 입체감이 난다.
// 한 번 그린 별 타일을 스크롤 오프셋만큼 밀어 붙이는 방식이라 가볍다(매 프레임 별을 다시 계산하지 않음).
const TIERS = [
  { count: 90, size: [0.4, 0.9], speed: 0.12, alpha: 0.35 },
  { count: 50, size: [0.7, 1.3], speed: 0.32, alpha: 0.55 },
  { count: 22, size: [1.1, 1.9], speed: 0.62, alpha: 0.8 },
];
const TILE = 900; // 세로 반복 단위(px)

export function startBackdrop(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let w = 0, h = 0, dpr = 1;
  const stars = TIERS.map((t) =>
    Array.from({ length: t.count }, () => ({
      x: Math.random(),
      y: Math.random() * TILE,
      r: t.size[0] + Math.random() * (t.size[1] - t.size[0]),
      phase: Math.random() * Math.PI * 2,
    })),
  );

  const dark = () => document.documentElement.dataset.theme !== 'light';
  const resize = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    w = innerWidth;
    h = innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  function draw(t: number) {
    const sy = scrollY;
    ctx!.clearRect(0, 0, w, h);
    const isDark = dark();

    // 성운: 가장 느리게 움직이는 큰 빛덩이
    const blobs = [
      { x: 0.78, y: 0.25, r: 0.5, c: isDark ? '169,155,232' : '122,104,214', a: isDark ? 0.09 : 0.06, speed: 0.08 },
      { x: 0.25, y: 0.85, r: 0.45, c: isDark ? '143,212,193' : '47,157,132', a: isDark ? 0.06 : 0.045, speed: 0.16 },
    ];
    for (const b of blobs) {
      const cy = ((b.y * h - sy * b.speed) % (h * 1.6) + h * 1.6) % (h * 1.6) - h * 0.3;
      const g = ctx!.createRadialGradient(b.x * w, cy, 0, b.x * w, cy, b.r * Math.max(w, h));
      g.addColorStop(0, `rgba(${b.c},${b.a})`);
      g.addColorStop(1, `rgba(${b.c},0)`);
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, w, h);
    }

    TIERS.forEach((tier, i) => {
      const off = (sy * tier.speed) % TILE;
      const color = isDark ? '231,235,245' : '122,104,214';
      for (const s of stars[i]) {
        let y = s.y - off;
        if (y < 0) y += TILE;
        for (let yy = y; yy < h; yy += TILE) {
          const tw = t ? 0.6 + 0.4 * Math.sin(t / 900 + s.phase) : 0.8;
          ctx!.fillStyle = `rgba(${color},${(tier.alpha * tw * (isDark ? 1 : 0.35)).toFixed(3)})`;
          ctx!.beginPath();
          ctx!.arc(s.x * w, yy, s.r, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    });
  }

  resize();
  addEventListener('resize', () => { resize(); draw(0); });
  new MutationObserver(() => draw(performance.now())).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  if (reduced()) {
    draw(0);
    addEventListener('scroll', () => draw(0), { passive: true });
    return;
  }
  draw(performance.now());
  // 반짝임은 30fps 면 충분하다
  let last = 0;
  const loop = (t: number) => {
    if (!document.hidden && t - last > 33) {
      last = t;
      draw(t);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
