export default function codeBlock({ editor, position, options }) {
  const { isToggle } = options || {};
  const { insertPosition, startPosition } = position || {};
  const nodeInnerContentPosition = startPosition + 1; // 节点内部内容的位置
  if (isToggle) {
    editor.chain().focus().setTextSelection(nodeInnerContentPosition).toggleCodeBlock().run();
  } else {
    editor
      .chain()
      .focus()
      .insertContentAt(insertPosition, {
        type: 'codeBlock',
        content: [{ type: 'text', text: '新代码块内容' }]
      })
      .run();
  }
}
