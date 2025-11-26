export default function italic({ editor, pos, options }) {
  const { isStrike } = options || {};
  if (isStrike) {
    editor
      .chain()
      .focus()
      .unsetItalic();
  } else {
    editor
      .chain()
      .focus()
      .setItalic()
      .run();
  }
}
