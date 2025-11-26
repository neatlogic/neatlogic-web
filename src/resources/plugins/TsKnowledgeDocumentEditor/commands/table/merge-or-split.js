export default function mergeOrSplit({ editor, pos, options }) {
  editor
    .chain()
    .focus()
    .mergeOrSplit()
    .run();
}
