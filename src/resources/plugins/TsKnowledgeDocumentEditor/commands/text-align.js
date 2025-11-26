export default function textAlign({ editor, pos, options }) {
  const { textAlign } = options || {};
  editor
    .chain()
    .focus()
    .toggleTextAlign(textAlign)
    .run();
}
