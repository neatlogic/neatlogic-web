export default function heading({ editor, position, options }) {
  const { level, isToggle } = options || {};
  const { insertPosition, startPosition } = position || {};
  const nodeInnerContentPosition = startPosition + 1; // 节点内部内容的位置
  if (isToggle) {
    editor.chain().focus().setTextSelection(nodeInnerContentPosition).toggleHeading({ level: level }).run();
  } else {
    editor
      .chain()
      .focus()
      .insertContentAt(insertPosition, {
        type: 'heading',
        attrs: { level: level },
        content: [{ type: 'text', text: `新标题${level}内容` }]
      })
      .run();
  }
}
