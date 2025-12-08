export default function blockquote({ editor, position, options }) {
  const { isToggle } = options || {};
  const { endPosition } = position || {};
  if (isToggle) {
    editor.chain().focus().setTextSelection(endPosition - 1).toggleBlockquote().run();
  } else {
    editor
      .chain()
      .focus()
      .insertContentAt(position, {
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
