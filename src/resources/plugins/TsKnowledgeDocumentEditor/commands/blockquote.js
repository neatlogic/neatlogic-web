export default function blockquote({ editor, pos, options }) {
  editor
    .chain()
    .focus()
    .toggleBlockquote()
    .run();
}
