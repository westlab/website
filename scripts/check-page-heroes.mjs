#!/usr/bin/env node
// トップのナビカードと、遷移先ページのヒーロー画像が常に同じ画像になっているかを検査する。
// 画像は src/data/pages.yaml の image を唯一の情報源とし、各ページは PageHero に
// image={page.data.image} を渡す（個別のパス直書きや hero の上書きは不可）。
// `npm test` で実行される。使い方: node scripts/check-page-heroes.mjs [プロジェクトルート]（省略時はカレントディレクトリ）

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? '.';
const YAML = 'src/data/pages.yaml';
const problems = [];
const problem = (file, msg) => problems.push(`${file}: ${msg}`);

// pages.yaml は単純なリストなので、行ごとに id / image / hero を拾う
const entries = [];
let cur = null;
for (const line of readFileSync(join(root, YAML), 'utf8').split(/\r?\n/)) {
  const id = line.match(/^- id:\s*(\S+)/);
  if (id) {
    cur = { id: id[1], image: null, hero: false };
    entries.push(cur);
    continue;
  }
  if (!cur) continue;
  const image = line.match(/^\s+image:\s*(\S+)/);
  if (image) cur.image = image[1];
  if (/^\s+hero:/.test(line)) cur.hero = true;
}

for (const { id, image, hero } of entries) {
  if (hero) problem(YAML, `「${id}」に hero があります。ヒーロー画像だけ別にすることはできません。image を使ってください。`);
  if (!image) problem(YAML, `「${id}」に image がありません。`);
  else if (!existsSync(join(root, 'public', image))) problem(YAML, `「${id}」の画像 public${image} が存在しません。`);

  const file = `src/pages/${id}/index.astro`;
  const path = join(root, file);
  if (!existsSync(path)) {
    problem(file, `「${id}」の遷移先ページがありません。`);
    continue;
  }
  const src = readFileSync(path, 'utf8');
  if (!new RegExp(`p\\.id\\s*===\\s*['"]${id}['"]`).test(src))
    problem(file, `pages.yaml の「${id}」を読み込んでいません（pages.find((p) => p.id === '${id}') で取得してください）。`);
  if (!/<PageHero\b[^>]*\bimage=\{\s*page\.data\.image\s*\}/s.test(src))
    problem(file, 'PageHero の image が {page.data.image} ではありません。');
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error('\nトップのナビカードと遷移先のヒーロー画像は pages.yaml の image を共通で使ってください。');
  process.exit(1);
}
console.log(`ナビカードとヒーロー画像の共通化 OK（${entries.length} ページ）`);
