import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 글 하나 = 폴더 하나(`posts/<slug>/index.md` + 이미지). 단일 `<slug>.md` 도 허용.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      // 글 폴더 기준 상대 경로(`./cover.png`). 빌드 때 WebP·여러 크기로 최적화된다.
      cover: image().optional(),
      coverAlt: z.string().optional(),
      // 썸네일 위에 크게 얹는 문구(유튜브 썸네일처럼). 줄바꿈은 \n, 두 번째 줄은 강조색.
      thumbText: z.string().optional(),
      // 픽셀아트 커버면 true: 확대해도 흐려지지 않게 한다(사진에는 쓰지 말 것)
      pixelArt: z.boolean().default(false),
      category: z.string().default('Devlog'),
      tags: z.array(z.string()).default([]),
      series: z.string().optional(),
      pinned: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts };
