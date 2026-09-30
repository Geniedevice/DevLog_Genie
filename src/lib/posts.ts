import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const url = (path = ''): string =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

export const postUrl = (post: Post) => url(`posts/${post.id}/`);
export const tagUrl = (tag: string) => url(`tags/${encodeURIComponent(tag)}/`);

export function formatDate(d: Date): string {
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' });
}

// 한글은 단어 수가 의미가 없어서 글자 수 기준(분당 약 500자). 코드 블록은 훑어보는 속도라 절반만 센다.
export function readingMinutes(body = ''): number {
  const code = (body.match(/```[\s\S]*?```/g) ?? []).join('');
  const prose = body.replace(/```[\s\S]*?```/g, '');
  const chars = prose.replace(/\s+/g, '').length + code.replace(/\s+/g, '').length / 2;
  return Math.max(1, Math.round(chars / 500));
}

export function tagCounts(posts: Post[]): [string, number][] {
  const map = new Map<string, number>();
  for (const p of posts) for (const t of p.data.tags) map.set(t, (map.get(t) ?? 0) + 1);
  return [...map].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

// 태그가 겹칠수록, 같은 카테고리일수록 가깝다. 하나도 안 겹치면 싣지 않는다.
export function relatedTo(post: Post, all: Post[], limit = 3): Post[] {
  const tags = new Set(post.data.tags);
  return all
    .filter((p) => p.id !== post.id)
    .map((p) => ({ p, score: p.data.tags.filter((t) => tags.has(t)).length * 2 + (p.data.category === post.data.category ? 1 : 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.date.valueOf() - a.p.data.date.valueOf())
    .slice(0, limit)
    .map((x) => x.p);
}
