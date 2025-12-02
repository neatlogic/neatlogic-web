export default function taskList({ editor, position, options }) {
  const { isToggle } = options || {};
  if (isToggle) {
    editor.chain().focus().toggleTaskList().run();
  } else {
    editor.chain().focus().insertContentAt(position, {
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
