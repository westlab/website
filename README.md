# 西研究室サイト

Astro製の静的サイト。

## 開発（Docker）

起動

```sh
docker compose up
```

停止

```sh
docker compose down
```

`http://localhost:4321` で確認できる（ファイル保存で自動リロード）。サイト内検索は `npm run build` 後の `npm run preview` でのみ動く（開発サーバーでは使えない）。

`npm run build` などを単発で実行したい場合:

```sh
docker compose run --rm astro npm run build
```

## デザイン

[Figma](https://www.figma.com/design/Lu56izrHxvrpBLblm9kSPo) をベースとしている。

## ディレクトリ

- `src/content/research/{ja,en}/` … 研究トピック（1項目1ファイル、言語ごとにペア）
- `src/content/pages/{ja,en}/` … 単発ページの本文（Homepageメッセージ、入室・見学など）
- `src/data/*.yaml` … メンバー・OBOG・業績・動画・ページ画像対応表などの構造化データ
- `src/components/` `src/layouts/` … Figmaのフレーム構成に対応するデザイン層
- `src/i18n/ui.ts` … ナビ等のUI文言（ページ内容ではないもの）

詳しい分類の考え方は `docs/data-design-separation.md` を参照。

## 翻訳の同期チェック

`src/content/research/{ja,en}/` `src/content/pages/{ja,en}/` は ja/en が別ファイルなので、片方だけ更新（追加・削除含む）して他方の追従を忘れることがある。push するコミット範囲で ja/en 両方が変更されているかを見る（どちらを先にコミットしたかは問わない）。ファイルの存在チェック（追加・削除の追従漏れ）は push 範囲によらず常に行う。

```sh
npm run check:i18n
```

`npm install` 時に `git config core.hooksPath .githooks` が自動設定され、`git push` のたびにも警告表示される（push 自体はブロックしない）。

## Markdown / YAML の整形

`src/` 以下の Markdown と YAML は Prettier で体裁を統一する。ルールはデフォルトのまま（設定ファイルなし）。

```sh
npm run lint      # 未整形・構文エラーがあれば失敗
npm run lint:fix  # 整形する
npm test           # ナビカード・ヒーロー画像の共通化チェックと画像容量チェック（pre-commit と CI でも実行）
npm run check     # 型チェック（astro check。約5秒。.astro / .ts を変えたコミットでは pre-commit でも実行）
```

`npm run lint` は Markdown 本文に h1 が無いかも検査する（`scripts/check-headings.mjs`）。本文の見出しは `##` から書く（`#` は使わない。h1 は各ページのタイトルが担当）。

`npm run lint` と pre-commit は引用符の向きも検査し、間違いがあれば警告を表示する（`scripts/check-quotes.mjs`。警告のみで失敗はしない）。“ と ” は行内で交互に現れ、開きは `“`、閉じは `”` を使う（例: `Nishi, “Title”`）。

`git commit` 時に pre-commit フックが staged な `src/**/*.{md,yaml}` をチェックし、未整形ならコミットを中止する。CI（`.github/workflows/build.yml`）でも `lint` と `npm test` を実行する。

YAML を対象に含める理由は体裁統一だけではない。`src/data/*.yaml` のスキーマ違反（必須フィールドの欠落など）は `src/content.config.ts` の zod 定義によりビルドが落ちるが、**YAML の構文エラーはビルドが落ちず終了コード0のまま該当コレクションが空になる**。Prettier はパースできないYAMLで失敗するので、この穴を塞ぐ役割も担っている。
