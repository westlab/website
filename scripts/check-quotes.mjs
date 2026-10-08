#!/usr/bin/env node
// 全角の二重引用符 “ (U+201C) と ” (U+201D) の向きの間違いを検査する。
// 各行で “ と ” が「“ → ” → “ → ”」と交互に現れ、行末で閉じていることを要求する。
// 開き引用符は “、閉じ引用符は ” を使う（例: Nishi, “Title”）。
// Markdown はコードブロック（``` / ~~~）の中だけ対象外（front matter も検査する）。
// 警告のみ: 問題を表示するが終了コードは常に 0（lint / pre-commit を止めない）。
// 使い方: node scripts/check-quotes.mjs [ファイル ...]（引数なしなら src/**/*.md と src/**/*.yaml を全件検査）

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const OPEN = '“';
const CLOSE = '”';

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.md') || e.name.endsWith('.yaml')) out.push(p);
  }
  return out;
}

function excerpt(line, idx) {
  const start = Math.max(0, idx - 20);
  const end = Math.min(line.length, idx + 20);
  return (start > 0 ? '…' : '') + line.slice(start, end).trim() + (end < line.length ? '…' : '');
}

function check(file) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  const problems = [];
  const isMd = file.endsWith('.md');
  let fence = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isMd) {
      const f = line.match(/^ {0,3}(`{3,}|~{3,})/);
      if (f) {
        if (!fence) fence = f[1][0];
        else if (f[1][0] === fence) fence = null;
        continue;
      }
      if (fence) continue;
    }
    let open = false;
    let openIdx = -1;
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === OPEN) {
        if (open) {
          problems.push([i + 1, j, '閉じ引用符は ” を使う（“ が連続している）']);
          open = false;
        } else {
          open = true;
          openIdx = j;
        }
      } else if (c === CLOSE) {
        if (!open) {
          problems.push([i + 1, j, '開き引用符は “ を使う（閉じ引用符 ” が先に現れている）']);
        } else open = false;
      }
    }
    if (open) problems.push([i + 1, openIdx, '閉じられていない引用符 “']);
  }
  return problems.map(([n, idx, msg]) => ({ file, n, text: excerpt(lines[n - 1], idx), msg }));
}

const args = process.argv.slice(2).filter((a) => a.endsWith('.md') || a.endsWith('.yaml'));
const files = args.length ? args : process.argv.length > 2 ? [] : walk('src');

let found = 0;
for (const file of files) {
  for (const p of check(file)) {
    console.warn(`警告 ${p.file}:${p.n}  ${p.text}  （${p.msg}）`);
    found++;
  }
}

if (found) {
  console.warn('\n警告: 引用符は 開き “ ・閉じ ” の向きで対にする。上記の行を直してください（lint は失敗しません）。');
}
