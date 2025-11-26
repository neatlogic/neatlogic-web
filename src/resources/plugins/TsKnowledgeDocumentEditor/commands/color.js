export default function color({ editor, pos, options }) {
  const { color } = options || {};
  editor
    .chain()
    .focus()
    .setColor(color)
    .run();
}
