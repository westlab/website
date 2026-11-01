import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import type { Lang } from '../i18n/ui';

// research / pagesContent は id が "ja/network" のように言語プレフィックス付き。
// 言語ごとの一覧取得・対訳ペアの突き合わせをここに集約する。

type LocalizedCollection = 'research' | 'pagesContent';

export async function getLocalizedList<C extends LocalizedCollection>(collection: C, lang: Lang) {
  const entries: CollectionEntry<C>[] = await getCollection(collection);
  return entries
    .filter((entry) => entry.id.startsWith(`${lang}/`))
    .map((entry) => ({ ...entry, slug: entry.id.slice(lang.length + 1) }))
    .sort((a, b) => orderOf(a.data) - orderOf(b.data));
}

export async function getLocalizedDoc<C extends LocalizedCollection>(
  collection: C,
  lang: Lang,
  slug: string,
): Promise<CollectionEntry<C> | undefined> {
  const entries: CollectionEntry<C>[] = await getCollection(collection);
  return entries.find((entry) => entry.id === `${lang}/${slug}`);
}

// 一覧の並び順は order の昇順。並べ方を変えるときはここだけを直す。
export function byOrder(a: { data: { order: number } }, b: { data: { order: number } }) {
  return a.data.order - b.data.order;
}

// order を持たないコレクション（pagesContent）は並べ替えない
function orderOf(data: object) {
  return 'order' in data && typeof data.order === 'number' ? data.order : 0;
}

// order を持つ YAML コレクション（links / videos / pastResearch など）を order 順で返す
type OrderedCollection = {
  [C in CollectionKey]: CollectionEntry<C>['data'] extends { order: number } ? C : never;
}[CollectionKey];

export async function getSortedCollection<C extends OrderedCollection>(collection: C): Promise<CollectionEntry<C>[]> {
  const entries: CollectionEntry<C>[] = await getCollection(collection);
  return entries.sort((a, b) => orderOf(a.data) - orderOf(b.data));
}
