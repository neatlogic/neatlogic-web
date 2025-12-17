
import { deleteRowByUuid } from '@/resources/plugins/TsKnowledgeDocumentEditor/extensions/table/table-utils.js';
export default function deleteRow({ editor, position, options }) {
  const { nodeAttrs = {}, index } = options || {};
  const tableUuid = nodeAttrs['data-uuid'];
  deleteRowByUuid(editor, tableUuid, index);
}
