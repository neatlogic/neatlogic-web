
import { deleteRowByUuid } from '@/views/pages/knowledge/category/knowledgeeditor/extensions/table/table-utils.js';
export default function deleteRow({ editor, position, options }) {
  const { nodeAttrs = {}, index } = options || {};
  const tableUuid = nodeAttrs.blockUuid;
  deleteRowByUuid(editor, tableUuid, index);
}
