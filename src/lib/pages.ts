import { getCollection } from 'astro:content';

// pages.yaml の読み出し。Nav Card を持つページ（nav が true）と、画像だけのページ（nav: false）を区別する。

export async function getNavPages() {
  const pages = await getCollection('pages');
  return pages.flatMap((page) => (page.data.nav ? [{ ...page, data: page.data }] : [])).sort((a, b) => a.data.order - b.data.order);
}

export async function getNavPage(id: string) {
  const page = (await getNavPages()).find((p) => p.id === id);
  if (!page) throw new Error(`pages.yaml に Nav Card を持つページ「${id}」がありません。`);
  return page;
}

// Page Title（PageHero）の画像。Nav Card の有無に関わらず、全ページ pages.yaml から引く
export async function getPageImage(id: string) {
  const page = (await getCollection('pages')).find((p) => p.id === id);
  if (!page) throw new Error(`pages.yaml にページ「${id}」がありません。`);
  return page.data.image;
}
