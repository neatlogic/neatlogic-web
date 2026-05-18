export default function underline({ editor, position, options }) {
  editor
    .chain()
    .focus()
    .toggleUnderline()
    .run();
}
