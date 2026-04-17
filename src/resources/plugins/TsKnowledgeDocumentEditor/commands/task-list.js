export default function taskList({ editor, position, options }) {
  const { isToggle } = options || {};
  const { insertPosition, startPosition } = position || {};
  const nodeInnerContentPosition = startPosition + 1; // 节点内部内容的位置
  if (isToggle) {
    editor.chain().focus().setTextSelection(nodeInnerContentPosition).toggleTaskList().run();
  } else {
    editor.chain().focus().insertContentAt(insertPosition, {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [{ type: 'paragraph' }]
        }
      ]
    }).run();
  }
}
