export default function heading({ editor, position, options, vueInstance }) {
  const { level, isToggle } = options || {};
  const { endPosition, insertPosition } = position || {};
  if (isToggle) {
    editor.chain().focus().setTextSelection(endPosition - 1).toggleHeading({ level: level }).run();
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
