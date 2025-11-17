export default function bulletList({ editor, pos, options }) {
  editor
    .chain()
    .focus()
    .toggleBulletList()
    .run();
}
