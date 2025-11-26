export default function addColumnAfter({ editor, pos, options }) {
  editor
    .chain()
    .focus()
    .addColumnAfter()
    .run();
}
