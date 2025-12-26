export default function orderedList({ editor, position, options }) {
  const { isToggle } = options || {};
  const { insertPosition } = position || {};
  if (isToggle) {
    editor
      .chain()
      .focus()
      .setTextSelection(insertPosition - 1)
      .toggleOrderedList()
      .run();
  } else {
    editor.chain().focus()
      .insertContentAt(insertPosition,
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
