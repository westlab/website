import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

// research / pagesContent は id が "ja/network" のように言語プレフィックス付き。
// 言語ごとの一覧取得・対訳ペアの突き合わせをここに集約する。

type LocalizedCollection = 'research' | 'pagesContent';

export async function getLocalizedList<C extends LocalizedCollection>(collection: C, lang: Lang) {
  const entries: CollectionEntry<C>[] = await getCollection(collection);
  return entries
    .filter((entry) => entry.id.startsWith(`${lang}/`))
    .map((entry) => ({ ...entry, slug: entry.id.slice(lang.length + 1) }));
}

export async function getLocalizedDoc<C extends LocalizedCollection>(
  collection: C,
  lang: Lang,
  slug: string,
): Promise<CollectionEntry<C> | undefined> {
  const entries: CollectionEntry<C>[] = await getCollection(collection);
  return entries.find((entry) => entry.id === `${lang}/${slug}`);
}
