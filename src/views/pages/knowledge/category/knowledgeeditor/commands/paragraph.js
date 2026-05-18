export default function paragraph({ editor, position, options }) {
  const { isToggle } = options || {};
  const { insertPosition, startPosition } = position || {};
  const nodeInnerContentPosition = startPosition + 1;
  if (isToggle) {
    editor.chain().focus().setTextSelection(nodeInnerContentPosition).setParagraph().run();
  } else {
    editor
      .chain()
      .focus()
      .insertContentAt(insertPosition, {
        type: 'paragraph',
        content: []
      })
      .run();
  }
}
