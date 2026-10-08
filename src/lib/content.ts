import { getCollection } from 'astro:content';
import type { Lang } from '../i18n/ui';

// research / pagesContent は id が "ja/network" のように言語プレフィックス付き。
// 言語ごとの一覧取得・対訳ペアの突き合わせをここに集約する。

export async function getLocalizedList(collection: 'research' | 'pagesContent', lang: Lang) {
  const entries = await getCollection(collection);
  return entries
    .filter((entry) => entry.id.startsWith(`${lang}/`))
    .map((entry) => ({ ...entry, slug: entry.id.slice(lang.length + 1) }));
}

export async function getLocalizedDoc(collection: 'research' | 'pagesContent', lang: Lang, slug: string) {
  const entries = await getCollection(collection);
  return entries.find((entry) => entry.id === `${lang}/${slug}`);
}
