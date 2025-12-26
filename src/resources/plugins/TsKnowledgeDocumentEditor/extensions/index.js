import InsertVideo from './insert-video';
import HighlightBlock from './highlight-block';
import { BlockUuid } from './block/uuid.js';
import { BlockStyle } from './block/style.js';
import { TableCellBackground } from './table/cell-style/add-background-command.js';
import { TableCellVerticalAlign } from './table/cell-style/add-vertical-align-command.js';
import { ExtendTableCell } from './table/cell-style/extend-cell-attr.js';
export default [
  InsertVideo,
  HighlightBlock,
  BlockUuid,
  BlockStyle,
  TableCellBackground,
  ExtendTableCell,
  TableCellVerticalAlign
];
