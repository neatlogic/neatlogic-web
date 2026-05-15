export default function insertTable({ editor, position, options, _this }) {
  const { rows = 0, cols = 0 } = options || {};
  const { insertPosition } = position || {};
  if (rows === 0 || cols === 0) {
    return;
  }
  // 构建表格内容
  const tableContent = Array.from({ length: rows }).map(() => ({
    type: 'tableRow',
    content: Array.from({ length: cols }).map(() => ({
      type: 'tableCell',
      attrs: { colwidth: [100] }, // 设置默认列宽为100
      content: [{ type: 'paragraph' }]
    }))
  }));

  const tableNode = {
    type: 'table',
    attrs: { withHeaderRow: true, dataUuid: _this.$utils.setUuid(), dataBlockType: 'table' },
    content: tableContent
  };

  editor.chain().focus().insertContentAt(insertPosition, tableNode).run();
}
