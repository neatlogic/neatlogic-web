export default function selectedColumn({ editor, position, options }) {
  const { nodeAttrs = {}, index } = options || {};
  const tableUuid = nodeAttrs['data-uuid'];
  editor.commands.highlightTableColumn(tableUuid, index);
}
