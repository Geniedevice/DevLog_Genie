// 차트 SVG 좌표 계산(빌드 시점). 렌더링은 각 차트 컴포넌트가, 움직임은 src/scripts/charts.ts 가 맡는다.

/** 눈금이 깔끔하게 떨어지는 최댓값과 눈금 간격 */
export function niceScale(max: number, ticks = 4) {
  if (max <= 0) return { max: ticks, step: 1 };
  const raw = max / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  return { max: Math.ceil(max / step) * step, step };
}

/** 점들을 부드러운 곡선으로(모노톤 유지: 값이 없는 달에 음수로 출렁이지 않게) */
export function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return pts.length ? `M${pts[0][0]} ${pts[0][1]}` : '';
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` C${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`;
  }
  return d;
}

/** 도넛 조각: 중심 (cx,cy), 반지름 r, 시작·끝 각(라디안, 12시 = 0) */
export function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => [cx + r * Math.sin(a), cy - r * Math.cos(a)].map((n) => n.toFixed(2)).join(' ');
  const large = a1 - a0 > Math.PI ? 1 : 0;
  // 한 바퀴 전체는 호 하나로 못 그리니 거의 한 바퀴로
  const end = a1 - a0 >= Math.PI * 2 ? a0 + Math.PI * 2 - 0.0001 : a1;
  return `M${p(a0)} A${r} ${r} 0 ${large} 1 ${p(end)}`;
}

export const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
