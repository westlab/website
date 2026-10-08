import { getCollection } from 'astro:content';
import { t, type Lang } from '../i18n/ui';

// ヘッダーのナビ構成（Header）とパンくず（Breadcrumb）が共有する階層。
// 第1階層は src/data/pages.yaml、ドロップダウンのサブページはここで定義する。

export interface NavLink {
  label: string;
  href: string;
}

export interface NavItem extends NavLink {
  subs: NavLink[];
}

type UiKey = Parameters<typeof t>[1];

// ドロップダウンを持つナビ項目のサブページ（キーは pages.yaml の id）
const children: Record<string, { key: UiKey; href: string }[]> = {
  research: [
    { key: 'nav.research.about', href: '/research/' },
    { key: 'nav.research.videos', href: '/videos/' },
  ],
  members: [
    { key: 'nav.members.current', href: '/members/' },
    { key: 'nav.members.alumni', href: '/alumni/' },
  ],
};

export async function getNavItems(lang: Lang): Promise<NavItem[]> {
  const pages = (await getCollection('pages')).sort((a, b) => a.data.order - b.data.order);
  return pages.map((page) => ({
    label: lang === 'ja' ? page.data.title_ja : page.data.title_en,
    href: page.data.href,
    subs: (children[page.id] ?? []).map((sub) => ({ label: t(lang, sub.key), href: sub.href })),
  }));
}

// path のページまでの階層（ホームと path 自身を含む）。
// ナビに無いページ（研究詳細など）は current を渡すと、URL の前方一致で最も深いナビ項目の下に置く。
export async function getBreadcrumb(lang: Lang, path: string, current?: NavLink): Promise<NavLink[]> {
  const home = { label: t(lang, 'nav.home'), href: '/' };
  // サブページを先に並べ、同じ href のときはサブページの名前を使う（/research/ は「研究説明」）
  const items = await getNavItems(lang);
  const trails: NavLink[][] = [];
  for (const item of items) {
    for (const sub of item.subs) {
      trails.push(sub.href === item.href ? [sub] : [{ label: item.label, href: item.href }, sub]);
    }
  }
  for (const item of items) trails.push([{ label: item.label, href: item.href }]);

  const exact = trails.find((trail) => trail.at(-1)!.href === path);
  if (exact) return [home, ...exact];

  const parent = trails
    .filter((trail) => path.startsWith(trail.at(-1)!.href))
    .sort((a, b) => b.at(-1)!.href.length - a.at(-1)!.href.length)[0];
  return [home, ...(parent ?? []), ...(current ? [current] : [])];
}
