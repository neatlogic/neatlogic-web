function isTextblockPosition(editor, position) {
  try {
    return !!editor.state.doc.resolve(position).parent?.isTextblock;
  } catch (error) {
    return false;
  }
}

function setHorizontalRuleAt(editor, position) {
  return editor
    .chain()
    .focus()
    .setTextSelection(position)
    .setHorizontalRule()
    .run();
}

export default function divider({ editor, position, options }) {
  const { isToggle } = options || {};
  const { insertPosition } = position || {};
  const nextPosition = Number.isInteger(insertPosition) ? insertPosition : editor.state.selection.from;
  if (isToggle) {
    editor
      .chain()
      .focus()
      .setHorizontalRule()
      .run();
  } else {
    if (isTextblockPosition(editor, nextPosition) && setHorizontalRuleAt(editor, nextPosition)) {
      return;
    }
    const inserted = editor
      .chain()
      .focus()
      .insertContentAt(nextPosition, {
        type: 'horizontalRule'
      })
      .run();
    if (!inserted) {
      setHorizontalRuleAt(editor, nextPosition);
    }
  }
}
