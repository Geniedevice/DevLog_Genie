export type NavKey = 'home' | 'tags' | 'archive' | 'about';

export const NAV: { key: NavKey; label: string; icon: string; path: string }[] = [
  { key: 'home', label: '길드', icon: 'castle', path: '' },
  { key: 'tags', label: '각인', icon: 'diamond', path: 'tags/' },
  { key: 'archive', label: '연대기', icon: 'auto_stories', path: 'archive/' },
  { key: 'about', label: '모험가', icon: 'shield_person', path: 'about/' },
];
