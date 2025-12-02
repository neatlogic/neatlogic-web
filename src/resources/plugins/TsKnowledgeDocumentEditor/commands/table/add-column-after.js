export default function addColumnAfter({ editor, position, options }) {
  editor
    .chain()
    .focus()
    .addColumnAfter()
    .run();
}
