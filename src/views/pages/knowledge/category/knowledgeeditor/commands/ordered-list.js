export default function orderedList({ editor, position, options }) {
  const { isToggle } = options || {};
  const { insertPosition, startPosition } = position || {};
  const nodeInnerContentPosition = startPosition + 1; // 节点内部内容的位置
  if (isToggle) {
    editor
      .chain()
      .focus()
      .setTextSelection(nodeInnerContentPosition)
      .toggleOrderedList()
      .run();
  } else {
    editor.chain().focus()
      .insertContentAt(insertPosition,
        {
          type: 'orderedList',
          content: [
            { type: 'listItem',
              content: [
                { type: 'paragraph', content: [] }
              ] 
            }
          ]
        }
      ).run();
  }
}
