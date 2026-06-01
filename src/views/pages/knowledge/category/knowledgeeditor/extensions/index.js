import Video from './video';
import File from './file';
import Callout from './callout';
import { BlockUuid } from './block/uuid.js';
import { BlockStyle } from './block/style.js';
import { TableCellBackground } from './table/cell-style/add-background-command.js';
import { TableCellVerticalAlign } from './table/cell-style/add-vertical-align-command.js';
import { ExtendTableCell, ExtendTableHeader } from './table/cell-style/extend-cell-attr.js';
import { TableStyle } from './table/style.js';
import { RewriteUuidOnPaste } from '@/views/pages/knowledge/category/knowledgeeditor/extensions/paste/rewrite-uuid.js';
import { PasteMarkdown } from '@/views/pages/knowledge/category/knowledgeeditor/extensions/paste/markdown.js';
import { Rate } from './rate.js';
import { CompareBlockAttrs, CompareMark } from './compare-mark.js';
export default [
  Video,
  File,
  Callout,
  BlockUuid,
  BlockStyle,
  CompareBlockAttrs,
  CompareMark,
  TableStyle,
  TableCellBackground,
  ExtendTableCell,
  ExtendTableHeader,
  TableCellVerticalAlign,
  Rate,
  PasteMarkdown,
  RewriteUuidOnPaste
];
