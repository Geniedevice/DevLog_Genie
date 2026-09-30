// 방문자가 "다 읽었어요"를 누른 글 목록(이 브라우저에만 저장). 탐험률·카드 배지·체크박스가 공유한다.
const KEY = 'devlog:read';

export function getRead(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function setRead(id: string, on: boolean) {
  const s = new Set(getRead());
  on ? s.add(id) : s.delete(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...s]));
  } catch {
    /* 저장이 막혀도 이번 화면에서는 동작 */
  }
  document.dispatchEvent(new CustomEvent('read:change', { detail: { id, on } }));
}

/** 목록 카드에 "읽음" 표시 */
export function markReadCards(root: ParentNode = document) {
  const read = new Set(getRead());
  root.querySelectorAll<HTMLElement>('[data-card]').forEach((c) => c.classList.toggle('is-read', read.has(c.dataset.id ?? '')));
}
