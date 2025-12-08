export default function mergeOrSplit({ editor, position, options }) {
  editor
    .chain()
    .focus()
    .mergeOrSplit()
    .run();
}
