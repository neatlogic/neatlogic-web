export default function insertTable({ editor, position, options }) {
  const { rows = 0, cols = 0 } = options || {};
  if (rows === 0 || cols === 0) {
    return;
  }
  // 构建表格内容
  const tableContent = Array.from({ length: rows }).map(() => ({
    type: 'tableRow',
    content: Array.from({ length: cols }).map(() => ({
      type: 'tableCell',
      content: [{ type: 'paragraph' }]
    }))
  }));

  const tableNode = {
    type: 'table',
    attrs: { withHeaderRow: true },
    content: tableContent
  };

  editor.chain().focus().insertContentAt(position, tableNode).run();
}
