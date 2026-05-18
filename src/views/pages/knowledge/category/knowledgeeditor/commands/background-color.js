export default function backgroundColor({ editor, position, options }) {
  const { backgroundColor = '' } = options || {};
  editor
    .chain()
    .focus()
    .setBackgroundColor(backgroundColor)
    .run();
}
