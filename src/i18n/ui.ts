export const languages = {
  ja: '日本語',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'ja';

export const ui = {
  ja: {
    'nav.research': '研究内容',
    'nav.members': 'メンバー',
    'nav.publications': '業績',
    'publications.fiscalYear': '年度',
    'publications.blockNav': '年度の範囲',
    'nav.applicants': '入室・見学',
    'nav.links': 'リンク',
    'nav.search': '検索',
    'nav.research.about': '研究説明',
    'nav.research.videos': '研究紹介動画',
    'nav.members.current': 'メンバー',
    'nav.members.alumni': '卒業生',
    'nav.menu.open': 'メニューを開く',
    'nav.menu.close': 'メニューを閉じる',
    'common.more': '詳しく見る',
    'research.topics.title': '研究トピック',
    'research.topics.lead': 'それぞれの詳細は以下をご覧ください。',
    'research.past.title': '過去の研究',
    'research.past.lead': '過去の研究については以下をご参照ください。尚、各リンク先のWebサイトはプロジェクト終了当時のものです。あらかじめご了承ください。',
    'videos.lead': '西研究室の活動を紹介する動画をまとめています。',
    'videos.play': '動画を再生',
    'common.expand': '開く',
    'common.collapse': '閉じる',
    'common.backToTop': 'ページの先頭へ',
    'home.hero.title': 'Welcome to West Lab.',
    'home.hero.lead': 'Exploit The Future Computing and Networking',
  },
  en: {
    'nav.research': 'Research',
    'nav.members': 'Members',
    'nav.publications': 'Publications',
    'publications.fiscalYear': '',
    'publications.blockNav': 'Year range',
    'nav.applicants': 'Applicants',
    'nav.links': 'Links',
    'nav.search': 'Search',
    'nav.research.about': 'Research',
    'nav.research.videos': 'Videos',
    'nav.members.current': 'Members',
    'nav.members.alumni': 'Alumni',
    'nav.menu.open': 'Open menu',
    'nav.menu.close': 'Close menu',
    'common.more': 'Learn more',
    'research.topics.title': 'Research Topics',
    'research.topics.lead': 'See each topic below for details.',
    'research.past.title': 'Past Research',
    'research.past.lead': 'Please refer to the following for past research. Note that the linked websites are as they were when each project ended.',
    'videos.lead': 'A collection of videos introducing the activities of the West Lab.',
    'videos.play': 'Play video',
    'common.expand': 'Read more',
    'common.collapse': 'Close',
    'common.backToTop': 'Back to top',
    'home.hero.title': 'Welcome to West Lab.',
    'home.hero.lead': 'Exploit The Future Computing and Networking',
  },
} as const;

export function t(lang: Lang, key: keyof (typeof ui)['ja']): string {
  return ui[lang][key] ?? ui[defaultLang][key];
}
