import { TableMap, CellSelection, splitCell as proseSplitCell } from 'prosemirror-tables';
import { findTablePosByUuid } from './utils.js';

export default function splitCell({ editor, options }) {
  const { nodeAttrs = {}, index, type = '' } = options || {};
  const tableUuid = nodeAttrs.blockUuid;

  if (index == null || !tableUuid) return;

  let guard = 0;

  while (guard++ < 100) {
    let found = false;

    const view = getEditorView(editor);
    if (!view) return;
    const { state } = editor;

    const tablePos = findTablePosByUuid(state.doc, tableUuid);
    if (tablePos == null) return;

    const tableNode = state.doc.nodeAt(tablePos);
    if (!tableNode) return;

    const map = TableMap.get(tableNode);

    if (type == 'column') {
      for (let row = 0; row < map.height; row++) {
        const cellIndex = row * map.width + index;
        const cellPos = map.map[cellIndex];
        const cell = tableNode.nodeAt(cellPos);
  
        if (!cell) continue;
  
        const { attrs = {} } = cell || {};
        const { rowspan, colspan } = attrs || {};
  
        if (colspan > 1) {
          // 处理跨列的情况
          const tr = state.tr;
          const $pos = tr.doc.resolve(tablePos + cellPos + 1);
  
          tr.setSelection(new CellSelection($pos));
          view.dispatch(tr);
  
          proseSplitCell(view.state, view.dispatch);
          found = true;
          break;
        } else if (rowspan > 1) {
          // 处理跨行的情况
          const tr = state.tr;
          const $pos = tr.doc.resolve(tablePos + cellPos + 1);
  
          tr.setSelection(new CellSelection($pos));
          view.dispatch(tr);
  
          proseSplitCell(view.state, view.dispatch);
          found = true;
          break;
        }
      }
    } else if (type == 'row') {
      for (let col = 0; col < map.width; col++) {
        const cellIndex = index * map.width + col;
        const cellPos = map.map[cellIndex];
        const cell = tableNode.nodeAt(cellPos);
    
        if (!cell) continue;
    
        const { attrs = {} } = cell || {};
        const { rowspan, colspan } = attrs || {};
    
        if (rowspan > 1) {
          // 处理有跨行的情况
          let tr = state.tr;
          const $pos = tr.doc.resolve(tablePos + cellPos + 1);
    
          tr.setSelection(new CellSelection($pos));
          view.dispatch(tr);
    
          proseSplitCell(view.state, view.dispatch);
          found = true;
          break;
        } else if (colspan > 1) {
          // 处理有跨列的情况
          let tr = state.tr;
          const $pos = tr.doc.resolve(tablePos + cellPos + 1);
    
          tr.setSelection(new CellSelection($pos));
          view.dispatch(tr);
    
          proseSplitCell(view.state, view.dispatch);
          found = true;
          break;
        }
      }
    }

    if (!found) break;
  }
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
