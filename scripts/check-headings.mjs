#!/usr/bin/env node
// Markdown 本文に h1（`# ` / setext の `===`）が混ざっていないかを検査する。
// h1 は各ページの PageHero / ヒーローが担当するため、本文の見出しは ## から書く。
// front matter とコードブロック（``` / ~~~）の中は対象外。
// 使い方: node scripts/check-headings.mjs [ファイル ...]（引数なしなら src/**/*.md を全件検査）

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

function findH1(text) {
  const lines = text.split(/\r?\n/);
  const hits = [];
  let i = 0;
  // YAML front matter を読み飛ばす
  if (lines[0]?.trim() === '---') {
    i = 1;
    while (i < lines.length && lines[i].trim() !== '---') i++;
    i++;
  }
  let fence = null;
  for (; i < lines.length; i++) {
    const line = lines[i];
    const f = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
      continue;
    }
    if (fence) continue;
    if (/^ {0,3}#(\s|$)/.test(line)) hits.push(i + 1);
    else if (/^ {0,3}=+\s*$/.test(line) && i > 0 && lines[i - 1].trim() !== '') hits.push(i + 1);
  }
  return hits;
}

const args = process.argv.slice(2).filter((a) => a.endsWith('.md'));
const files = args.length ? args : process.argv.length > 2 ? [] : walk('src');

let found = 0;
for (const file of files) {
  for (const line of findH1(readFileSync(file, 'utf8'))) {
    console.error(`${file}:${line}`);
    found++;
  }
}

if (found) {
  console.error('\n本文の見出しは ## から書く（h1 はページタイトルが担当）。上記の行を ## に直してください。');
  process.exit(1);
}
