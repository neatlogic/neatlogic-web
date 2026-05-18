export default function color({ editor, position, options }) {
  const { color } = options || {};
  editor
    .chain()
    .focus()
    .setColor(color)
    .run();
}
