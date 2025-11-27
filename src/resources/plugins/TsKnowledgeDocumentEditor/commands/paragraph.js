export default function paragraph({ editor, pos, options }) {
  editor
    .chain()
    .focus()
    .setParagraph()
    .run();
}
