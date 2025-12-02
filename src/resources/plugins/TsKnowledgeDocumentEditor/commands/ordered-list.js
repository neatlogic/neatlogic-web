export default function orderedList({ editor, position, options }) {
  const { isToggle } = options || {};
  if (isToggle) {
    editor
      .chain()
      .focus()
      .toggleOrderedList()
      .run();
  } else {
    editor.chain().focus()
      .insertContentAt(position,
        {
          type: 'orderedList',
          content: [
            { type: 'listItem',
              content: [
                { type: 'paragraph', content: [] }
              ] 
            }
          ]
        }
      ).run();
  }
}
