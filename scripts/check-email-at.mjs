#!/usr/bin/env node
// src/content と src/data に @west.sd.keio.ac.jp が書かれていないかを警告する。
// @ で書くと mailto リンクとして公開されるため、連絡先は (AT) 表記にする。
// 警告のみ: 問題を表示するが終了コードは常に 0（check-quotes.mjs と同じ）。
// 使い方: node scripts/check-email-at.mjs

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PATTERN = /@west\.sd\.keio\.ac\.jp/;

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.md') || e.name.endsWith('.yaml')) out.push(p);
  }
  return out;
}

let found = 0;
for (const file of [...walk('src/content'), ...walk('src/data')]) {
  readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((line, i) => {
      if (!PATTERN.test(line)) return;
      console.warn(`警告 ${file}:${i + 1}  ${line.trim()}  （メールアドレスは (AT) 表記にする）`);
      found++;
    });
}

if (found) {
  console.warn('\n警告: recruit2027 (AT) west.sd.keio.ac.jp のように (AT) 表記にしてください（npm test は失敗しません）。');
}
