// public/images 配下の画像サイズの基準。check-image-sizes.mjs（検査）と compress-images.mjs（圧縮）で共有する。
export const MAX_BYTES = 500 * 1024; // 1ファイルの上限
export const MAX_PX = 2400; // 長辺の上限（検査）
export const PHOTO_PX = 1920; // JPEG の長辺の目安（圧縮）
export const FIGURE_PX = 1600; // PNG の長辺の目安（圧縮）
export const JPEG_QUALITY = 80;
export const MIN_SAVING = 0.05; // 圧縮で書き換えるのは、この割合以上小さくなるときだけ
