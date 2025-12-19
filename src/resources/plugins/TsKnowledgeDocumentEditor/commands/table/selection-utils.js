import { findParentNodeClosestToPos } from '@tiptap/core';
import { splitCell } from 'prosemirror-tables';

/**
 * 获取当前 selection 所在的 tableCell
 */
export function getSelectedTableCell(editor) {
  const { selection } = editor.state;

  return findParentNodeClosestToPos(
    selection.$from,
    node => node.type.name === 'tableCell'
  );
}

/**
 * 是否是合并过的单元格
 */
export function isMergedCell(editor) {
  const cell = getSelectedTableCell(editor);
  if (!cell) return false;

  const { colspan = 1, rowspan = 1 } = cell.node.attrs;
  return colspan > 1 || rowspan > 1;
}

/**
 * 拆分当前单元格（安全方式）
 */
export function splitCurrentCell(editor) {
  return editor
    .chain()
    .command(({ state, dispatch }) => {
      return splitCell(state, dispatch);
    })
    .run();
}
