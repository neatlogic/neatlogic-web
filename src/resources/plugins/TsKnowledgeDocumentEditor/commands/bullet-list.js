export default function bulletList({ editor, position, options, vueInstance }) {
  const { isToggle } = options || {};
  const { endPosition, insertPosition } = position || {};
  if (isToggle) {
    editor.chain().focus().setTextSelection(endPosition - 1).toggleBulletList().run();
  } else {
    editor.chain().focus().insertContentAt(insertPosition, {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [] }
          ]
        }
      ]
    }).run();
  }
}
