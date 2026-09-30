// 아이콘 이름은 lucide(kebab-case)
export type NavKey = 'home' | 'projects' | 'stats' | 'archive' | 'tags' | 'about' | 'bookmarks';

export const NAV: { key: NavKey; label: string; icon: string; path: string }[] = [
  { key: 'home', label: '개발 일지', icon: 'file-text', path: '' },
  { key: 'projects', label: '프로젝트', icon: 'gamepad-2', path: 'projects/' },
  { key: 'stats', label: '통계', icon: 'chart-no-axes-column', path: 'stats/' },
  { key: 'archive', label: '연대기', icon: 'calendar-days', path: 'archive/' },
  { key: 'tags', label: '태그', icon: 'tag', path: 'tags/' },
  { key: 'about', label: '소개', icon: 'info', path: 'about/' },
];

export const BOOKMARKS = { key: 'bookmarks' as NavKey, label: '북마크', icon: 'bookmark', path: 'bookmarks/' };
