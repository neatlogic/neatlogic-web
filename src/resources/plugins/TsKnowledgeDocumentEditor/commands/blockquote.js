export default function blockquote({ editor, position, options }) {
  const { isToggle } = options || {};
  const { insertPosition } = position || {};
  if (isToggle) {
    editor.chain().focus().setTextSelection(insertPosition - 1).toggleBlockquote().run();
  } else {
    editor
      .chain()
      .focus()
      .insertContentAt(insertPosition, {
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: []
          }
        ]
      })
      .run();
  }
}
