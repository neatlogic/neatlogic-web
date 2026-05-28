export default function backgroundColor({ editor, position, options }) {
  const { backgroundColor = '' } = options || {};
  if (!backgroundColor) {
    editor
      .chain()
      .focus()
      .unsetBackgroundColor()
      .run();
    return;
  }

  editor
    .chain()
    .focus()
    .setBackgroundColor(backgroundColor)
    .run();
}
