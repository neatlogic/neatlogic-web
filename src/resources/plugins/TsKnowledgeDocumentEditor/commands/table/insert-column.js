import { findTablePosByUuid } from './utils.js';
import {
  addColumnBefore,
  addColumnAfter,
  TableMap,
  CellSelection 
} from 'prosemirror-tables';

export default function insertColumn({ editor, options }) {
  const {
    nodeAttrs = {},
    index: columnIndex,
    direction = 'right',
    colWidth = 100
  } = options || {};

  const tableUuid = nodeAttrs.blockUuid;
  const { state, view } = editor;

  if (!tableUuid || typeof columnIndex !== 'number') return;

  const tablePos = findTablePosByUuid(state.doc, tableUuid);
  if (tablePos == null) return;

  const tableNode = state.doc.nodeAt(tablePos);
  if (!tableNode) return;

  const map = TableMap.get(tableNode);
  if (columnIndex < 0 || columnIndex >= map.width) return;

  // 强制设置 selection，正常执行 command

  let tr = state.tr;
  tr = setSelectionToColumn(state, tr, tablePos, columnIndex);
  view.dispatch(tr);

  const command =
    direction === 'left'
      ? addColumnBefore
      : addColumnAfter;

  command(editor.state, view.dispatch);

  // 给新插入的列设置 colwidth

  const afterState = editor.state;
  const tableNodeAfter = afterState.doc.nodeAt(tablePos);
  if (!tableNodeAfter) return;

  const mapAfter = TableMap.get(tableNodeAfter);

  const newColIndex =
    direction === 'left'
      ? columnIndex
      : columnIndex + 1;

  const tableStart = tablePos + 1;
  let widthTr = afterState.tr;

  mapAfter.map.forEach((cellOffset, index) => {
    const col = index % mapAfter.width;
    if (col !== newColIndex) return;

    const cellPos = tableStart + cellOffset;
    const cellNode = widthTr.doc.nodeAt(cellPos);
    if (!cellNode) return;

    widthTr.setNodeMarkup(cellPos, undefined, {
      ...cellNode.attrs,
      colwidth: [colWidth]
    });
  });

  view.dispatch(widthTr);
}
function setSelectionToColumn(state, tr, tablePos, colIndex) {
  const tableNode = state.doc.nodeAt(tablePos);
  if (!tableNode) return tr;

  const map = TableMap.get(tableNode);
  const cellOffset = map.map[colIndex];
  if (cellOffset == null) return tr;

  const cellPos = tablePos + 1 + cellOffset;

  return tr.setSelection(
    CellSelection.create(
      tr.doc,
      cellPos
    )
  );
}
