export default function addColumnBefore({ editor, pos, options }) {
  editor
    .chain()
    .focus()
    .addColumnBefore()
    .run();
}
