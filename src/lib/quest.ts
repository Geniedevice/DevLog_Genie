import { readingMinutes, type Post } from './posts';

// 글쓰기를 "경험치"로 보여 주기 위한 수치. 전부 글에서 계산하므로 따로 입력할 것이 없다.

/** 글 하나의 경험치: 읽는 시간 분당 50 XP, 최소 50 */
export function xpOf(post: Post): number {
  return Math.max(50, readingMinutes(post.body) * 50);
}

const XP_PER_LEVEL = 1000;

export function levelOf(posts: Post[]) {
  const total = posts.reduce((n, p) => n + xpOf(p), 0);
  return { level: Math.floor(total / XP_PER_LEVEL) + 1, xp: total % XP_PER_LEVEL, next: XP_PER_LEVEL, total };
}

/**
 * 가장 최근 글 날짜에서 거꾸로 하루도 빠짐없이 글이 있었던 날 수.
 * ⚠️ "오늘 기준"으로 세면 빌드한 날에 따라 숫자가 바뀌므로, 마지막으로 쓴 날 기준으로 센다.
 */
export function streakOf(posts: Post[]): number {
  const days = new Set(posts.map((p) => kstDay(p.data.date)));
  if (!days.size) return 0;
  let day = Math.max(...days);
  let n = 0;
  while (days.has(day)) {
    n++;
    day--;
  }
  return n;
}

const kstDay = (d: Date) => Math.floor((d.valueOf() + 9 * 3600e3) / 86400e3);
