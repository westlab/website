#!/usr/bin/env node
// src/data/*.yaml の id が、ファイルの中で重複していないかを検査する。
// id が重複すると、Astro の file loader は片方のレコードを黙って捨てる（業績や OB・OG の1期分が消える）。
// YAML は js-yaml で読み、行番号は各ブロックの先頭行「- id: ...」と読み込み結果を順に照らして出す。
// `npm test` と pre-commit フックで実行される。使い方: node scripts/check-duplicate-ids.mjs [プロジェクトルート]（省略時はカレントディレクトリ）

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

const root = process.argv[2] ?? '.';
// src/content.config.ts で file() loader に渡している YAML（すべて id を持つ配列）
const FILES = ['pages', 'site', 'members', 'alumni', 'publications', 'links', 'videos', 'past-research'].map(
  (name) => `src/data/${name}.yaml`,
);
const problems = [];
const problem = (file, msg) => problems.push(`${file}: ${msg}`);
let total = 0;

for (const file of FILES) {
  const lines = readFileSync(join(root, file), 'utf8').split(/\r?\n/);
  let items;
  try {
    items = yaml.load(lines.join('\n'));
  } catch (e) {
    problem(file, `YAML を読めません。${e.reason ?? e.message}${e.mark ? `（${e.mark.line + 1}行目）` : ''}`);
    continue;
  }
  if (!Array.isArray(items)) {
    problem(file, 'id を持つ項目のリストではありません。');
    continue;
  }

  // 各ブロックの先頭行「- id: ...」の行番号（1始まり）。読み込み結果と同じ並び順・同じ個数であることを確かめる
  const starts = lines.flatMap((line, i) => (/^- id:/.test(line) ? [i + 1] : []));
  if (starts.length !== items.length) {
    problem(file, `各項目の先頭行を「- id: ...」の形にしてください（項目 ${items.length} 件に対し、その形の行が ${starts.length} 件です）。`);
    continue;
  }

  const seen = new Map(); // id → 最初に現れた行番号
  items.forEach((item, i) => {
    const id = String(item?.id);
    const line = starts[i];
    if (!seen.has(id)) return void seen.set(id, line);
    problem(
      file,
      `id「${id}」が重複しています（${seen.get(id)}行目と${line}行目）。どちらかの id を、ファイルの中で重複しないものに変えてください。`,
    );
  });
  total += items.length;
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error('\nid が重複すると、片方の項目がサイトに表示されません。');
  process.exit(1);
}
console.log(`id の重複なし OK（${FILES.length} ファイル、${total} 件）`);
