#!/usr/bin/env node
// 全ページのヒーロー画像（PageHero の image）が src/data/pages.yaml だけで決まっているかを検査する。
// トップのナビカードと遷移先のヒーローは同じ画像になり、研究詳細（research/<ファイル名>）も含めて
// パスの直書きは不可。各ページは次のどちらかで画像を取得する。
//   const page = await getNavPage('<id>');    → <PageHero image={page.data.image} />
//   const image = await getPageImage('<id>'); → <PageHero image={image} />
// （研究詳細は getPageImage(`research/${...}`)）
// `npm test` で実行される。使い方: node scripts/check-page-heroes.mjs [プロジェクトルート]（省略時はカレントディレクトリ）

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.argv[2] ?? '.';
const YAML = 'src/data/pages.yaml';
const problems = [];
const problem = (file, msg) => problems.push(`${file}: ${msg}`);

// pages.yaml は単純なリストなので、行ごとに id / image / nav / hero を拾う
const entries = new Map();
let cur = null;
for (const line of readFileSync(join(root, YAML), 'utf8').split(/\r?\n/)) {
  const id = line.match(/^- id:\s*(\S+)/);
  if (id) {
    cur = { id: id[1], image: null, nav: true, hero: false };
    if (entries.has(cur.id)) problem(YAML, `「${cur.id}」が重複しています。`);
    entries.set(cur.id, cur);
    continue;
  }
  if (!cur) continue;
  const image = line.match(/^\s+image:\s*(\S+)/);
  if (image) cur.image = image[1];
  if (/^\s+nav:\s*false\b/.test(line)) cur.nav = false;
  if (/^\s+hero:/.test(line)) cur.hero = true;
}

for (const { id, image, hero } of entries.values()) {
  if (hero) problem(YAML, `「${id}」に hero があります。ヒーロー画像だけ別にすることはできません。image を使ってください。`);
  if (!image) problem(YAML, `「${id}」に image がありません。`);
  else if (!existsSync(join(root, 'public', image))) problem(YAML, `「${id}」の画像 public${image} が存在しません。`);
}

const listFiles = (dir) =>
  readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listFiles(join(dir, e.name)) : [join(dir, e.name)],
  );

// 研究詳細の front matter に hero を残さない（写真は pages.yaml の research/<ファイル名> に置く）
const topics = readdirSync(join(root, 'src/content/research/ja'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.slice(0, -3));
for (const file of listFiles('src/content/research').filter((f) => f.endsWith('.md'))) {
  const front = readFileSync(join(root, file), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  if (/^hero:/m.test(front)) problem(file, 'front matter に hero があります。写真は pages.yaml に書いてください。');
}

// PageHero を使う全ページを検査する
const used = new Set();
for (const file of listFiles('src/pages').filter((f) => f.endsWith('.astro'))) {
  const src = readFileSync(join(root, file), 'utf8');
  const hero = src.match(/<PageHero\b[^>]*?\bimage=(\{[^}]*\}|"[^"]*"|'[^']*')/s);
  if (!/<PageHero\b/.test(src)) continue;
  const rel = relative('.', file);

  // 取得元の id（研究詳細は research/${...} をトピック全件に展開する）
  const ids = [];
  for (const m of src.matchAll(/getNavPage\(\s*['"]([^'"]+)['"]\s*\)|getPageImage\(\s*['"]([^'"]+)['"]\s*\)/g)) ids.push(m[1] ?? m[2]);
  if (/getPageImage\(\s*`research\/\$\{[^}]+\}`\s*\)/.test(src)) ids.push(...topics.map((t) => `research/${t}`));

  if (!hero || !/^\{\s*(page\.data\.image|image|heroImage)\s*\}$/.test(hero[1]))
    problem(rel, `PageHero の image が pages.yaml の値ではありません（${hero ? hero[1] : '指定なし'}）。パスを直書きせず、getNavPage か getPageImage で取得してください。`);
  if (!ids.length) problem(rel, 'pages.yaml から画像を取得していません（getNavPage / getPageImage を使ってください）。');
  for (const id of ids) {
    used.add(id);
    if (!entries.has(id)) problem(rel, `pages.yaml に「${id}」がありません。`);
  }
}

// 使われていない pages.yaml のエントリ（研究トピックの消し忘れなど）
for (const id of entries.keys()) if (!used.has(id)) problem(YAML, `「${id}」を使うページがありません。`);

if (problems.length) {
  console.error(problems.join('\n'));
  console.error('\nヒーロー画像は pages.yaml の image だけで決めてください（Nav Card を持たないページは nav: false）。');
  process.exit(1);
}
console.log(`ヒーロー画像の pages.yaml への一元化 OK（${entries.size} ページ）`);
