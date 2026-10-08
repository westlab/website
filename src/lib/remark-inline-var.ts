// $k$ のような変数記法を <var>k</var> に変換する mdast プラグイン（数式ライブラリなしの簡易版）
// Astro 7 の既定は Sätteri で remark は入っていないため、Sätteri の mdast プラグイン形式で書く
const PATTERN = /\$([^$\n]+?)\$/;

type TextNode = { type: 'text'; value: string };
type VarNode = {
  type: 'emphasis';
  data: { hName: string };
  children: TextNode[];
};

// text を「テキスト / <var> / テキスト…」に分割する
function splitText(value: string): (TextNode | VarNode)[] {
  const parts: (TextNode | VarNode)[] = [];
  let rest = value;
  let match: RegExpExecArray | null;
  while ((match = PATTERN.exec(rest))) {
    if (match.index > 0) parts.push({ type: 'text', value: rest.slice(0, match.index) });
    parts.push({
      type: 'emphasis',
      data: { hName: 'var' },
      children: [{ type: 'text', value: match[1] }],
    });
    rest = rest.slice(match.index + match[0].length);
  }
  if (rest) parts.push({ type: 'text', value: rest });
  return parts;
}

export const inlineVar = {
  name: 'inline-var',
  text(node: any, ctx: any) {
    if (!PATTERN.test(node.value)) return;
    ctx.replaceNode(node, splitText(node.value));
  },
  // alt は斜体にできないので $ だけ取り除く
  image(node: any, ctx: any) {
    if (node.alt && node.alt.includes('$')) {
      ctx.setProperty(node, 'alt', node.alt.replace(/\$([^$\n]+?)\$/g, '$1'));
    }
  },
};
