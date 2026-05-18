import { Extension } from '@tiptap/core';
import { RowColSelectedPlugin, RowColSelectedPluginKey } from './row-col-selected-plugin';

export const RowColSelected = Extension.create({
  name: 'rowColSelected',

  addProseMirrorPlugins() {
    return [RowColSelectedPlugin];
  },
  addCommands() {
    return {
      highlightTableRow:
      (tableUuid, rowIndex) =>
        ({ tr, dispatch }) => {
          dispatch(
            tr.setMeta(RowColSelectedPluginKey, {
              active: {
                tableUuid,
                type: 'row',
                index: rowIndex
              }
            })
          );
          return true;
        },
      highlightTableColumn:
        (tableUuid, colIndex) =>
          ({ tr, dispatch }) => {
            dispatch(
              tr.setMeta(RowColSelectedPluginKey, {
                active: {
                  tableUuid,
                  type: 'column',
                  index: colIndex
                }
              })
            );
            return true;
          },
      clearTableHighlight: () => ({tr, dispatch}) => {
        dispatch(tr.setMeta(
          RowColSelectedPluginKey, {
            active: null
          })
        );
        return true;
      }
    };
  }
});
