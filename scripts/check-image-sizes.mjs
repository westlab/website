#!/usr/bin/env node
// public/images 配下の画像が重すぎないかを検査する。
// 長辺 2400px 超、または 500KB 超で圧縮すれば小さくなる画像があれば、一覧を表示して終了コード 1 で終わる。
// 500KB 超でも、compress-images.mjs と同じ設定で圧縮して5%以上小さくならない画像は、注意として表示するだけで合格にする。
// public/images 配下の画像は Astro のビルド時最適化を通らず、そのまま配信されるため、事前に圧縮しておく。
// （Markdown から相対パスで参照した画像は、Astro がビルド時に webp 化する。）
// 写真は JPEG 長辺1920px・品質80前後、図版は PNG 長辺1600px・パレット化が目安。`npm run compress:images` で圧縮できる。
// 使い方: node scripts/check-image-sizes.mjs [プロジェクトルート]（省略時はカレントディレクトリ）

import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import sharp from 'sharp';
import { MAX_BYTES, MAX_PX, planCompression } from './image-limits.mjs';

const root = process.argv[2] ?? '.';
const DIR = join(root, 'public/images');
const EXT_COMPRESSIBLE = /\.(png|jpe?g)$/i;
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
const notices = [];
for (const file of walk(DIR)) {
  const name = relative(root, file);
  const bytes = statSync(file).size;
  const { width = 0, height = 0 } = await sharp(file).metadata();
  const kb = Math.round(bytes / 1024);
  if (Math.max(width, height) > MAX_PX) {
    problems.push(`${name}: ${width}x${height}px（長辺の上限 ${MAX_PX}px）`);
  } else if (bytes > MAX_BYTES) {
    // 重い処理は 500KB 超の画像だけ。圧縮できない形式（webp など）は縮められないので注意に回す。
    const plan = EXT_COMPRESSIBLE.test(file) ? await planCompression(file) : { write: false };
    if (plan.write) problems.push(`${name}: ${kb}KB（上限 ${MAX_BYTES / 1024}KB）。圧縮で ${Math.round(plan.out.length / 1024)}KB になります`);
    else notices.push(`${name}: ${kb}KB（上限超過だが、圧縮しても5%以上小さくならないため許容）`);
  }
}

if (notices.length) {
  console.warn(`注意: 500KB を超えていますが、これ以上縮まない画像があります（${notices.length}件）:`);
  for (const n of notices) console.warn(`  ${n}`);
}
if (problems.length) {
  console.error(`重い画像があります（${problems.length}件）:`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('`npm run compress:images` を実行して圧縮してください。');
  process.exit(1);
}
console.log('画像サイズ: OK');
