export default function heading({ editor, position, options, vueInstance }) {
  const { level, isToggle, isReplace } = options || {};
  if (isToggle) {
    // 切换标题，光标在当前标题时，这个方法才会生肖
    editor.chain().focus().toggleHeading({ level }).run();
  } else if (isReplace) {
    vueInstance.transformBlockType({ nodeType: 'heading', attrs: {level: level} });
  } else {
    editor
      .chain()
      .focus()
      .insertContentAt(position, {
        type: 'heading',
        attrs: { level: level, 'data-type': `heading${level}`},
        content: [{ type: 'text', text: `新标题${level}内容` }]
      })
      .run();
  }
}
