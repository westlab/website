#!/usr/bin/env node
// public/images 配下の画像を上限内に圧縮する（上書き）。基準は image-limits.mjs（check-image-sizes.mjs と共通）。
// 写真(JPEG): 長辺1920px以内・品質80 / 図版(PNG): 長辺1600px以内・パレット化。
// すでに容量・寸法が基準内の画像は処理しない。書き換えるのは、5%以上小さくなるときか、寸法を縮めるときだけ。
// 使い方: node scripts/compress-images.mjs [対象ファイルまたはディレクトリ…]（省略時は public/images 全体）

import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { FIGURE_PX, JPEG_QUALITY, MAX_BYTES, MIN_SAVING, PHOTO_PX } from './image-limits.mjs';

const EXT = /\.(png|jpe?g)$/i;
const targets = process.argv.slice(2);
if (!targets.length) targets.push('public/images');

function walk(p) {
  if (statSync(p).isFile()) return EXT.test(p) ? [p] : [];
  return readdirSync(p, { withFileTypes: true }).flatMap((e) => walk(join(p, e.name)));
}

for (const file of targets.flatMap(walk)) {
  const before = statSync(file).size;
  const isPng = /\.png$/i.test(file);
  const limit = isPng ? FIGURE_PX : PHOTO_PX;
  const img = sharp(file).rotate();
  const { width = 0, height = 0 } = await sharp(file).rotate().toBuffer({ resolveWithObject: true }).then((r) => r.info);
  const oversized = Math.max(width, height) > limit;
  // 寸法も容量も基準内なら再エンコードしない（JPEG の劣化を避ける）
  if (!oversized && before <= MAX_BYTES) continue;
  const resized = img.resize({ width: limit, height: limit, fit: 'inside', withoutEnlargement: true });
  const out = await (isPng
    ? resized.png({ palette: true, compressionLevel: 9 })
    : resized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
  ).toBuffer();
  if (oversized || out.length <= before * (1 - MIN_SAVING)) {
    writeFileSync(file, out);
    console.log(`${file}: ${Math.round(before / 1024)}KB -> ${Math.round(out.length / 1024)}KB`);
  }
}
