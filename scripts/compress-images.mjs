#!/usr/bin/env node
// public/images 配下の画像を上限内に圧縮する（上書き）。check-image-sizes.mjs の基準に合わせる。
// 写真(JPEG): 長辺1920px以内・品質80 / 図版(PNG): 幅1600px以内・パレット化。縮小・小容量化できた場合だけ書き換える。
// 使い方: node scripts/compress-images.mjs [対象ファイルまたはディレクトリ…]（省略時は public/images 全体）

import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

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
  const img = sharp(file).rotate();
  const { width = 0, height = 0 } = await img.metadata();
  const resized = isPng
    ? img.resize({ width: 1600, withoutEnlargement: true })
    : img.resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true });
  const out = await (isPng
    ? resized.png({ palette: true, compressionLevel: 9 })
    : resized.jpeg({ quality: 80, mozjpeg: true })
  ).toBuffer();
  const { width: w2 = 0 } = await sharp(out).metadata();
  if (out.length < before || w2 < width) {
    writeFileSync(file, out);
    console.log(`${file}: ${Math.round(before / 1024)}KB -> ${Math.round(out.length / 1024)}KB`);
  }
}
