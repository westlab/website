#!/usr/bin/env node
// public/images 配下の画像が重すぎないかを検査する。
// 1ファイル 500KB 超、または長辺 2400px 超があれば一覧を表示して終了コード 1 で終わる。
// public/images 配下の画像は Astro のビルド時最適化を通らず、そのまま配信されるため、事前に圧縮しておく。
// （Markdown から相対パスで参照した画像は、Astro がビルド時に webp 化する。）
// 写真は JPEG 長辺1920px・品質80前後、図版は PNG 長辺1600px・パレット化が目安。`npm run compress:images` で圧縮できる。
// 使い方: node scripts/check-image-sizes.mjs [プロジェクトルート]（省略時はカレントディレクトリ）

import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import sharp from 'sharp';
import { MAX_BYTES, MAX_PX } from './image-limits.mjs';

const root = process.argv[2] ?? '.';
const DIR = join(root, 'public/images');
const EXT = /\.(png|jpe?g|webp|gif|avif)$/i;

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (EXT.test(e.name)) out.push(p);
  }
  return out;
}

const problems = [];
for (const file of walk(DIR)) {
  const name = relative(root, file);
  const bytes = statSync(file).size;
  const { width = 0, height = 0 } = await sharp(file).metadata();
  if (bytes > MAX_BYTES) problems.push(`${name}: ${Math.round(bytes / 1024)}KB（上限 ${MAX_BYTES / 1024}KB）`);
  if (Math.max(width, height) > MAX_PX) problems.push(`${name}: ${width}x${height}px（長辺の上限 ${MAX_PX}px）`);
}

if (problems.length) {
  console.error(`重い画像があります（${problems.length}件）:`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log('画像サイズ: OK');
