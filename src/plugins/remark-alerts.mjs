// GitHub 문법 `> [!NOTE]` 블록인용을 콜아웃으로 바꾼다. 외부 의존성 없이 mdast 를 직접 순회.
const TYPES = {
  NOTE: { label: '참고', icon: 'info' },
  TIP: { label: '팁', icon: 'lightbulb' },
  IMPORTANT: { label: '중요', icon: 'priority_high' },
  WARNING: { label: '주의', icon: 'warning' },
  CAUTION: { label: '위험', icon: 'dangerous' },
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
