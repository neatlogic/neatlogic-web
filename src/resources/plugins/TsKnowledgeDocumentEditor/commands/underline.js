export default function underline({ editor, pos, options }) {
  editor
    .chain()
    .focus()
    .toggleUnderline()
    .run();
}
