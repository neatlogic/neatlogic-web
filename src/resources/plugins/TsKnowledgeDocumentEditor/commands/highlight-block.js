export default function highlightBlock({ editor, position, options }) {
  const { isToggle } = options || {};
  const { endPosition, insertPosition } = position || {};
  if (isToggle) {
    editor.chain()
      .focus()
      .setTextSelection(endPosition - 1)
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
