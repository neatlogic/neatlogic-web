export default function horizontalRule({ editor, position, options }) {
  const { isToggle } = options || {};
  if (isToggle) {
    editor
      .chain()
      .focus()
      .setHorizontalRule()
      .run();
  } else {
    editor
      .chain()
      .focus()
      .insertContentAt(position, {
        type: 'horizontalRule'
      })
      .run();
  }
}
