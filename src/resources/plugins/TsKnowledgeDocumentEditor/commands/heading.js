// heading.js
export default function heading({ editor, pos, options }) {
  const { level = 1 } = options || {};
  editor
    .chain()
    .focus()
    .insertContentAt(pos, {
      type: 'heading',
      attrs: { level },
      content: [{ type: 'text', text: `新标题${level}内容` }]
    })
    .run();
}
