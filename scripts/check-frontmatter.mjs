#!/usr/bin/env node
// src/content/**/*.md の front matter を検査する。
// - 先頭が --- で始まり、--- で閉じている
// - YAML として読める
// - 必須キーがある（research: title・order・icon・summary、pages: title。src/content.config.ts のスキーマと揃える）
// 問題があれば終了コード1。使い方: node scripts/check-frontmatter.mjs

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

const REQUIRED = {
  'src/content/research': ['title', 'order', 'icon', 'summary'],
  'src/content/pages': ['title'],
};
const HINT = '（: を含む値は "..." で囲む）';

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

function check(file, required) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  if (lines[0] !== '---') return [[1, 'front matter が --- で始まっていません']];
  const end = lines.indexOf('---', 1);
  if (end === -1) return [[1, 'front matter が --- で閉じられていません']];
  let data;
  try {
    data = yaml.load(lines.slice(1, end).join('\n'));
  } catch (e) {
    // js-yaml の行番号は front matter 内の相対位置（0始まり）。ファイル上の行は +2
    const line = (e.mark?.line ?? 0) + 2;
    return [[line, `YAML として読めません: ${e.reason ?? e.message}${HINT}`]];
  }
  if (data === null || typeof data !== 'object') return [[1, 'front matter が空です']];
  return required.filter((k) => data[k] === undefined || data[k] === null).map((k) => [1, `必須キー ${k} がありません`]);
}

let errors = 0;
for (const [dir, required] of Object.entries(REQUIRED)) {
  for (const file of walk(dir)) {
    for (const [n, msg] of check(file, required)) {
      console.error(`エラー ${file}:${n}  ${msg}`);
      errors++;
    }
  }
}

if (errors) {
  console.error('\nエラー: front matter を直してください。');
  process.exit(1);
}
