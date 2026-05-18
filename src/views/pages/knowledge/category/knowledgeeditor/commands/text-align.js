export default function textAlign({ editor, position, options }) {
  const { textAlign } = options || {};
  editor
    .chain()
    .focus()
    .setTextAlign(textAlign)
    .run();
}
