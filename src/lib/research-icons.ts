// 研究トピックのアイコンの種類。front matter の icon に書ける値で、
// 実際のSVGは src/components/icons/ResearchIcon.astro が持つ。追加するときは両方に足す。
export const RESEARCH_ICONS = [
  'network',
  'hardware',
  'anonymization',
  'ai',
  'smart-community',
  'smart-agriculture',
  'standardization',
] as const;

export type ResearchIconName = (typeof RESEARCH_ICONS)[number];
