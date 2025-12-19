export default function selectedRow({ editor, position, options }) {
  const { nodeAttrs = {}, index } = options || {};
  const tableUuid = nodeAttrs['data-uuid'];
  editor.commands.highlightTableRow(tableUuid, index);
}
