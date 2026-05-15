export default function selectedRow({ editor, position, options }) {
  const { nodeAttrs = {}, index } = options || {};
  const tableUuid = nodeAttrs.blockUuid;
  editor.commands.highlightTableRow(tableUuid, index);
}
