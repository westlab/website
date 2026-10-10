// 画像だけの段落を <figure><img><figcaption>alt</figcaption></figure> に変換する mdast プラグイン
// alt をそのままキャプションに使うので、原稿側は ![キャプション](画像) と書くだけでよい
// キャプションがある画像は alt="" にする（figure の名前は figcaption から取れ、同じ文を2回読み上げないため）
import type { Image, Paragraph, PhrasingContent } from 'mdast';
import type { MdastVisitorContext } from 'satteri';

const isBlank = (node: PhrasingContent) => node.type === 'text' && !node.value.trim();

export const figure = {
  name: 'figure',
  paragraph(node: Paragraph, ctx: MdastVisitorContext) {
    const images = node.children.filter((child): child is Image => child.type === 'image');
    if (!images.length) return;
    if (!node.children.every((child) => child.type === 'image' || child.type === 'break' || isBlank(child))) return;
    ctx.replaceNode(
      node,
      images.map((image) => ({
        type: 'figure',
        data: { hName: 'figure' },
        children: [
          image.alt ? { ...image, alt: '' } : image,
          ...(image.alt
            ? [{ type: 'figcaption', data: { hName: 'figcaption' }, children: [{ type: 'text', value: image.alt }] }]
            : []),
        ],
      })),
    );
  },
};
