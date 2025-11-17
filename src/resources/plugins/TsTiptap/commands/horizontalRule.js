export default function horizontalRule({ editor, pos, options }) {
  editor
    .chain()
    .focus()
    .setHorizontalRule()
    .run();
}
