export type NavKey = 'home' | 'archive' | 'tags' | 'about' | 'bookmarks';

export const NAV: { key: NavKey; label: string; icon: string; path: string }[] = [
  { key: 'home', label: '개발 일지', icon: 'menu_book', path: '' },
  { key: 'archive', label: '연대기', icon: 'calendar_month', path: 'archive/' },
  { key: 'tags', label: '태그', icon: 'sell', path: 'tags/' },
  { key: 'about', label: '소개', icon: 'info', path: 'about/' },
];

export const BOOKMARKS = { key: 'bookmarks' as NavKey, label: '북마크', icon: 'bookmark', path: 'bookmarks/' };
