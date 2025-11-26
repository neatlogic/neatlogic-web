export default function bold({ editor, pos, options }) {
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
