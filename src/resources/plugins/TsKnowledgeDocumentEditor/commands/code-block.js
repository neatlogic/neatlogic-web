export default function codeBlock({ editor, position, options }) {
  const { isToggle } = options || {};
  const { insertPosition } = position || {};
  if (isToggle) {
    editor.chain().focus().setTextSelection(insertPosition - 1).toggleCodeBlock().run();
  } else {
    editor
      .chain()
      .focus()
      .insertContentAt(insertPosition, {
        type: 'codeBlock',
        content: [{ type: 'text', text: '新代码块内容' }]
      })
      .run();
  }
}
