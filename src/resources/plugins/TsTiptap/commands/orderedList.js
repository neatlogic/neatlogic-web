export default function orderedList({ editor, pos, options }) {
  editor
    .chain()
    .focus()
    .toggleOrderedList()
    .run();
}
