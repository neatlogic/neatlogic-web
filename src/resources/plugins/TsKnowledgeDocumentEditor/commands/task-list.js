export default function taskList({ editor, position, options }) {
  const { isToggle } = options || {};
  const { endPosition } = position || {};
  if (isToggle) {
    editor.chain().focus().setTextSelection(endPosition - 1).toggleTaskList().run();
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
