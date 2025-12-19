import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { TableMap } from 'prosemirror-tables';

export const RowColSelectedPluginKey =
  new PluginKey('row-col-selected-plugin');

export const RowColSelectedPlugin = new Plugin({
  key: RowColSelectedPluginKey,

  state: {
    init() {
      return {
        hover: { tableUuid: null, index: null, type: null }, // 'column' | 'row'
        active: { tableUuid: null, index: null, type: null }
      };
    },

    apply(tr, value) {
      const meta = tr.getMeta(RowColSelectedPluginKey);
      return meta || value;
    }
  },

  props: {
    decorations(state) {
      const pluginState = RowColSelectedPluginKey.getState(state);
      if (!pluginState) return null;

      const { hover, active } = pluginState;
      const target = active?.tableUuid ? active : hover;
      const { tableUuid, type, index } = target || {};
      if (!tableUuid || !type) return null;

      const decorations = [];

      state.doc.descendants((node, pos) => {
        if (node.type.name !== 'table') return;
        
        if (node.attrs['data-uuid'] !== tableUuid) return;

        const map = TableMap.get(node);

        if (type === 'column') {
          decorateColumn({
            state,
            decorations,
            tablePos: pos,
            map,
            colIndex: index,
            className: tableUuid
              ? 'table-col-active'
              : 'table-col-hover'
          });
        }
        if (type === 'row') {
          decorateRow({
            state,
            decorations,
            tablePos: pos,
            map,
            rowIndex: index,
            className: tableUuid
              ? 'table-row-active'
              : 'table-row-hover'
          });
        }
        return false;
      });
      return DecorationSet.create(state.doc, decorations);
    }
  }
});

function decorateColumn({
  state,
  decorations,
  tablePos,
  map,
  colIndex,
  className
}) {
  for (let row = 0; row < map.height; row++) {
    const index = row * map.width + colIndex;
    pushCellDecoration(
      state,
      decorations,
      tablePos,
      map,
      index,
      className
    );
  }
}

function decorateRow({
  state,
  decorations,
  tablePos,
  map,
  rowIndex,
  className
}) {
  for (let col = 0; col < map.width; col++) {
    const index = rowIndex * map.width + col;
    pushCellDecoration(
      state,
      decorations,
      tablePos,
      map,
      index,
      className
    );
  }
}
function pushCellDecoration(
  state,
  decorations,
  tablePos,
  map,
  index,
  className
) {
  const cellPos = map.map[index];
  if (cellPos == null) return;

  const from = tablePos + 1 + cellPos;
  const cell = state.doc.nodeAt(from);
  if (!cell) return;

  decorations.push(
    Decoration.node(from, from + cell.nodeSize, {
      class: className
    })
  );
}
