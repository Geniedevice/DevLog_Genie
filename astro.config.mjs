import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { remarkAlerts } from './src/plugins/remark-alerts.mjs';

export default defineConfig({
  site: 'https://geniedevice.github.io',
  // 레포 이름이 곧 Pages 하위 경로. 커스텀 도메인을 붙이면 '/' 로 바꾼다.
  base: '/DevLog_Genie',
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    // `> [!NOTE]` 콜아웃 플러그인이 remark 기반이라 기본 처리기(Sätteri) 대신 unified 를 쓴다
    processor: unified({ remarkPlugins: [remarkAlerts] }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      defaultColor: false,
      wrap: false,
    },
  },
});
