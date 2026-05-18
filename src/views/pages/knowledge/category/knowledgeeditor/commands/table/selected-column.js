export default function selectedColumn({ editor, position, options }) {
  const { nodeAttrs = {}, index } = options || {};
  const tableUuid = nodeAttrs.blockUuid;
  editor.commands.highlightTableColumn(tableUuid, index);
}
