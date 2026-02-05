import { Extension } from '@tiptap/core';
import { TableMap, deleteColumn, deleteRow } from 'prosemirror-tables';
import { TextSelection } from 'prosemirror-state';

/**
 * 根据 uuid 查找 table 节点
 */
export function findTableByUuid(state, uuid) {
  let result = null;

  state.doc.descendants((node, pos) => {
    if (
      node.type.name === 'table' &&
      node.attrs?.['blockUuid'] === uuid
    ) {
      result = { node: node, pos: pos };
      return false; // 停止遍历
    }
  });

  return result;
}

/**
 * 根据 uuid 获取表格行列数
 */
function getTableSizeByUuid(editor, uuid) {
  if (!editor || !uuid) return null;

  const { node } = findTableByUuid(editor.state, uuid) || {};
  if (!node) return null;

  const map = TableMap.get(node);

  return {
    rows: map.width,
    cols: map.height,
    colsWidthList: getColumnWidthsFromTableNode(node)
  };
}

function getColumnWidthsFromTableNode(tableNode) {
  // 获取列宽
  const map = TableMap.get(tableNode);
  const colWidths = new Array(map.width);

  const firstRow = tableNode.firstChild;
  if (!firstRow) return colWidths;

  let colIndex = 0;

  firstRow.forEach(cell => {
    const colspan = cell.attrs.colspan || 1;
    const widths = cell.attrs.colwidth;

    // 你的前提：widths 一定存在，且长度 = colspan
    for (let i = 0; i < colspan; i++) {
      colWidths[colIndex + i] = widths[i];
    }

    colIndex += colspan;
  });

  return colWidths;
}

// 根据 uuid 和列索引删除列
export function deleteColumnByUuid(editor, uuid, colIndex) {
  const { state, view } = editor;

  const tableInfo = findTableByUuid(state, uuid);
  if (!tableInfo) return;

  const { node: tableNode, pos: tablePos } = tableInfo;
  const map = TableMap.get(tableNode);

  // 取第一行该列的 cell
  const cellIndex = map.map[colIndex];
  if (cellIndex == null) return;

  const cellPos = tablePos + 1 + cellIndex;
  if (map.width === 1) {
    // 如果只有一列，直接删除整个表格
    const tr = state.tr.delete(
      tablePos,
      tablePos + tableNode.nodeSize
    );
    view.dispatch(tr);
    return;
  }
  const selection = TextSelection.near(
    state.doc.resolve(cellPos)
  );
  
  const nextState = state.apply(
    state.tr.setSelection(selection)
  );
  
  deleteColumn(nextState, view.dispatch);
}
/**
 * 根据 uuid 删除表格中的指定行
 */
export function deleteRowByUuid(editor, uuid, rowIndex) {
  const { state, view } = editor;

  const tableInfo = findTableByUuid(state, uuid);
  if (!tableInfo) return;

  const { node: tableNode, pos: tablePos } = tableInfo;
  const map = TableMap.get(tableNode);

  // 1. 检查是否为最后一行 (边界条件)
  if (map.height === 1) {
    // 如果只有一行，直接删除整个表格
    const tr = state.tr.delete(
      tablePos,
      tablePos + tableNode.nodeSize
    );
    view.dispatch(tr);
    return;
  }
  
  // TableMap.map 数组的索引计算公式：rowIndex * map.width + colIndex
  const cellIndexInMap = rowIndex * map.width + 0; // 第一个单元格
  const cellOffset = map.map[cellIndexInMap];
  
  // 如果该位置无效 (例如该位置被 rowspan 覆盖，但通常在标准表格中不会)
  if (cellOffset == null) return; 
  const cellPos = tablePos + 1 + cellOffset;

  const selection = TextSelection.near(
    state.doc.resolve(cellPos)
  );
  // 4. 将选择区应用到新的事务状态
  const nextState = state.apply(
    state.tr.setSelection(selection)
  );
  deleteRow(nextState, view.dispatch);
}

export const TableUtils = Extension.create({
  name: 'TableUtils',

  onCreate() {
    // 确保 editorData 存在
    if (!this.editor.editorData) {
      this.editor.editorData = {};
    }

    // 挂载实例方法
    this.editor.editorData.getTableSizeByUuid = (uuid) =>
      getTableSizeByUuid(this.editor, uuid);
  }
});
