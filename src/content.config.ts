import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";

// 分類2: 繰り返しの本文コンテンツ（研究トピック）。
// 1項目1ファイルを ja/ と en/ に分けて置く。id は "ja/network" のような
// 相対パスになるので、ページ側で言語プレフィックスを外して対訳ペアを突き合わせる。
const research = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/research" }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    // アイコンの種類を表すキーのみ。実際のSVGはコンポーネント側（src/components/icons/）で解決する。
    icon: z.string(),
    // 研究説明ページのカードに出す1〜2文の要約（本文とは別）
    summary: z.string(),
    // 詳細ページ上部（PageHero）の画像パス。未指定ならプレースホルダー画像
    hero: z.string().optional(),
  }),
});

// 分類3: 単発ページの本文（Homepageのメッセージ、入室・見学、Researchページの導入文など）。
const pagesContent = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    // Homepage のメッセージ用（署名と写真）
    author: z.string().optional(),
    photo: z.string().optional(),
  }),
});

// 分類1: 構造化データ（表形式・短い項目の繰り返し）。1コレクション1 YAMLファイル。
// 翻訳が必要な短いフィールドは _ja/_en を同一レコード内に持つ（stack-decision.md の方針）。

// Homepage の Nav Card と各ページの Page Title（Hero）が共有する画像・タイトルの対応表。
const pages = defineCollection({
  loader: file("./src/data/pages.yaml"),
  schema: z.object({
    id: z.string(),
    order: z.number(),
    title_ja: z.string(),
    title_en: z.string(),
    image: z.string(),
    href: z.string(),
    // Homepage の Nav Section に出す1行説明
    description_ja: z.string(),
    description_en: z.string(),
  }),
});

// フッターの所在地・連絡先（1レコードのみ）。
const site = defineCollection({
  loader: file("./src/data/site.yaml"),
  schema: z.object({
    id: z.string(),
    name_ja: z.string(),
    name_en: z.string(),
    columns: z.array(
      z.array(
        z.object({
          label_ja: z.string(),
          label_en: z.string(),
          lines_ja: z.array(z.string()).optional(),
          lines_en: z.array(z.string()).optional(),
          links: z
            .array(
              z.object({
                label_ja: z.string(),
                label_en: z.string(),
                url: z.string(),
              }),
            )
            .optional(),
        }),
      ),
    ),
    copyright: z.string(),
  }),
});

const members = defineCollection({
  loader: file("./src/data/members.yaml"),
  schema: z.object({
    id: z.string(),
    grade: z.string(),
    names: z.array(
      z.object({
        name_ja: z.string(),
        name_en: z.string(),
        // 学年。同じ値が続く範囲を1行にまとめて表示する
        year: z.string().optional(),
      }),
    ),
  }),
});

const alumni = defineCollection({
  loader: file("./src/data/alumni.yaml"),
  schema: z.object({
    id: z.string(),
    cohort: z.number(),
    names: z.array(
      z.object({
        name_ja: z.string(),
        name_en: z.string(),
      }),
    ),
  }),
});

const publications = defineCollection({
  loader: file("./src/data/publications.yaml"),
  schema: z.object({
    id: z.string(),
    year: z.number(),
    // Figmaの分類（論文誌／国際会議・査読付収録論文／国内研究会・収録論文・口頭発表等／
    // 講演等／報道・展示等／学術解説等／著書／特許出願／受賞等）に合わせる。
    category: z.string(),
    // 著者・タイトル・掲載誌などは論文ごとに書式が異なるため分割せず、
    // 出典サイトの表記をそのまま1本の文字列で保持する（Figmaの Entry コンポーネントも citation 単一テキスト）。
    citation: z.string(),
  }),
});

// Linksページ用。カテゴリごとにリンクの配列を持つ。
const links = defineCollection({
  loader: file("./src/data/links.yaml"),
  schema: z.object({
    id: z.string(),
    category_ja: z.string(),
    category_en: z.string(),
    order: z.number(),
    items: z.array(
      z.object({
        label: z.string(),
        // url が無い項目はリンクなしのテキストとして表示する
        url: z.string().optional(),
      }),
    ),
  }),
});

const videos = defineCollection({
  loader: file("./src/data/videos.yaml"),
  schema: z.object({
    id: z.string(),
    // 表示順（file loader は id 順で返すため明示する）
    order: z.number(),
    title_ja: z.string(),
    title_en: z.string(),
    // サムネイル下の1行説明
    description_ja: z.string(),
    description_en: z.string(),
    url: z.string(),
  }),
});

// 研究説明ページ「過去の研究」の開閉リスト。
const pastResearch = defineCollection({
  loader: file("./src/data/past-research.yaml"),
  schema: z.object({
    id: z.string(),
    order: z.number(),
    title_ja: z.string(),
    body_ja: z.string(),
  }),
});

export const collections = {
  research,
  pagesContent,
  pages,
  site,
  members,
  alumni,
  publications,
  videos,
  links,
  pastResearch,
};
