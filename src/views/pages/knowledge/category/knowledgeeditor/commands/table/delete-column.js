import { deleteColumnByUuid } from '@/views/pages/knowledge/category/knowledgeeditor/extensions/table/table-utils.js';
export default function deleteColumn({ editor, position, options }) {
  const { nodeAttrs = {}, index } = options || {};
  const tableUuid = nodeAttrs.blockUuid;
  deleteColumnByUuid(editor, tableUuid, index);
}
