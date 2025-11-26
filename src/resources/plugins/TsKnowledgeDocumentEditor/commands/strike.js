export default function strike({ editor, pos, options }) {
  const { isStrike } = options || {};
  if (isStrike) {
    editor
      .chain()
      .focus()
      .unsetStrike();
  } else {
    editor
      .chain()
      .focus()
      .setStrike()
      .run();
  }
}
