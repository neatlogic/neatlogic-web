import { mergeCells } from 'prosemirror-tables';
import { getCellSelectionByIndex } from './utils.js';

export default function mergeCell({ editor, options }) {
  // 合并单元格
  getCellSelectionByIndex({editor: editor, options: options});

  const { view } = editor;

  // 合并
  mergeCells(view.state, view.dispatch);
}
