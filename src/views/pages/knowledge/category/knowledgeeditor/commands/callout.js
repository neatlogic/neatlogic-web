export default function callout({ editor, position, options }) {
  const { isToggle } = options || {};
  const { insertPosition, startPosition } = position || {};
  const nodeInnerContentPosition = startPosition + 1;
  if (isToggle) {
    editor.chain()
      .focus()
      .setTextSelection(nodeInnerContentPosition)
      .toggleCallout()
      .run();
  } else {
    editor.chain().focus().insertCalloutContent({
      position: insertPosition,
      text: '高亮快内容'
    }).run();
  }
}
