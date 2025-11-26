export default function backgroundColor({ editor, pos, options }) {
  const { backgroundColor = '' } = options || {};
  editor
    .chain()
    .focus()
    .setBackgroundColor(backgroundColor)
    .run();
}
