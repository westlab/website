import { getEntry } from 'astro:content';

// site.yaml（研究室名・meta description・フッターの連絡先）の唯一のレコード。
export async function getSite() {
  return (await getEntry('site', 'contact'))!.data;
}
