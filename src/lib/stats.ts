import { readingMinutes, tagCounts, type Post } from './posts';
import { levelOf, streakOf } from './quest';

// 차트·표에 들어가는 수치는 전부 여기서 글 데이터로 계산한다(빌드 시점).
const DAY = 86400e3;
const KST = 9 * 3600e3;
const kstDay = (d: Date) => Math.floor((d.valueOf() + KST) / DAY);
const monthKey = (d: Date) => new Date(d.valueOf() + KST).toISOString().slice(0, 7);

export type Month = { key: string; label: string; count: number; minutes: number };

/** 최근 n개월(글이 없는 달도 0으로 채움). 기준은 가장 최근 글이 있는 달 */
export function monthly(posts: Post[], n = 12): Month[] {
  const last = posts.length ? new Date(Math.max(...posts.map((p) => p.data.date.valueOf())) + KST) : new Date(Date.now() + KST);
  const out: Month[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth() - i, 1));
    const key = d.toISOString().slice(0, 7);
    const list = posts.filter((p) => monthKey(p.data.date) === key);
    out.push({ key, label: `${d.getUTCMonth() + 1}월`, count: list.length, minutes: list.reduce((s, p) => s + readingMinutes(p.body), 0) });
  }
  return out;
}

export function byCategory(posts: Post[]) {
  const m = new Map<string, number>();
  for (const p of posts) m.set(p.data.category, (m.get(p.data.category) ?? 0) + 1);
  return [...m].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

export const topTags = (posts: Post[], n = 8) => tagCounts(posts).slice(0, n).map(([name, count]) => ({ name, count }));

/** 읽는 시간 분포 */
export function readingBuckets(posts: Post[]) {
  const buckets = [
    { label: '~2분', min: 0, max: 2 },
    { label: '3–5분', min: 3, max: 5 },
    { label: '6–10분', min: 6, max: 10 },
    { label: '11–20분', min: 11, max: 20 },
    { label: '20분+', min: 21, max: Infinity },
  ];
  return buckets.map((b) => ({ label: b.label, count: posts.filter((p) => { const m = readingMinutes(p.body); return m >= b.min && m <= b.max; }).length }));
}

export type HeatCell = { day: number; date: string; count: number; level: 0 | 1 | 2 | 3 | 4; future: boolean };

/**
 * 깃허브식 활동 잔디: weeks 주 × 7일. 마지막 열은 기준일이 든 주.
 * ⚠️ 기준일은 "빌드한 날"이다. 글을 안 올려도 재배포하면 잔디가 한 칸씩 밀린다.
 */
export function heatmap(posts: Post[], weeks = 26, today = new Date()): HeatCell[][] {
  const counts = new Map<number, number>();
  for (const p of posts) counts.set(kstDay(p.data.date), (counts.get(kstDay(p.data.date)) ?? 0) + 1);
  const t = kstDay(today);
  const weekday = new Date(t * DAY).getUTCDay(); // 0 = 일요일
  const start = t - weekday - (weeks - 1) * 7;
  const cols: HeatCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: HeatCell[] = [];
    for (let d = 0; d < 7; d++) {
      const day = start + w * 7 + d;
      const count = counts.get(day) ?? 0;
      col.push({
        day,
        date: new Date(day * DAY).toISOString().slice(0, 10),
        count,
        level: count === 0 ? 0 : count === 1 ? 2 : count === 2 ? 3 : 4,
        future: day > t,
      });
    }
    cols.push(col);
  }
  return cols;
}

export function totals(posts: Post[]) {
  const minutes = posts.reduce((s, p) => s + readingMinutes(p.body), 0);
  return {
    posts: posts.length,
    minutes,
    avgMinutes: posts.length ? Math.round((minutes / posts.length) * 10) / 10 : 0,
    tags: tagCounts(posts).length,
    categories: new Set(posts.map((p) => p.data.category)).size,
    streak: streakOf(posts),
    // level: 현재 레벨, xp: 이번 레벨에서 모은 XP, next: 레벨당 필요 XP, total: 누적 XP
    ...levelOf(posts),
  };
}
