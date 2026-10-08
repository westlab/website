// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { inlineVar } from './src/lib/remark-inline-var.ts';
import { figure } from './src/lib/remark-figure.ts';

// https://astro.build/config
export default defineConfig({
  markdown: {
    processor: satteri({ mdastPlugins: [figure, inlineVar] }),
  },
});
