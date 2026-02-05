import { deleteColumnByUuid } from '@/resources/plugins/TsKnowledgeDocumentEditor/extensions/table/table-utils.js';
export default function deleteColumn({ editor, position, options }) {
  const { nodeAttrs = {}, index } = options || {};
  const tableUuid = nodeAttrs.blockUuid;
  deleteColumnByUuid(editor, tableUuid, index);
}
