export default function italic({ editor, position, options }) {
  const { isItalic } = options || {};
  if (isItalic) {
    editor
      .chain()
      .focus()
      .unsetItalic()
      .run();
  } else {
    editor
      .chain()
      .focus()
      .setItalic()
      .run();
  }
}
