export default function highlightBlock({ editor, position, options }) {
  const { isToggle } = options || {};
  const { insertPosition, startPosition } = position || {};
  const nodeInnerContentPosition = startPosition + 1; // 节点内部内容的位置
  if (isToggle) {
    editor.chain()
      .focus()
      .setTextSelection(nodeInnerContentPosition)
      .toggleHighlightBlock()
      .run();
  } else {
    // 插入高亮块
    editor.chain().focus().insertHighlightBlockContent({
      position: insertPosition,
      text: '高亮块内容...'
    }).run();
  }
}
