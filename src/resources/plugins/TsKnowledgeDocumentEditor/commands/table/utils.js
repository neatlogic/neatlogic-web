import { TableMap, CellSelection } from 'prosemirror-tables';

export function findTablePosByUuid(doc, tableUuid) {
  let result = null;
  if (!doc) {
    return null;
  }
  doc.descendants((node, pos) => {
    if (node.type.name === 'table' && node.attrs && node.attrs['data-uuid'] === tableUuid) {
      result = pos;
      return false;
    }
  });

  return result;
}

export function getCellSelectionByIndex({editor, options }) {
  // 根据行列的索引获取选区
  const {
    nodeAttrs = {},
    index: rowColIndex,
    type = '' // row || column
  } = options || {};

  const tableUuid = nodeAttrs['data-uuid'];
  const { state, view } = editor;

  if (tableUuid) {
    const tablePos = findTablePosByUuid(state.doc, tableUuid);
    if (tablePos) {
      const tableNode = state.doc.nodeAt(tablePos);
      if (tableNode) {
        const map = TableMap.get(tableNode);
    
        let fromIndex = null;
        let toIndex = null;
    
        if (type == 'row') {
        // 行的起始位置
          fromIndex = rowColIndex * map.width;
          toIndex = fromIndex + map.width - 1;
        } else if (type == 'column') {
        // 列的起始位置
          fromIndex = rowColIndex; // 列的第一个 cell
          toIndex = rowColIndex + map.width * (map.height - 1); // 列的最后一个 cell
        }
    
        const fromCellPos = map.map[fromIndex];
        const toCellPos = map.map[toIndex];
    
        const tr = state.tr;
    
        const $anchor = tr.doc.resolve(tablePos + fromCellPos + 1);
        const $head = tr.doc.resolve(tablePos + toCellPos + 1);
    
        // 最后设置 selection
        tr.setSelection(new CellSelection($anchor, $head));
        view.dispatch(tr);
      }
    }
  }
}
