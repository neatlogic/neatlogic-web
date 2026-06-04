export default function strike({ editor, position, options }) {
  const { isStrike } = options || {};
  if (isStrike) {
    editor
      .chain()
      .focus()
      .unsetStrike()
      .run();
  } else {
    editor
      .chain()
      .focus()
      .setStrike()
      .run();
  }
}
