export default function taskList({ editor, pos, options }) {
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
