
import { NodeSelection } from 'prosemirror-state';

export default function deleteRange({ editor, position, options = {} }) {
  const { doc } = editor.state;
  const { attrs = {} } = options || {};
  const { startPosition, endPosition } = position || {};
  const uuid = attrs?.blockUuid || '';
  const type = attrs?.blockType || '';

  let targetPos = null;

  if (type === 'table') {
    // 处理表格删除，要不然只是删除表格的内容，而不是整个表格
    editor.chain()
      .deleteRange({
        from: startPosition,
        to: endPosition
      })
      .run();
    return false;
  }

  doc.descendants((node, pos) => {
    if (node.attrs?.blockUuid === uuid) {
      targetPos = pos;
      return false; // 停止遍历
    }
  });

  if (targetPos == null) return;

  const tr = editor.state.tr.setSelection(
    NodeSelection.create(doc, targetPos)
  );

  editor.view.dispatch(tr);
  editor.commands.deleteSelection();
}
