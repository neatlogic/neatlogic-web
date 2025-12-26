export default function paragraph({ editor, position, options }) {
  const { isToggle } = options || {};
  const { insertPosition } = position || {};
  if (isToggle) {
    editor.chain().focus().setTextSelection(insertPosition - 1).setParagraph().run();
  } else {
    editor
      .chain()
      .focus()
      .setParagraph()
      .run();
  }
}
