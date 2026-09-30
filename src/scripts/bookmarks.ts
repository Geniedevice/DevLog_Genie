import { pop, toast } from './fx';

// 북마크는 방문자 본인 브라우저에만 저장된다(서버 없음). 저장소가 막혀 있어도 페이지는 정상 동작해야 한다.
const KEY = 'devlog:bookmarks';

export function getBookmarks(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function save(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    toast('이 브라우저에서는 북마크를 저장할 수 없습니다', 'error');
  }
}

function paint(btn: HTMLElement, on: boolean) {
  btn.setAttribute('aria-pressed', String(on));
  btn.setAttribute('aria-label', on ? '북마크 해제' : '북마크');
  const icon = btn.querySelector('.msr');
  icon?.classList.toggle('fill', on);
  const label = btn.querySelector('[data-bm-label]');
  if (label) label.textContent = on ? '저장됨' : '북마크';
}

/** `[data-bookmark="<post id>"]` 버튼을 모두 연결한다 */
export function wireBookmarks(root: ParentNode = document) {
  const set = new Set(getBookmarks());
  root.querySelectorAll<HTMLElement>('[data-bookmark]').forEach((btn) => {
    const id = btn.dataset.bookmark!;
    paint(btn, set.has(id));
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const now = new Set(getBookmarks());
      const on = !now.has(id);
      on ? now.add(id) : now.delete(id);
      save([...now]);
      // 같은 글의 버튼이 여러 개일 수 있다(카드 + 본문)
      document.querySelectorAll<HTMLElement>(`[data-bookmark="${CSS.escape(id)}"]`).forEach((b) => paint(b, on));
      pop(btn.querySelector('.msr') ?? btn);
      toast(on ? '북마크에 저장했어요' : '북마크에서 뺐어요', on ? 'bookmark_added' : 'bookmark_remove');
      // ⚠️ 카드 링크로 클릭이 새지 않게 전파를 막으므로, 목록을 다시 그려야 하는 쪽은 이 이벤트를 듣는다
      document.dispatchEvent(new CustomEvent('bookmarks:change', { detail: { id, on } }));
    });
  });
}
