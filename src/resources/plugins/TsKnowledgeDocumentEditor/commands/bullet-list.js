export default function bulletList({ editor, position, options }) {
  const { isToggle } = options || {};
  const { insertPosition } = position || {};
  if (isToggle) {
    editor.chain().focus().setTextSelection(insertPosition - 1).toggleBulletList().run();
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
