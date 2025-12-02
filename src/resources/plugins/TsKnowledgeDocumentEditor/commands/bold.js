export default function bold({ editor, position, options }) {
  const { isbold } = options || {};
  if (isbold) {
    editor
      .chain()
      .focus()
      .unsetBold()
      .run();
  } else {
    editor
      .chain()
      .focus()
      .setBold()
      .run();
  }
}
