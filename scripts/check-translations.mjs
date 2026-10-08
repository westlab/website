#!/usr/bin/env node
// ja/en の対訳ペアが追従しているかを2種類の観点で警告する（警告のみ、pushはブロックしない）。
//
// 1. 構造チェック（常に実行）: ja/en どちらかにしかファイルが無いケースを検出する。
//    ディスク上の現在の状態を見るだけなので、追加・削除どちらの向きでも検出できる。
// 2. push差分チェック: 今回pushするコミット範囲で、ja/enの片方だけ変更されていないかを見る。
//    どちらを先にコミットしたかは問わない（対象範囲内で両方変更されていればOK）。
//    pre-push フックから "<remote_sha> <local_sha>" を引数で受け取って実行する。
//    引数なしで手動実行した場合は upstream ブランチとの差分で代用する。

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';

const PAIRS = [
  { label: 'research', ja: 'src/content/research/ja', en: 'src/content/research/en' },
  { label: 'pages', ja: 'src/content/pages/ja', en: 'src/content/pages/en' },
];

const PLACEHOLDER_MARKER = 'Translation pending';
const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
const NULL_SHA = '0000000000000000000000000000000000000000';

function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

function mdFiles(dir) {
  try {
    return readdirSync(dir).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
}

// --- 1. 構造チェック：ja/en どちらかにしかファイルが無い（追加・削除の追従漏れ） ---
const missingWarnings = [];
const placeholderWarnings = [];

for (const { label, ja, en } of PAIRS) {
  const jaSet = new Set(mdFiles(ja));
  const enSet = new Set(mdFiles(en));

  for (const file of jaSet) {
    if (!enSet.has(file)) {
      missingWarnings.push(`${label}/${basename(file, '.md')}: en 側のファイルが存在しない`);
      continue;
    }
    const enBody = readFileSync(join(en, file), 'utf8');
    if (enBody.includes(PLACEHOLDER_MARKER)) {
      placeholderWarnings.push(`${label}/${basename(file, '.md')}: en が未翻訳のプレースホルダーのまま`);
    }
  }
  for (const file of enSet) {
    if (!jaSet.has(file)) {
      missingWarnings.push(`${label}/${basename(file, '.md')}: ja 側のファイルが存在しない（en だけ残っている）`);
    }
  }
}

// --- 2. push差分チェック：対象範囲でja/enの片方だけ変更されていないか ---
let [base, head] = process.argv.slice(2);

if (!base || !head) {
  // 手動実行時は upstream ブランチとの差分で代用する（無ければ何もしない）
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  if (upstream) {
    base = git(['merge-base', 'HEAD', upstream]);
    head = git(['rev-parse', 'HEAD']);
  }
}

const driftWarnings = [];

if (base && head) {
  const diffBase = base === NULL_SHA ? EMPTY_TREE : base;
  const changed = new Set(git(['diff', '--name-only', diffBase, head]).split('\n').filter(Boolean));

  for (const { label, ja, en } of PAIRS) {
    const touched = new Map(); // basename -> { jaChanged, enChanged }
    for (const path of changed) {
      let dir = null;
      let side = null;
      if (path.startsWith(`${ja}/`)) [dir, side] = [ja, 'jaChanged'];
      else if (path.startsWith(`${en}/`)) [dir, side] = [en, 'enChanged'];
      if (!dir) continue;
      const file = path.slice(dir.length + 1);
      touched.set(file, { ...touched.get(file), [side]: true });
    }

    for (const [file, { jaChanged, enChanged }] of touched) {
      if (jaChanged && !enChanged) {
        driftWarnings.push(`${label}/${basename(file, '.md')}: 今回の push で ja だけ変更されている（en が追従していない可能性）`);
      } else if (enChanged && !jaChanged) {
        driftWarnings.push(`${label}/${basename(file, '.md')}: 今回の push で en だけ変更されている（ja との整合を確認）`);
      }
    }
  }
}

const all = [...missingWarnings, ...driftWarnings, ...placeholderWarnings];

if (all.length === 0) {
  console.log('[check:i18n] ja/en の翻訳ペアは同期済みです。');
} else {
  console.log('[check:i18n] 翻訳が追従していない可能性がある項目:\n');
  for (const w of all) console.log(`  - ${w}`);
  console.log('\n(警告のみです。push はブロックされません)');
}
