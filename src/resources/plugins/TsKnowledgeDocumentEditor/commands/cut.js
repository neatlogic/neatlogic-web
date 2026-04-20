import { NodeSelection } from 'prosemirror-state';
export default function cut({ editor, position, options }) {
  const { startPosition } = position || {};
  const view = getEditorView(editor);
  if (!view || startPosition == null) return;
  const { state } = view;

  const tr = state.tr.setSelection(
    NodeSelection.create(state.doc, startPosition)
  );
  view.focus();
  view.dispatch(tr);

  document.execCommand('cut');
}

function getEditorView(editor) {
  if (!editor || editor.isDestroyed) {
    return null;
  }
  try {
    return editor.view || null;
  } catch (error) {
    return null;
  }
}
