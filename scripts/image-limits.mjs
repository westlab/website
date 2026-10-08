// public/images 配下の画像サイズの基準。check-image-sizes.mjs（検査）と compress-images.mjs（圧縮）で共有する。
import { statSync } from 'node:fs';
import sharp from 'sharp';
export const MAX_BYTES = 500 * 1024; // 1ファイルの上限
export const MAX_PX = 2400; // 長辺の上限（検査）
export const PHOTO_PX = 1920; // JPEG の長辺の目安（圧縮）
export const FIGURE_PX = 1600; // PNG の長辺の目安（圧縮）
export const JPEG_QUALITY = 80;
export const MIN_SAVING = 0.05; // 圧縮で書き換えるのは、この割合以上小さくなるときだけ

// 圧縮を試し、書き換えるべきかを判定する。check-image-sizes.mjs と compress-images.mjs が同じ判断をするよう、ここに一本化する。
// 寸法も容量も基準内なら再エンコードしない（JPEG の劣化を避ける）。
// 書き換えるのは、寸法が目安を超えるときか、5%以上小さくなるときだけ。結果はメモリ上で返し、ファイルは書かない。
export async function planCompression(file) {
  const before = statSync(file).size;
  const isPng = /\.png$/i.test(file);
  const limit = isPng ? FIGURE_PX : PHOTO_PX;
  const { width = 0, height = 0 } = await sharp(file).rotate().toBuffer({ resolveWithObject: true }).then((r) => r.info);
  const oversized = Math.max(width, height) > limit;
  if (!oversized && before <= MAX_BYTES) return { write: false, before, out: null };
  const resized = sharp(file).rotate().resize({ width: limit, height: limit, fit: 'inside', withoutEnlargement: true });
  const out = await (isPng
    ? resized.png({ palette: true, compressionLevel: 9 })
    : resized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
  ).toBuffer();
  return { write: oversized || out.length <= before * (1 - MIN_SAVING), before, out };
}
