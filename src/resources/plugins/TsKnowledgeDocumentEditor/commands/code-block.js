export default function codeBlock({ editor, position, options }) {
  const { isToggle } = options || {};
  if (isToggle) {
    editor.chain().focus().toggleCodeBlock().run();
  } else {
    editor
      .chain()
      .focus()
      .insertContentAt(position, {
        type: 'codeBlock',
        content: [{ type: 'text', text: '新代码块内容' }]
      })
      .run();
  }
}
