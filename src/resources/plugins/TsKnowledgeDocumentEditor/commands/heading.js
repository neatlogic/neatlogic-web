export default function heading({ editor, position, options }) {
  const { level, isToggle } = options || {};
  if (isToggle) {
    editor.chain().focus().toggleHeading({ level }).run();
  } else {
    editor
      .chain()
      .focus()
      .insertContentAt(position, {
        type: 'heading',
        attrs: { level },
        content: [{ type: 'text', text: `新标题${level}内容` }]
      })
      .run();
  }
}
