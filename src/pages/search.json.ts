import { getImage } from 'astro:assets';
import { getPosts, postUrl, formatDate, readingMinutes } from '../lib/posts';

export async function GET() {
  const posts = await getPosts();
  const index = await Promise.all(
    posts.map(async (p) => ({
      id: p.id,
      title: p.data.title,
      description: p.data.description,
      tags: p.data.tags,
      category: p.data.category,
      date: formatDate(p.data.date),
      minutes: readingMinutes(p.body),
      url: postUrl(p),
      thumb: p.data.cover ? (await getImage({ src: p.data.cover, width: 320, format: 'webp' })).src : null,
      // 본문 전체를 넣으면 글이 쌓일수록 인덱스가 커진다. 마크다운 기호만 걷어내고 앞부분만 싣는다.
      text: (p.body ?? '').replace(/```[\s\S]*?```/g, ' ').replace(/[#>*_`\[\]()!|-]/g, ' ').replace(/\s+/g, ' ').slice(0, 3000),
    })),
  );
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json' } });
}
