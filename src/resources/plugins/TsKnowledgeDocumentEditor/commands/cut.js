import { NodeSelection } from 'prosemirror-state';
export default function cut({ editor, position, options }) {
  const { startPosition } = position || {};
  const view = editor.view;
  const { state } = view;

  const tr = state.tr.setSelection(
    NodeSelection.create(state.doc, startPosition)
  );
  view.focus();
  view.dispatch(tr);

  document.execCommand('cut');
}
