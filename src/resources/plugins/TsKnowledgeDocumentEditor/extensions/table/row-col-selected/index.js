import { Extension } from '@tiptap/core';
import { RowColSelectedPlugin } from './row-col-selected-plugin';

export const RowColSelected = Extension.create({
  name: 'rowColSelected',

  addProseMirrorPlugins() {
    return [RowColSelectedPlugin];
  }
});
