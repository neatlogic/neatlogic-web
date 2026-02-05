import {
  addRowBefore,
  addRowAfter,
  TableMap,
  CellSelection
} from 'prosemirror-tables';
import { findTablePosByUuid } from './utils.js';
export default function insertRow({ editor, options }) {
  const {
    nodeAttrs = {},
    index: rowIndex,
    direction = 'bottom' // top | bottom
  } = options || {};

  const tableUuid = nodeAttrs.blockUuid;
  const { state, view } = editor;

  if (!tableUuid || typeof rowIndex !== 'number') return;

  // 1️⃣ 通过 uuid 定位 table
  const tablePos = findTablePosByUuid(state.doc, tableUuid);
  if (tablePos == null) return;

  const tableNode = state.doc.nodeAt(tablePos);
  if (!tableNode) return;

  const map = TableMap.get(tableNode);
  if (rowIndex < 0 || rowIndex >= map.height) return;

  // 2️⃣ 强制设置 selection 到目标行
  let tr = state.tr;
  tr = setSelectionToRow(state, tr, tablePos, rowIndex);
  view.dispatch(tr);

  // 3️⃣ 执行插入行 command
  const command =
    direction === 'top'
      ? addRowBefore
      : addRowAfter;

  command(editor.state, view.dispatch);
}
function setSelectionToRow(state, tr, tablePos, rowIndex) {
  const tableNode = state.doc.nodeAt(tablePos);
  if (!tableNode) return tr;

  const map = TableMap.get(tableNode);
  const tableStart = tablePos + 1;

  const rowStartIndex = rowIndex * map.width;

  const firstCellOffset = map.map[rowStartIndex];
  const lastCellOffset =
    map.map[rowStartIndex + map.width - 1];

  if (
    firstCellOffset == null ||
    lastCellOffset == null
  ) {
    return tr;
  }

  const from = tableStart + firstCellOffset;
  const to = tableStart + lastCellOffset;

  return tr.setSelection(
    CellSelection.create(tr.doc, from, to)
  );
}
