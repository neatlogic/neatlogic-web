export default function blockquote({ editor, position, options }) {
  const { isToggle } = options || {};
  if (isToggle) {
    editor
      .chain()
      .focus()
      .toggleBlockquote()
      .run();
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
      }).run();
  }
}
