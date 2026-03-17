import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { DOMParser } from 'prosemirror-model';
import { Table, TableRow, TableHeader } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';

import utils from '@/resources/assets/js/util.js';
import { transformTableDom } from './transform-table-dom';
import { TableAttrs } from './table-attrs';
import { Rate } from '@/resources/plugins/TsKnowledgeDocumentEditor/extensions/rate.js';

export function createEditorFromDom(dom) {
  const cloned = dom.cloneNode(true);
  transformTableDom(cloned);

  const editor = new Editor({
    extensions: [
      Rate,
      StarterKit,
      Table,
      TableRow,
      TableCell,
      TableHeader,
      TableAttrs
    ],
    content: ''
  });

  const resultJSON = domToPMJSON(editor, cloned);
  console.log('DOM', cloned);
  console.log('JSON', resultJSON);
  return resultJSON; 
}

function domToPMJSON(editor, clonedDom) {
  const schema = editor.schema;
  const doc = DOMParser.fromSchema(schema).parse(clonedDom);
  doc.descendants((node) => {
    if (node.type.name === 'table' && !node.attrs.blockUuid) {
      node.attrs.blockUuid = utils.setUuid(); // 设置顶层表格的全局属性
      node.attrs.blockType = 'table';
    }
  });
  return doc.toJSON();
}
