// 갤러리 타일 크기 규칙. 서버(첫 화면)와 브라우저(필터·정렬 후 재배치)가 같은 규칙을 쓴다.
// 보이는 순서 기준: 첫 장은 크게(2×2), 이후 6장마다 가로로 긴 것 하나·세로로 긴 것 하나를 섞어 리듬을 준다.
// ⚠️ 4번째를 세로로 길게 두면 글이 4편일 때 옆이 크게 빈다. 가로로 두면 빈칸이 많아야 한 칸이다.
export type TileSize = 'big' | 'tall' | 'wide' | '';

export function tileSize(i: number, withBig = true): TileSize {
  if (i === 0 && withBig) return 'big';
  if (i % 6 === 3) return 'wide';
  if (i % 6 === 5) return 'tall';
  return '';
}

/** 필터·정렬로 보이는 카드가 바뀌면 다시 크기를 매긴다 */
export function relayout(visible: HTMLElement[], withBig = true) {
  visible.forEach((el, i) => {
    el.classList.remove('big', 'tall', 'wide');
    const s = tileSize(i, withBig);
    if (s) el.classList.add(s);
  });
}
