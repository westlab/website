#!/usr/bin/env node
// Markdown / YAML に、画面では見えない文字が混ざっていないかを検査する。
// Web ページや PDF からコピーしたときに紛れ込みやすく、見た目は同じでも検索で見つからなくなったり、
// 単語がつながって表示されたりする（例: 「Noise-based」の - がソフトハイフン（U+00AD）だと「Noisebased」と表示される）。
//
// 対象の文字: ゼロ幅スペースなどの幅のない文字、文字の向きの制御文字、BOM、ノーブレークスペース、ソフトハイフン。
// 全角スペース（U+3000）は日本語の文章でふつうに使うので対象外。文末の空白は Prettier（npm run lint）が検査する。
//
// 見つかったら終了コード1（lint / pre-commit / CI が失敗する）。
// --fix を付けると取り除く（ノーブレークスペースは普通の空白に、それ以外は削除）。npm run lint:fix でも実行される。
// 使い方: node scripts/check-invisible-chars.mjs [--fix] [ファイル ...]（ファイル指定なしなら src/**/*.md と src/**/*.yaml を全件）

import { readFileSync, writeFileSync } from 'node:fs';
import { targetFiles } from './lib.mjs';

const NAMES = {
  '\u00A0': 'ノーブレークスペース',
  '\u00AD': 'ソフトハイフン',
  '\u200B': 'ゼロ幅スペース',
  '\u200C': 'ゼロ幅非接合子',
  '\u200D': 'ゼロ幅接合子',
  '\u200E': '左から右への向きの記号',
  '\u200F': '右から左への向きの記号',
  '\u202A': '向きの制御文字',
  '\u202B': '向きの制御文字',
  '\u202C': '向きの制御文字',
  '\u202D': '向きの制御文字',
  '\u202E': '向きの制御文字',
  '\u2060': '単語結合子',
  '\u2061': '不可視の演算子',
  '\u2062': '不可視の演算子',
  '\u2063': '不可視の演算子',
  '\u2064': '不可視の演算子',
  '\uFEFF': 'BOM / ゼロ幅ノーブレークスペース',
};
const PATTERN = new RegExp(`[${Object.keys(NAMES).join('')}]`, 'g');
const code = (ch) => `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`;

const fix = process.argv.includes('--fix');
let found = 0;

for (const file of targetFiles(/\.(md|yaml)$/, ['src'])) {
  const text = readFileSync(file, 'utf8');
  if (!text.match(PATTERN)) continue;

  if (fix) {
    writeFileSync(file, text.replace(PATTERN, (ch) => (ch === '\u00A0' ? ' ' : '')));
    console.log(`見えない文字を取り除きました: ${file}`);
    continue;
  }

  text.split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(PATTERN)) {
      // 前後に別の見えない文字があれば、コードで表示する
      const show = (s) => s.replace(PATTERN, (ch) => `⟦${code(ch)}⟧`);
      const before = show(line.slice(Math.max(0, m.index - 15), m.index));
      const after = show(line.slice(m.index + 1, m.index + 16));
      console.error(`${file}:${i + 1}:${m.index + 1}  ${code(m[0])} ${NAMES[m[0]]}  「${before}⟦ここ⟧${after}」`);
      found++;
    }
  });
}

if (found) {
  console.error('\n画面では見えない文字が混ざっています（コピー＆ペーストで紛れ込みやすい）。');
  console.error('`npm run lint:fix` で取り除けます。ハイフンや空白のつもりだった場所は、取り除いたあとに打ち直してください。');
  process.exit(1);
}
