import { getCollection, render, type CollectionEntry, type CollectionKey } from 'astro:content';
import type { Lang } from '../i18n/ui';

// research / pagesContent は id が "ja/network" のように言語プレフィックス付き。
// 言語ごとの一覧取得・対訳ペアの突き合わせをここに集約する。

type LocalizedCollection = 'research' | 'pagesContent';

export async function getLocalizedList<C extends LocalizedCollection>(collection: C, lang: Lang) {
  const entries: CollectionEntry<C>[] = await getCollection(collection);
  return entries
    .filter((entry) => entry.id.startsWith(`${lang}/`))
    .map((entry) => ({ ...entry, slug: entry.id.slice(lang.length + 1) }))
    .sort(byRank);
}

export async function getLocalizedDoc<C extends LocalizedCollection>(
  collection: C,
  lang: Lang,
  slug: string,
): Promise<CollectionEntry<C> | undefined> {
  const entries: CollectionEntry<C>[] = await getCollection(collection);
  return entries.find((entry) => entry.id === `${lang}/${slug}`);
}

// 単発ページの本文（pagesContent）を描画用に取り出す。ファイルが無ければ Content は null
export async function renderLocalizedDoc(lang: Lang, slug: string) {
  const doc = await getLocalizedDoc('pagesContent', lang, slug);
  const { Content } = doc ? await render(doc) : { Content: null };
  return { doc, Content };
}

// 一覧の並び順。YAML のコレクションはファイルに書いた位置（seq。src/content.config.ts で付ける）、
// 研究トピックの md は front matter の order の昇順。どちらも持たないもの（pagesContent）は並べ替えない。
// 並べ方を変えるときはここだけを直す。
function rank(data: object) {
  if ('seq' in data && typeof data.seq === 'number') return data.seq;
  if ('order' in data && typeof data.order === 'number') return data.order;
  return 0;
}

export function byRank(a: { data: object }, b: { data: object }) {
  return rank(a.data) - rank(b.data);
}

// YAML のコレクション（links / videos / pastResearch / publications など）を、ファイルに書いた順で返す
type YamlCollection = {
  [C in CollectionKey]: CollectionEntry<C>['data'] extends { seq: number } ? C : never;
}[CollectionKey];

export async function getSortedCollection<C extends YamlCollection>(collection: C): Promise<CollectionEntry<C>[]> {
  const entries: CollectionEntry<C>[] = await getCollection(collection);
  return entries.sort(byRank);
}
