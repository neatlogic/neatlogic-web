export default function tableCellVerticalAlign({ editor, position, options }) {
  const { nodeAttrs = {}, index, verticalAlign = '', type = '' } = options || {};
  const tableUuid = nodeAttrs['data-uuid'];
  editor
    .chain()
    .focus()
    .setCellVerticalAlign({
      verticalAlign: verticalAlign,
      tableUuid: tableUuid,
      rowColIndex: index,
      type: type
    })
    .run();
}
