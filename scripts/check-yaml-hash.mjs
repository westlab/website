#!/usr/bin/env node
// YAML の値の書き方を検査して、文章が黙って切れたり変わったりするのを防ぐ。対象は src/data/*.yaml と、src/content/**/*.md の front matter。
//
// 1. publications.yaml の citation は、ブロック形式（`citation: >-` の次の行から字下げして貼る）で書く。
//    ブロック形式の中は # : " \ をそのまま書け、複数行に分かれていても1行につながる。
//    "..." や引用符なしだと、`Rust #2 and C# Toolkit` の「 #」から後ろが YAML のコメントとして消える。
// 2. それ以外の自由記述のキーは、引用符なしの値に「 #」があるとエラーにする（後ろがコメントとして消えるため。値全体を "..." で囲む）。
//    「key: 値」の行で、値が引用符・ブロック・フロー形式で始まらず、空白の後ろに # があるものが対象。
// 次のキーは、わざと書いた行末コメントを許すため対象外（値が文章ではなく、# が入り得ない）:
//   id, order, year, category, grade, image, photo, href, url, icon, nav, cohort
// citation は 1. の検査に任せる。ブロック形式の中の行は、どの検査の対象にもならない。
// それ以外のキー（citation・title_*・label_*・name_*・description_* など）は、新しく足したキーも含めて検査する。
// 行末コメントを書くときは、該当の行の上に単独の行として書く。
// `npm test` で実行される。使い方: node scripts/check-yaml-hash.mjs [ファイル ...]（引数なしなら全件）

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const COMMENT_OK_KEYS = new Set(['id', 'order', 'year', 'category', 'grade', 'image', 'photo', 'href', 'url', 'icon', 'nav', 'cohort']);

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.md') || e.name.endsWith('.yaml')) out.push(p);
  }
  return out;
}

// [開始行, 終了行]（0始まり、終了を含む）。YAML は全体、Markdown は先頭の front matter だけ。
function yamlRange(file, lines) {
  if (file.endsWith('.yaml')) return [0, lines.length - 1];
  if (lines[0] !== '---') return null;
  const end = lines.indexOf('---', 1);
  return end === -1 ? null : [1, end - 1];
}

function check(file) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  const range = yamlRange(file, lines);
  if (!range) return [];
  const problems = [];
  let block = -1; // ブロックスカラー（| >）の中は文章なので対象外。その親の字下げ幅
  for (let i = range[0]; i <= range[1]; i++) {
    const line = lines[i];
    const indent = line.match(/^ */)[0].length;
    if (block >= 0) {
      if (line.trim() === '' || indent > block) continue;
      block = -1;
    }
    if (/^\s*(?:- )?citation:\s*(?:#.*)?$/.test(line)) {
      problems.push({ file, n: i + 1, citation: true, shown: '値がありません' });
      continue;
    }
    const m = line.match(/^(\s*(?:- )?)([A-Za-z_][\w-]*):[ \t]+(\S.*)$/);
    if (!m) continue;
    const [, prefix, key, value] = m;
    if (key === 'citation') {
      if (!/^>-\s*(?:#.*)?$/.test(value)) problems.push({ file, n: i + 1, citation: true, shown: value });
      if (/^[|>]/.test(value)) block = prefix.length - (prefix.endsWith('- ') ? 2 : 0);
      continue;
    }
    if (/^[|>]/.test(value)) {
      block = prefix.length - (prefix.endsWith('- ') ? 2 : 0);
      continue;
    }
    if (/^["'\[{&*!#]/.test(value) || COMMENT_OK_KEYS.has(key)) continue;
    const hash = value.search(/[ \t]#/);
    if (hash === -1) continue;
    const kept = value.slice(0, hash).trim();
    problems.push({ file, n: i + 1, key, kept, lost: value.slice(hash).trim() });
  }
  return problems;
}

const args = process.argv.slice(2).filter((a) => a.endsWith('.md') || a.endsWith('.yaml'));
const files = args.length ? args : process.argv.length > 2 ? [] : [...walk('src/data'), ...walk('src/content')];

let found = 0;
let foundCitation = 0;
for (const file of files) {
  for (const p of check(file)) {
    if (p.citation) {
      console.error(`${p.file}:${p.n}  citation: ${p.shown.slice(0, 40)}${p.shown.length > 40 ? '…' : ''}  （citation がブロック形式ではありません）`);
      foundCitation++;
      found++;
      continue;
    }
    console.error(`${p.file}:${p.n}  ${p.key}: 「${p.kept}」のあとの「${p.lost}」がコメントとして切り捨てられます`);
    found++;
  }
}

if (foundCitation) {
  console.error('\ncitation は `citation: >-` と書き、次の行に字下げ（スペース4つ）して本文を貼ってください。# : " \\ はそのまま書けます。');
  console.error('  citation: >-');
  console.error('    Taro Keio, Hiroaki Nishi, “Rust #2 and C# Toolkit…”, IEEE Access, 2026.');
}
if (found > foundCitation) {
  console.error('\n引用符なしの値に「 #」があると、そこから後ろが YAML のコメントになり、公開されません。値全体を "..." で囲んでください。');
  console.error('  例: title_ja: "第2回 #2 の報告"');
  console.error('行末にコメントを書きたいときは、その行の上に単独の行として書いてください。');
}
if (found) process.exit(1);
