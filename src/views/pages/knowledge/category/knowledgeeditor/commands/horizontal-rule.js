export default function horizontalRule({ editor, position, options }) {
  const { isToggle } = options || {};
  const { insertPosition } = position || {};
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
      .insertContentAt(insertPosition, {
        type: 'horizontalRule'
      })
      .run();
  }
}
