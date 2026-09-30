import { getPosts, type Post } from './posts';

export type GamePost = Post & { data: Post['data'] & { game: NonNullable<Post['data']['game']> } };

/** frontmatter 에 game 이 있는 글 = 게임 프로젝트 소개. 선택 화면 순서(order)대로 */
export async function getGames(): Promise<GamePost[]> {
  const posts = await getPosts();
  return posts.filter((p): p is GamePost => !!p.data.game).sort((a, b) => a.data.game.order - b.data.game.order);
}
