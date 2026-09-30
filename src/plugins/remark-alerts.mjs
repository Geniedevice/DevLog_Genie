// GitHub 문법 `> [!NOTE]` 블록인용을 콜아웃으로 바꾼다. 외부 의존성 없이 mdast 를 직접 순회.
const TYPES = {
  NOTE: { label: '기록', icon: 'edit_note' },
  TIP: { label: '현자의 조언', icon: 'auto_awesome' },
  IMPORTANT: { label: '길드 공지', icon: 'campaign' },
  WARNING: { label: '함정 주의', icon: 'warning' },
  CAUTION: { label: '치명적 위험', icon: 'skull' },
};

function walk(node) {
  if (!node.children) return;
  for (const child of node.children) {
    if (child.type === 'blockquote') transform(child);
    walk(child);
  }
}

function transform(bq) {
  const para = bq.children[0];
  const text = para?.type === 'paragraph' ? para.children[0] : null;
  if (!text || text.type !== 'text') return;
  const m = text.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/i);
  if (!m) return;
  const type = m[1].toUpperCase();
  const { label, icon } = TYPES[type];
  text.value = text.value.slice(m[0].length);
  if (!text.value) para.children.shift();
  if (para.children.length === 0) bq.children.shift();
  bq.data = { hName: 'aside', hProperties: { className: ['callout', `callout-${type.toLowerCase()}`] } };
  bq.children.unshift({
    type: 'paragraph',
    data: { hName: 'p', hProperties: { className: ['callout-title'] } },
    children: [{ type: 'html', value: `<span class="msr" aria-hidden="true">${icon}</span>${label}` }],
  });
}

export function remarkAlerts() {
  return (tree) => walk(tree);
}
