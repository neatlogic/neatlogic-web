import { Extension } from '@tiptap/core';
import { TableMap } from 'prosemirror-tables';
import { findTablePosByUuid } from '@/resources/plugins/TsKnowledgeDocumentEditor/commands/table/utils.js';

export const TableCellVerticalAlign = Extension.create({
  name: 'tableCellVerticalAlign',

  addCommands() {
    return {
      setCellVerticalAlign:
        ({ rowColIndex, verticalAlign, tableUuid, type = '' }) =>
          ({ state, dispatch }) => {
            if (!tableUuid || !verticalAlign) return false;

            const tablePos = findTablePosByUuid(state.doc, tableUuid);
            if (tablePos == null) return false;

            const tableNode = state.doc.nodeAt(tablePos);
            if (!tableNode) return false;

            const map = TableMap.get(tableNode);

            if (type === 'row') {
              if (rowColIndex < 0 || rowColIndex >= map.height) return false;
            } else if (type === 'column') {
              if (rowColIndex < 0 || rowColIndex >= map.width) return false;
            }

            const tr = state.tr;

            if (type === 'row') {
              for (let col = 0; col < map.width; col++) {
                const cellIndex = rowColIndex * map.width + col;
                const cellPos = map.map[cellIndex];
                const cell = tableNode.nodeAt(cellPos);
                if (!cell) continue;

                tr.setNodeMarkup(tablePos + cellPos + 1, undefined, {
                  ...cell.attrs,
                  verticalAlign
                });
              }
            } else if (type === 'column') {
              for (let row = 0; row < map.height; row++) {
                const cellIndex = row * map.width + rowColIndex;
                const cellPos = map.map[cellIndex];
                const cell = tableNode.nodeAt(cellPos);
                if (!cell) continue;

                tr.setNodeMarkup(tablePos + cellPos + 1, undefined, {
                  ...cell.attrs,
                  verticalAlign
                });
              }
            }

            dispatch(tr);
            return true;
          }
    };
  }
});
