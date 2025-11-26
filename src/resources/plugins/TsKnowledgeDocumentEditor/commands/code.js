export default function code({ editor, pos, options }) {
  editor
    .chain()
    .focus()
    .toggleCode()
    .run();
}
