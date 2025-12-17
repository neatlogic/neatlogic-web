import { RowColSelectedPluginKey } from '@/resources/plugins/TsKnowledgeDocumentEditor/extensions/table/row-col-selected/row-col-selected-plugin.js';
export default function selectedRow({ editor, position, options }) {
  const { nodeAttrs = {}, index, type } = options || {};
  const tableUuid = nodeAttrs['data-uuid'];
  editor.view.dispatch(
    editor.state.tr.setMeta(RowColSelectedPluginKey, {
      ...RowColSelectedPluginKey.getState(editor.state),
      active: { tableUuid, index, type: type }
    })
  );
}
