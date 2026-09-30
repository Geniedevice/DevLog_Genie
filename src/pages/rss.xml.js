import rss from '@astrojs/rss';
import { getPosts, postUrl } from '../lib/posts';
import { SITE } from '../site.config';

export async function GET(context) {
  const posts = await getPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      categories: [p.data.category, ...p.data.tags],
      link: postUrl(p),
    })),
    customData: `<language>ko</language>`,
  });
}
