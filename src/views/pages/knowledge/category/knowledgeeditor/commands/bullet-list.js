export default function bulletList({ editor, position, options }) {
  const { isToggle } = options || {};
  const { insertPosition, startPosition } = position || {};
  const nodeInnerContentPosition = startPosition + 1; // 节点内部内容的位置
  if (isToggle) {
    editor.chain().focus().setTextSelection(nodeInnerContentPosition).toggleBulletList().run();
  } else {
    editor.chain().focus().insertContentAt(insertPosition, {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [] }
          ]
        }
      ]
    }).run();
  }
}
