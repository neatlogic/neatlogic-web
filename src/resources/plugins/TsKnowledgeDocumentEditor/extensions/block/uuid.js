import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import { ReplaceStep } from 'prosemirror-transform';
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
  'insertVideo',
  'highlightBlock'
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
        
          for (const tx of transactions) {
            if (!tx.docChanged) continue;
        
            for (const stepMap of tx.mapping.maps) {
              stepMap.forEach((oldStart, oldEnd, newStart, newEnd) => {
                if (newEnd <= newStart) return;
        
                newState.doc.nodesBetween(newStart, newEnd, (node, pos) => {
                  if (!node.isBlock) return;
                  if (!REAL_BLOCKS.has(node.type.name)) return;
                  if (node.attrs.blockUuid) return;
        
                  tr.setNodeMarkup(pos, node.type, {
                    ...node.attrs,
                    blockUuid: utils.setUuid(),
                    blockType:
                      node.type.name === 'heading'
                        ? `heading${node.attrs.level}`
                        : node.type.name
                  });
        
                  modified = true;
                });
              });
            }
          }
        
          return modified ? tr : null;
        }
      })
    ];
  }
});
