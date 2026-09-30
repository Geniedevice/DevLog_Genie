import { getPosts, postUrl, formatDate } from '../lib/posts';
import { rankOf, questNo } from '../lib/quest';

export async function GET() {
  const posts = await getPosts();
  const index = posts.map((p) => ({
    title: p.data.title,
    description: p.data.description,
    tags: p.data.tags,
    category: p.data.category,
    date: formatDate(p.data.date),
    url: postUrl(p),
    rank: rankOf(p),
    no: questNo(p, posts),
    // 본문 전체를 넣으면 글이 쌓일수록 인덱스가 커진다. 마크다운 기호만 걷어내고 앞부분만 싣는다.
    text: (p.body ?? '').replace(/```[\s\S]*?```/g, ' ').replace(/[#>*_`\[\]()!|-]/g, ' ').replace(/\s+/g, ' ').slice(0, 3000),
  }));
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json' } });
}
