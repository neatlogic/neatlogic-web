export default function taskList({ editor, pos, options }) {
  const { isToggle } = options || {};
  if (isToggle) {
    editor.chain().focus().toggleTaskList().run();
  } else {
    editor.chain().focus().insertContentAt(pos, {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [{ type: 'paragraph' }]
        }
      ]
    }).run();
  }
}
