export default function bulletList({ editor, position, options }) {
  const { isToggle } = options || {};
  if (isToggle) {
    editor.chain().focus().toggleBulletList().run();
  } else {
    editor.chain().focus().insertContentAt(position, {
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
