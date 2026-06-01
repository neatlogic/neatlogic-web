import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import utils from '@/resources/assets/js/util';

let isComposing = false;

const REAL_BLOCKS = new Set([
  'paragraph',
  'heading',
  'blockquote',
  'bulletList',
  'orderedList',
  'listItem',
  'taskList',
  'taskItem',
  'codeBlock',
  'horizontalRule',
  'table',
  'image',
  'video',
  'file',
  'callout'
]);

export const BlockUuid = Extension.create({
  name: 'blockUuid',

  // ① schema 层：声明属性
  addGlobalAttributes() {
    return [
      {
        types: Array.from(REAL_BLOCKS),
        attributes: {
          blockUuid: {
            default: null,
            parseHTML: el => el.getAttribute('data-block-uuid'),
            renderHTML: attrs => (attrs.blockUuid ? { 'data-block-uuid': attrs.blockUuid } : {})
          },
          blockType: {
            default: null,
            parseHTML: el => el.getAttribute('data-block-type'),
            renderHTML: attrs => (attrs.blockType ? { 'data-block-type': attrs.blockType } : {})
          }
        }
      }
    ];
  },

  // ② 行为层：新 block 出现时初始化
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            compositionstart() {
              isComposing = true;
              return false;
            },
            compositionend() {
              isComposing = false;
              return false;
            }
          }
        },
        appendTransaction(transactions, oldState, newState) {
          if (isComposing) return null;
        
          let tr = newState.tr;
          let modified = false;
          const seenBlockUuid = new Set();
        
          if (!transactions.some(tx => tx.docChanged)) {
            return null;
          }

          newState.doc.descendants((node, pos) => {
            if (!node.isBlock || !REAL_BLOCKS.has(node.type.name)) {
              return;
            }

            const currentUuid = node.attrs.blockUuid;
            const expectedBlockType =
              node.type.name === 'heading'
                ? `heading${node.attrs.level}`
                : node.type.name;
            const isDuplicateUuid = currentUuid && seenBlockUuid.has(currentUuid);
            // 历史数据、拖拽或外部转换可能带入重复 uuid；统一在编辑器层修正，避免目录和块级命令定位冲突。
            if (currentUuid && !isDuplicateUuid && node.attrs.blockType === expectedBlockType) {
              seenBlockUuid.add(currentUuid);
              return;
            }

            const nextUuid = isDuplicateUuid || !currentUuid ? utils.setUuid() : currentUuid;
            seenBlockUuid.add(nextUuid);
            tr.setNodeMarkup(pos, node.type, {
              ...node.attrs,
              blockUuid: nextUuid,
              blockType: expectedBlockType
            });
            modified = true;
          });
        
          return modified ? tr : null;
        }
      })
    ];
  }
});
