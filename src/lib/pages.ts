import { getCollection } from 'astro:content';
import { byOrder } from './content';
import { localize } from './localize';
import type { Lang } from '../i18n/ui';

// pages.yaml の読み出し。Nav Card を持つページ（nav が true）と、画像だけのページ（nav: false）を区別する。

async function findPage(id: string) {
  const page = (await getCollection('pages')).find((p) => p.id === id);
  if (!page) throw new Error(`pages.yaml にページ「${id}」がありません。`);
  return page;
}

export async function getNavPages() {
  const pages = await getCollection('pages');
  return pages.flatMap((page) => (page.data.nav ? [{ ...page, data: page.data }] : [])).sort(byOrder);
}

export async function getNavPage(id: string) {
  const page = (await getNavPages()).find((p) => p.id === id);
  if (!page) throw new Error(`pages.yaml に Nav Card を持つページ「${id}」がありません。`);
  return page;
}

// Page Title（PageHero）の画像。Nav Card の有無に関わらず、全ページ pages.yaml から引く
export async function getPageImage(id: string) {
  return (await findPage(id)).data.image;
}

// Nav Card を持つページの SubPageLayout 用の title / description / image。
// description は meta_description（検索結果・SNS共有用）があればそれを、なければ Nav Card の1行説明を使う
export function navPageProps(page: Awaited<ReturnType<typeof getNavPage>>, lang: Lang) {
  return {
    title: localize(page.data, 'title', lang),
    description: localize(page.data, 'meta_description', lang) ?? localize(page.data, 'description', lang),
    image: page.data.image,
  };
}
