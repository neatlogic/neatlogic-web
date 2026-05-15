export default function blockquote({ editor, position, options }) {
  const { isToggle } = options || {};
  const { insertPosition, startPosition } = position || {};
  const nodeInnerContentPosition = startPosition + 1; // 节点内部内容的位置
  if (isToggle) {
    editor.chain().focus().setTextSelection(nodeInnerContentPosition).toggleBlockquote().run();
  } else {
    editor
      .chain()
      .focus()
      .insertContentAt(insertPosition, {
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: []
          }
        ]
      })
      .run();
  }
}
