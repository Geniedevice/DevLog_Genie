import { reduced } from './fx';

// 창밖 밤하늘 캔버스: 반짝이는 별(깊이 3단) + 커서 주변 별자리 선 + 가끔 별똥별.
// 캔버스는 장면 전체 크기지만 창 모양으로 잘려 보이므로 별은 창 영역에만 뿌린다.
type Star = { x: number; y: number; z: number; r: number; phase: number; speed: number; color: string };
type Shoot = { x: number; y: number; vx: number; vy: number; life: number };

const COLORS = ['255,255,255', '214,206,255', '169,155,232', '143,212,193'];

export function startSky(canvas: HTMLCanvasElement, host: HTMLElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let w = 0, h = 0, dpr = 1;
  let running = false;
  const mouse = { x: -9999, y: -9999, on: false };
  const shoots: Shoot[] = [];

  // 창 영역(0~1): HeroScene 이 data-window="x0,x1,y0,y1" 로 넘겨준다(장면 모듈을 브라우저 번들에 싣지 않으려고)
  const [x0, x1, y0, y1] = (canvas.dataset.window ?? '0,1,0,1').split(',').map(Number);
  const stars: Star[] = Array.from({ length: 190 }, () => {
    const z = Math.random() ** 1.6; // 대부분 멀고 작게
    return {
      x: x0 + Math.random() * (x1 - x0),
      y: y0 + Math.random() * (y1 - y0),
      z,
      r: 0.4 + z * 1.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.8,
      color: COLORS[Math.random() < 0.7 ? 0 : 1 + Math.floor(Math.random() * 3)],
    };
  });

  const resize = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  new ResizeObserver(() => { resize(); if (!running) draw(performance.now()); }).observe(canvas);
  resize();

  host.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.on = true;
  });
  host.addEventListener('pointerleave', () => (mouse.on = false));

  function draw(t: number) {
    ctx!.clearRect(0, 0, w, h);
    const near: [number, number][] = [];
    for (const s of stars) {
      const px = s.x * w, py = s.y * h;
      const tw = reduced() ? 0.8 : 0.55 + 0.45 * Math.sin(t / 1000 * s.speed + s.phase);
      let a = (0.25 + s.z * 0.75) * tw;
      let r = s.r;
      if (mouse.on) {
        const d = Math.hypot(px - mouse.x, py - mouse.y);
        if (d < 120) {
          const k = 1 - d / 120;
          a = Math.min(1, a + k * 0.8);
          r += k * 1.4;
          near.push([px, py]);
        }
      }
      ctx!.beginPath();
      ctx!.fillStyle = `rgba(${s.color},${a.toFixed(3)})`;
      ctx!.arc(px, py, r, 0, Math.PI * 2);
      ctx!.fill();
      if (s.z > 0.85) {
        // 밝은 별은 십자 빛
        ctx!.strokeStyle = `rgba(${s.color},${(a * 0.35).toFixed(3)})`;
        ctx!.lineWidth = 0.6;
        ctx!.beginPath();
        ctx!.moveTo(px - r * 3, py); ctx!.lineTo(px + r * 3, py);
        ctx!.moveTo(px, py - r * 3); ctx!.lineTo(px, py + r * 3);
        ctx!.stroke();
      }
    }

    // 별자리: 커서 근처 별끼리 가까우면 잇는다
    if (near.length > 1) {
      ctx!.lineWidth = 0.8;
      for (let i = 0; i < near.length; i++) {
        for (let j = i + 1; j < near.length; j++) {
          const d = Math.hypot(near[i][0] - near[j][0], near[i][1] - near[j][1]);
          if (d > 70) continue;
          ctx!.strokeStyle = `rgba(169,155,232,${(0.55 * (1 - d / 70)).toFixed(3)})`;
          ctx!.beginPath();
          ctx!.moveTo(near[i][0], near[i][1]);
          ctx!.lineTo(near[j][0], near[j][1]);
          ctx!.stroke();
        }
      }
    }
    if (mouse.on) {
      const g = ctx!.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 90);
      g.addColorStop(0, 'rgba(169,155,232,0.18)');
      g.addColorStop(1, 'rgba(169,155,232,0)');
      ctx!.fillStyle = g;
      ctx!.fillRect(mouse.x - 90, mouse.y - 90, 180, 180);
    }

    // 별똥별
    for (let i = shoots.length - 1; i >= 0; i--) {
      const s = shoots[i];
      s.x += s.vx; s.y += s.vy; s.life -= 1;
      const tail = ctx!.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
      tail.addColorStop(0, `rgba(255,255,255,${Math.min(1, s.life / 30)})`);
      tail.addColorStop(1, 'rgba(169,155,232,0)');
      ctx!.strokeStyle = tail;
      ctx!.lineWidth = 1.6;
      ctx!.beginPath();
      ctx!.moveTo(s.x, s.y);
      ctx!.lineTo(s.x - s.vx * 14, s.y - s.vy * 14);
      ctx!.stroke();
      if (s.life <= 0) shoots.splice(i, 1);
    }
  }

  if (reduced()) return draw(0);

  let visible = true, nextShoot = performance.now() + 2500;
  const loop = (t: number) => {
    if (!visible || document.hidden) { running = false; return; }
    if (t > nextShoot) {
      const sx = (x0 + Math.random() * (x1 - x0) * 0.8 + (x1 - x0) * 0.2) * w;
      shoots.push({ x: sx, y: (y0 + Math.random() * 0.12) * h, vx: -(3 + Math.random() * 2), vy: 1.3 + Math.random(), life: 55 });
      nextShoot = t + 4000 + Math.random() * 5000;
    }
    draw(t);
    requestAnimationFrame(loop);
  };
  // 첫 프레임은 바로 그린다(탭이 가려져 rAF 가 멈춰 있어도 빈 하늘이 되지 않게)
  draw(performance.now());
  const start = () => { if (!running && visible && !document.hidden) { running = true; requestAnimationFrame(loop); } };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }).observe(canvas);
  document.addEventListener('visibilitychange', start);
  start();
}
