// scripts/ の検査・変換スクリプトで共通に使う、ファイルの探し方と読み方。

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// path がファイルならそれ自身、ディレクトリなら配下の全ファイルを返す（名前順）。
// match（正規表現）を渡すと、それに合うファイルだけ。.gitkeep などの . で始まるものは、ディレクトリの中では拾わない。
export function walk(path, match) {
  if (statSync(path).isFile()) return !match || match.test(path) ? [path] : [];
  return readdirSync(path, { withFileTypes: true })
    .filter((e) => !e.name.startsWith('.'))
    .flatMap((e) => walk(join(path, e.name), match));
}

// 検査対象のファイル。コマンドライン引数があれば、その中で match に合うもの（コミット前フックが変更ファイルを渡す。
// 合うものが無ければ空）。引数が無ければ dirs 配下の全ファイル。
export function targetFiles(match, dirs) {
  const args = process.argv.slice(2);
  if (args.length) return args.filter((a) => match.test(a));
  return dirs.flatMap((dir) => walk(dir, match));
}

// ファイルを行の配列で読む（改行は LF / CRLF どちらでもよい）
export function readLines(file) {
  return readFileSync(file, 'utf8').split(/\r?\n/);
}
