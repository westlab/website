// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { inlineVar } from './src/lib/remark-inline-var.ts';
import { figure } from './src/lib/remark-figure.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.west.sd.keio.ac.jp',
  // noindex の検索ページは sitemap に載せない
  integrations: [sitemap({ filter: (page) => !page.endsWith('/search/') })],
  markdown: {
    processor: satteri({ mdastPlugins: [figure, inlineVar] }),
  },
});
