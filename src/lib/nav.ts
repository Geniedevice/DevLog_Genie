export type NavKey = 'home' | 'tags' | 'archive' | 'about';

export const NAV: { key: NavKey; label: string; icon: string; path: string }[] = [
  { key: 'home', label: '홈', icon: 'home', path: '' },
  { key: 'tags', label: '태그', icon: 'sell', path: 'tags/' },
  { key: 'archive', label: '아카이브', icon: 'inventory_2', path: 'archive/' },
  { key: 'about', label: '소개', icon: 'person', path: 'about/' },
];
