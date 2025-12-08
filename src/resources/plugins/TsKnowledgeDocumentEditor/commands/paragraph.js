export default function paragraph({ editor, position, options }) {
  const { isToggle } = options || {};
  const { endPosition } = position || {};
  if (isToggle) {
    editor.chain().focus().setTextSelection(endPosition - 1).setParagraph().run();
  } else {
    editor
      .chain()
      .focus()
      .setParagraph()
      .run();
  }
}
