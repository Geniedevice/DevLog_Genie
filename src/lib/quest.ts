import { readingMinutes, type Post } from './posts';

// 글을 "토벌 의뢰"로 보여 주기 위한 수치. 분량이 곧 난이도라서 읽는 시간으로 등급을 매긴다.
export type Rank = 'S' | 'A' | 'B' | 'C';

export function rankOf(post: Post): Rank {
  const m = readingMinutes(post.body);
  if (m >= 12) return 'S';
  if (m >= 6) return 'A';
  if (m >= 3) return 'B';
  return 'C';
}

export const RANK_LABEL: Record<Rank, string> = { S: '전설', A: '영웅', B: '숙련', C: '일반' };

// 보상 경험치: 분당 250 EXP, 50 단위로 끊는다
export function expOf(post: Post): number {
  return Math.max(100, Math.round((readingMinutes(post.body) * 250) / 50) * 50);
}

// 의뢰 번호는 오래된 글부터 1번. 새 글이 생겨도 기존 번호는 그대로다.
export function questNo(post: Post, all: Post[]): string {
  const ordered = [...all].sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf() || a.id.localeCompare(b.id));
  return String(ordered.findIndex((p) => p.id === post.id) + 1).padStart(3, '0');
}

// 게시판에 핀으로 꽂힌 종이가 조금씩 삐뚤어져 있도록. 글마다 고정된 값이라 새로고침해도 같다.
export function tiltOf(post: Post): number {
  let h = 0;
  for (const c of post.id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 7) - 3) * 0.6;
}
