export default function paragraph({ editor, position, options }) {
  const { isToggle } = options || {};
  const { startPosition } = position || {};
  const nodeInnerContentPosition = startPosition + 1; // 节点内部内容的位置
  if (isToggle) {
    editor.chain().focus().setTextSelection(nodeInnerContentPosition).setParagraph().run();
  } else {
    editor
      .chain()
      .focus()
      .setParagraph()
      .run();
  }
}
