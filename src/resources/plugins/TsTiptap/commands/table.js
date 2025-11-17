export default function table({ editor, pos, options }) {
  const { rows = 0, cols = 0 } = options || {};
  if (rows === 0 || cols === 0) { return; }
  editor
    .chain()
    .focus()
    .insertTable({ rows: rows, cols: cols, withHeaderRow: true })
    .run();
}
