export default function codeBlock({ editor, pos, options }) {
  editor
    .chain()
    .focus()
    .insertContentAt(pos, {
      type: 'codeBlock',
      content: [{ type: 'text', text: '新代码块内容' }]
    })
    .run();
}
