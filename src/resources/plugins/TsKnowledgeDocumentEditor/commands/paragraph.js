export default function paragraph({ editor, position, options }) {
  editor
    .chain()
    .focus()
    .setParagraph()
    .run();
}
