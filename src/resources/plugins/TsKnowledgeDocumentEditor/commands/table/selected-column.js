import { RowColSelectedPluginKey } from '@/resources/plugins/TsKnowledgeDocumentEditor/extensions/table/row-col-selected/row-col-selected-plugin.js';
export default function selectedColumn({ editor, position, options }) {
  const { nodeAttrs = {}, index } = options || {};
  const tableUuid = nodeAttrs['data-uuid'];
  editor.view.dispatch(
    editor.state.tr.setMeta(RowColSelectedPluginKey, {
      ...RowColSelectedPluginKey.getState(editor.state),
      active: { tableUuid, index, type: 'column' }
    })
  );
}
