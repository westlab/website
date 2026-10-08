// 研究トピックカード（Section / 研究トピック本体, node 208:362）のアイコン作成スクリプト
// 使い方: このファイルの中身をそのまま use_figma の `code` に渡す

const CARD_DEFS = [
  {
    topic: 'ネットワーク透明なエッジコンピューティング基盤',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    topic: 'FPGAによるAI・信号処理のハードウェアアクセラレーション',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="7" width="10" height="10" rx="1.2" stroke="#FFFFFF" stroke-width="1.5"/>
      <path d="M9.5 12 h1 l0.8 -1.7 l1 3.4 l0.8 -1.7 h1" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    topic: '情報匿名化とプライバシー保護データ利活用',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.3 L19 5.2 V11.2 A9 9 0 0 1 12 19.9 A9 9 0 0 1 5 11.2 V5.2 Z" stroke="#FFFFFF" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="9.5" cy="10.2" r="1" fill="#FFFFFF"/>
      <circle cx="13.6" cy="9.4" r="1" fill="#FFFFFF" opacity="0.55"/>
      <circle cx="11.4" cy="13" r="1" fill="#FFFFFF" opacity="0.3"/>
      <circle cx="14.6" cy="12.6" r="1" fill="#FFFFFF" opacity="0.75"/>
    </svg>`
  },
  {
    topic: '軽量機械学習・連合学習',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#FFFFFF" stroke-width="1.1" opacity="0.65">
        <line x1="5" y1="8" x2="12" y2="5"/>
        <line x1="5" y1="8" x2="12" y2="12"/>
        <line x1="5" y1="16" x2="12" y2="12"/>
        <line x1="5" y1="16" x2="12" y2="19"/>
        <line x1="12" y1="5" x2="19" y2="8"/>
        <line x1="12" y1="12" x2="19" y2="8"/>
        <line x1="12" y1="12" x2="19" y2="16"/>
        <line x1="12" y1="19" x2="19" y2="16"/>
      </g>
      <g fill="#FFFFFF">
        <circle cx="5" cy="8" r="1.5"/>
        <circle cx="5" cy="16" r="1.5"/>
        <circle cx="12" cy="5" r="1.5"/>
        <circle cx="12" cy="12" r="1.5"/>
        <circle cx="12" cy="19" r="1.5"/>
        <circle cx="19" cy="8" r="1.5"/>
        <circle cx="19" cy="16" r="1.5"/>
      </g>
    </svg>`
  },
  {
    topic: 'スマートコミュニティ・スマートシティ情報基盤',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12.5 L12 5.5 L20 12.5 M6.5 11.5 V19.5 H17.5 V11.5" stroke="#FFFFFF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="17" cy="3.4" r="1" fill="#FFFFFF"/>
      <circle cx="19.6" cy="5.3" r="0.75" fill="#FFFFFF" opacity="0.7"/>
      <circle cx="21.4" cy="2" r="0.55" fill="#FFFFFF" opacity="0.45"/>
    </svg>`
  },
  {
    topic: 'スマート農業',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21 V10" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M12 14C8.2 14 6 11.3 6 7.8C9.3 7.8 12 10 12 14Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M12 11.5C15.8 11.5 18 8.8 18 5.3C14.7 5.3 12 7.5 12 11.5Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M7.5 21 H16.5" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="16" cy="21" r="1" fill="#FFFFFF"/>
      <path d="M16 18.7 A2.3 2.3 0 0 1 18.3 21" stroke="#FFFFFF" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <path d="M16 17 A4 4 0 0 1 20 21" stroke="#FFFFFF" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    topic: '技術標準化',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="9.5" r="6.2" stroke="#FFFFFF" stroke-width="1.6"/>
      <path d="M9 9.7 L11 11.7 L15 7.3" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8.7 15 L7.2 20.5 L12 18.3 L16.8 20.5 L15.3 15" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  }
];

const ICON_SIZE = 38; // 48x48バッジに対して約79%
const OFFSET = (48 - ICON_SIZE) / 2;

const results = [];
for (const def of CARD_DEFS) {
  try {
    let cardFrame = figma.currentPage.findOne(
      n => (n.type === 'FRAME' || n.type === 'INSTANCE') && n.name.endsWith(def.topic)
    );
    if (!cardFrame) { results.push({ topic: def.topic, error: 'card not found' }); continue; }
    if (cardFrame.type === 'INSTANCE') cardFrame = cardFrame.detachInstance();
    cardFrame.name = `Card / ${def.topic}`;

    const header = cardFrame.findOne(n => n.type === 'FRAME' && n.name === 'Header');
    if (!header) { results.push({ topic: def.topic, error: 'no Header found' }); continue; }

    const old = header.findOne(n => n.name === 'Icon Glyph');
    if (old) old.remove();

    const glyph = figma.createNodeFromSvg(def.svg);
    glyph.name = 'Icon Glyph';
    glyph.resize(ICON_SIZE, ICON_SIZE);
    header.appendChild(glyph);
    if (header.layoutMode && header.layoutMode !== 'NONE') {
      glyph.layoutPositioning = 'ABSOLUTE';
    }
    glyph.x = OFFSET;
    glyph.y = OFFSET;

    // 見た目上の重心をバッジ中央に合わせる（アイコンごとに描画内容の余白が違うため）
    const iconRect = header.findOne(n => n.name === 'Icon');
    const badgeAbs = iconRect.absoluteBoundingBox;
    const badgeCenterX = badgeAbs.x + badgeAbs.width / 2;
    const badgeCenterY = badgeAbs.y + badgeAbs.height / 2;
    const renderBounds = glyph.absoluteRenderBounds;
    const glyphCenterX = renderBounds.x + renderBounds.width / 2;
    const glyphCenterY = renderBounds.y + renderBounds.height / 2;
    glyph.x += badgeCenterX - glyphCenterX;
    glyph.y += badgeCenterY - glyphCenterY;

    results.push({ topic: def.topic, frameId: cardFrame.id, glyphId: glyph.id });
  } catch (e) {
    results.push({ topic: def.topic, error: String(e) });
  }
}
return { results };
