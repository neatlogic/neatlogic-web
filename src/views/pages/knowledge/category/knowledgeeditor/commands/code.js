export default function code({ editor, position, options }) {
  editor
    .chain()
    .focus()
    .toggleCode()
    .run();
}
