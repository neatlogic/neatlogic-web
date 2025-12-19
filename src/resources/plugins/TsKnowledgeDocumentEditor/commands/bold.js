export default function bold({ editor, position, options }) {
  editor
    .chain()
    .focus()
    .toggleBold()
    .run();
}
