export default function link({ editor, position, options }) {
  const { linkUrl = '', linkText = '', isToggle } = options || {};
  const { endPosition } = position || {};
  if (isToggle) {
    editor.chain()
      .focus()
      .setTextSelection(endPosition - 1)
      .extendMarkRange('link')
      .setLink({ href: linkUrl })
      .run();
  } else {
    editor.chain().focus().insertContentAt(position, [
      {
        type: 'text',
        text: linkText,
        marks: [
          {
            type: 'link',
            attrs: { href: linkUrl }
          }
        ]
      }
    ]
    ).run();
  }
}
