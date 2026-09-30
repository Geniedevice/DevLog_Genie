// lucide(shadcn/ui 기본 아이콘) SVG 문자열을 사이트 규격으로 다듬는다.
// 빌드 시점(Icon.astro)과 브라우저 스크립트(개별 파일을 ?raw 로 가져옴) 양쪽에서 쓴다.
export function iconSvg(raw: string, opts: { size?: number; class?: string; stroke?: number; fill?: boolean } = {}) {
  const { size = 18, class: cls = '', stroke = 2, fill = false } = opts;
  return raw
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<svg[^>]*>/, (tag) =>
      tag
        .replace(/\s(class|width|height|stroke-width|fill)="[^"]*"/g, '')
        .replace('<svg', `<svg class="icon ${cls}" width="${size}" height="${size}" stroke-width="${stroke}" fill="${fill ? 'currentColor' : 'none'}" aria-hidden="true" focusable="false"`),
    )
    .replace(/\s*\n\s*/g, ' ')
    .trim();
}
