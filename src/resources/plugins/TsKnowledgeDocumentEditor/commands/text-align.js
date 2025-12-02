export default function textAlign({ editor, position, options }) {
  const { textAlign } = options || {};
  editor
    .chain()
    .focus()
    .toggleTextAlign(textAlign)
    .run();
}
