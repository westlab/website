# データと設計（デザイン）の分離

サイトの内容（データ）と見た目（デザイン）をどう分けて持つかを定める。採用理由は `stack-decision.md` を参照。

## 前提

- サイトは学生が管理し、更新頻度は年数回程度（`stack-decision.md`）
- デザインは Figma（`Lu56izrHxvrpBLblm9kSPo`）にほぼ準拠し、変更は滅多に発生しない
- Figma 上のページ種別：Homepage, Members, Alumni, Publications, Research, Admission, Links, Search Results, Videos（各 Mobile 版あり）。Search Results は Pagefind が自動生成するため原稿データは不要
- 全ページ日本語／英語の対訳とし、翻訳漏れは push 時に警告する（`stack-decision.md`）

## コンテンツの3分類と持ち方

コンテンツは性質で3種類に分け、持ち方を変える。

### 1. 構造化データ（表形式・短い項目の繰り返し）

対象：Members（メンバー）、Alumni（OB/OG）、Publications（業績）、Videos

- `src/data/*.yaml` に1コレクション1ファイル、レコードの配列として保持する（例：`src/data/members.yaml`）
- 翻訳が必要な短いフィールドは同一レコード内に `_ja` / `_en` を持つ（例：`name_ja` / `name_en`）。年度・リンク・画像パスなど言語に依存しない項目は1つだけ持つ
- YAML を選ぶ理由は、コメントが書け、引用符やカンマの制約が JSON より緩く、学生でも手で編集しやすいため

```yaml
# src/data/members.yaml
- id: tanaka-ichiro
  name_ja: 田中 一郎
  name_en: Ichiro Tanaka
  grade: 博士課程
  photo: /images/members/tanaka-ichiro.jpg
```

### 2. 繰り返しの本文コンテンツ（項目ごとに段落を持つ）

対象：Research の研究トピック7項目。各トピックはタイトルと長めの説明文を持つ。

- Astro Content Collections で、1項目1ファイル、言語ごとにペアで持つ：`src/content/research/ja/network.md` と `src/content/research/en/network.md`
- front matter：`title`, `order`, `icon`（アイコン種別のキーのみ）, `summary`（必須。カード用の要約）, `description`（任意。meta description。未指定なら summary）, `hero`（任意。詳細ページ上部の画像パス）
- 本文（Markdown）が説明文
- ペアのファイル名を揃えているので、`stack-decision.md` の「対訳の欠落の警告」と「git コミット履歴を比較した英語版の古さの警告」を項目単位で適用できる

### 3. 単発ページの本文

対象：Homepage のメッセージ文、Admission（入室・見学）、Links、Research ページの導入文など、ページに1つだけ存在する長文

- Content Collections で `src/content/pages/ja/applicants.md` / `src/content/pages/en/applicants.md` のように持つ
- front matter は `title` のみ。本文がページ本体の Markdown

## デザイン側との対応

- `src/components/` / `src/layouts/` は Figma のフレーム構成（Hero, Message Section, Nav Card, Page Title 等）に1:1で対応させる。デザインはほぼ変更しないため、サイトの中で最も安定した層になる
- コンポーネントは上記のデータ／コンテンツを props として受け取るだけの表示専業とし、原稿を埋め込まない
- ナビラベルやボタン文言などページ内容ではない UI 文言は、データ層に混ぜず `src/i18n/ui.ts` のような辞書で別管理する
- meta description もデータ層に置く：`pages.yaml`（`meta_description_*` があれば優先）、`site.yaml`（トップと、Alumni・Videos など `pages.yaml` に載せないページ）、研究トピックの front matter
- Research トピックのアイコン（SVG）は、front matter の `icon` キーをコンポーネント側で解決する。データファイルに SVG やスタイルを持ち込まない

## 画像の持ち方

Figma で確認した制約：Homepage の Nav Card 5枚（研究内容・メンバー・業績・入室見学・リンク、720×480、モバイル335×180）と、遷移先の各ページの Page Title（ヘッダーバナー、1440×470）は同じ写真を使う。写真は本文に付随するデータではなく、ページ1つにつき1枚の素材であり、Nav Card と Hero の2箇所から参照される。

- 画像本体は `public/images/pages/<page-key>.jpg` に1ページ1ファイルで保持する（例：`research.jpg`, `members.jpg`, `publications.jpg`, `applicants.jpg`, `links.jpg`）
- どのページがどの画像を使うかは、構造化データとして `src/data/pages.yaml` の1箇所だけに持つ

```yaml
# src/data/pages.yaml
- id: research
  order: 1
  title_ja: 研究内容
  title_en: Research
  image: /images/pages/research.jpg
  href: /research/
  description_ja: …
  description_en: …
```

- Nav Card と Page Title（Hero）の両コンポーネントが、この同じレコードを参照する。写真を差し替えるときは `pages.yaml` を1回直せば両方に反映される
- 各ページの `PageHero` は必ず `image={page.data.image}` を渡す。Hero 用の別画像やパスの直書きは不可。`scripts/check-page-heroes.mjs`（`npm test`）が commit 時と CI で検査する
- 縦横比の違いは、画像を複数バージョン持たず、各コンポーネントの CSS（`object-fit: cover` とブレークポイントごとのコンテナサイズ）で吸収する。画像の置き場所（`public/` か `src/assets/`）はクロップと無関係
- ビルド時の画像最適化（`astro:assets`）は導入しない。モバイル向けの転送量を自動で最適化できるが、写真が少なく更新頻度も低いため、仕組みの単純さを優先した

上記5ページ以外（Publications / Videos / Alumni など）にも Page Title があり、`pages.yaml` にエントリを持つ。ただし対応する Nav Card がないため、画像を参照するのは Hero だけになる。

メンバーの顔写真は、各メンバーレコードの `photo` フィールドに持つ（1人1枚、使い回しなし）。動画サムネイルは YouTube 等から取得するため管理対象外。ロゴ・アイコンはデザイン側の資産として扱い、データ層には含めない。
