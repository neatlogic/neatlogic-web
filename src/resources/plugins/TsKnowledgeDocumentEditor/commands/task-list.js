export default function taskList({ editor, position, options }) {
  const { isToggle } = options || {};
  const { insertPosition } = position || {};
  if (isToggle) {
    editor.chain().focus().setTextSelection(insertPosition - 1).toggleTaskList().run();
  } else {
    editor.chain().focus().insertContentAt(insertPosition, {
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
