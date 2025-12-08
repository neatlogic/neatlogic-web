export default function addColumnBefore({ editor, position, options }) {
  editor
    .chain()
    .focus()
    .addColumnBefore()
    .run();
}
