export default function codeBlock({ editor, pos, options }) {
  const { isToggle } = options || {};
  if (isToggle) {
    editor.chain().focus().toggleCodeBlock().run();
  } else {
    editor
      .chain()
      .focus()
      .insertContentAt(pos, {
        type: 'codeBlock',
        content: [{ type: 'text', text: '新代码块内容' }]
      })
      .run();
  }
}
