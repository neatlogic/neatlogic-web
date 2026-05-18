export default function tableCellBackgorund({ editor, position, options }) {
  const { nodeAttrs = {}, index, backgroundColor, type = '' } = options || {};
  const tableUuid = nodeAttrs.blockUuid;
  editor
    .chain()
    .focus()
    .setCellBackground({
      color: backgroundColor,
      tableUuid: tableUuid,
      rowColIndex: index,
      type: type
    })
    .run();
}
