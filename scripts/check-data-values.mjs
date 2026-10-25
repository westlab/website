#!/usr/bin/env node
// members.yaml と publications.yaml に、決まった一覧にない値が入っていないかを警告する（警告のみ、終了コードは常に0）。
//
// - members.yaml の year（学年）が B3・B4・M1・M2・D1・D2・D3 以外
// - members.yaml の grade（区分）が一覧にない → メンバーページに表示されない
// - publications.yaml の category（分類）が一覧にない → 業績ページに表示されない
// - publications.yaml の year（年度）が最初のブロックの開始年より前 → 業績ページに表示されない
// - publications.yaml の year が数字でない、または今年度+1 を超える（桁の書き間違い）
//
// 一覧は src/data/allowed-values.json（ページと共通）。使い方: node scripts/check-data-values.mjs [プロジェクトルート]

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? '.';
const allowed = JSON.parse(readFileSync(join(root, 'src/data/allowed-values.json'), 'utf8'));
const minYear = allowed.publicationBlockStarts[0];
// 年度は4月始まり。翌年度の業績を先に載せることがあるので、上限は今年度+1
const now = new Date();
const maxYear = (now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1) + 1;
const knownGrades = [...allowed.memberGrades, ...allowed.memberGradesHidden];

// 単純なリスト形式の YAML なので、行ごとに値を拾う（check-page-heroes.mjs と同じ方針）
function value(line, key) {
  const m = line.match(new RegExp(`^\\s+(?:- )?${key}:\\s*(.*?)\\s*$`));
  if (!m) return null;
  return m[1].replace(/\s+#.*$/, '').replace(/^(["'])(.*)\1$/, '$2');
}
const lines = (file) => readFileSync(join(root, file), 'utf8').split(/\r?\n/);
const list = (a) => a.join('・');

const warnings = [];

// --- members.yaml ---
const MEMBERS = 'src/data/members.yaml';
let recordId = '';
let name = '';
for (const line of lines(MEMBERS)) {
  const id = line.match(/^- id:\s*(\S+)/);
  if (id) recordId = id[1];
  const nameJa = value(line, 'name_ja');
  if (nameJa !== null) name = nameJa;
  const grade = value(line, 'grade');
  if (grade !== null && !knownGrades.includes(grade)) {
    warnings.push(
      `members.yaml「${recordId}」: grade「${grade}」は一覧にない区分です。この区分はメンバーページに表示されません（${list(allowed.memberGrades)}のいずれかにしてください）`,
    );
  }
  const year = value(line, 'year');
  if (year !== null && !allowed.memberYears.includes(year)) {
    warnings.push(`members.yaml「${recordId}」の${name}: year「${year}」は一覧にない学年です（${list(allowed.memberYears)}のいずれか）`);
  }
}

// --- publications.yaml ---
const PUBS = 'src/data/publications.yaml';
recordId = '';
for (const line of lines(PUBS)) {
  const id = line.match(/^- id:\s*"?([^"\s]+)/);
  if (id) recordId = id[1];
  const category = value(line, 'category');
  if (category !== null && !allowed.publicationCategories.includes(category)) {
    warnings.push(`publications.yaml「${recordId}」: category「${category}」は一覧にない分類です。この分類の業績は業績ページに表示されません`);
  }
  const year = value(line, 'year');
  if (year !== null) {
    if (!/^\d+$/.test(year)) {
      warnings.push(`publications.yaml「${recordId}」: year「${year}」は数字ではありません。year は 2026 のように半角数字だけで書いてください（「年度」は付けない）`);
    } else if (Number(year) < minYear) {
      warnings.push(`publications.yaml「${recordId}」: year「${year}」は${minYear}年度より前です。この年度の業績は業績ページに表示されません`);
    } else if (Number(year) > maxYear) {
      warnings.push(`publications.yaml「${recordId}」: year「${year}」は${maxYear}年度より後です。桁の書き間違いではありませんか`);
    }
  }
}

if (warnings.length === 0) {
  console.log('[check:data] members.yaml と publications.yaml の値は一覧の範囲内です。');
} else {
  console.log('[check:data] 一覧にない値が見つかりました:\n');
  for (const w of warnings) console.log(`  - ${w}`);
  console.log('\n(警告のみです。コミットや push はブロックされません。一覧は src/data/allowed-values.json)');
}
