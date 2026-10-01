import { getPosts, type Post } from './posts';

export type GamePost = Post & { data: Post['data'] & { game: NonNullable<Post['data']['game']> } };

/** frontmatter 에 game 이 있는 글 = 게임 프로젝트 소개. order 는 만든 순서라, 큰 값(최신)이 앞에 온다 */
export async function getGames(): Promise<GamePost[]> {
  const posts = await getPosts();
  return posts.filter((p): p is GamePost => !!p.data.game).sort((a, b) => b.data.game.order - a.data.game.order);
}
