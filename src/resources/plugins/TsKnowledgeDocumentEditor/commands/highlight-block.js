export default function highlightBlock({ editor, position, options }) {
  const { isToggle } = options || {};
  const { endPosition } = position || {};
  if (isToggle) {
    editor.chain()
      .focus()
      .setTextSelection(endPosition - 1)
      .toggleHighlightBlock()
      .run();
  } else {
    // 插入高亮块
    editor.chain().focus().insertHighlightBlockContent({
      position: position,
      text: '高亮块内容...'
    }).run();
  }
}
