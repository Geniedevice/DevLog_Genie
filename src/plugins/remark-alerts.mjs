import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// GitHub 문법 `> [!NOTE]` 블록인용을 콜아웃으로 바꾼다. 외부 의존성 없이 mdast 를 직접 순회.
const TYPES = {
  NOTE: { label: '참고', icon: 'info' },
  TIP: { label: '팁', icon: 'lightbulb' },
  IMPORTANT: { label: '중요', icon: 'circle-alert' },
  WARNING: { label: '주의', icon: 'triangle-alert' },
  CAUTION: { label: '위험', icon: 'octagon-x' },
};

// lucide SVG 파일을 빌드 때 읽어 본문에 그대로 넣는다(아이콘 폰트 없이)
const require = createRequire(import.meta.url);
const svg = (name) =>
  readFileSync(require.resolve(`lucide-static/icons/${name}.svg`), 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s(class|width|height)="[^"]*"/g, '')
    .replace('<svg', '<svg class="icon" width="18" height="18" aria-hidden="true"')
    .replace(/\s*\n\s*/g, ' ')
    .trim();

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
    children: [{ type: 'html', value: `${svg(icon)}${label}` }],
  });
}

export function remarkAlerts() {
  return (tree) => walk(tree);
}
