import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import { ReplaceStep } from 'prosemirror-transform';
import utils from '@/resources/assets/js/util';

let isComposing = false;

const REAL_BLOCKS = new Set([
  'paragraph',
  'heading',
  'blockquote',
  'codeBlock',
  'image',
  'insertVideo',
  'horizontalRule',
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
            renderHTML: attrs =>
              attrs.blockUuid ? { 'data-block-uuid': attrs.blockUuid } : {}
          },
          blockType: {
            default: null,
            parseHTML: el => el.getAttribute('data-block-type'),
            renderHTML: attrs =>
              attrs.blockType ? { 'data-block-type': attrs.blockType } : {}
          }
        }
      }
    ];
  },

  // ② 行为层：只在“新 block 出现时”初始化
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

            for (const step of tx.steps) {
              if (!(step instanceof ReplaceStep)) continue;

              const from = tr.mapping.map(step.from);
              const to = tr.mapping.map(step.to);

              newState.doc.nodesBetween(from, to, (node, pos) => {
                if (!node.isBlock) return;
                if (!node.isTextblock) return;
                if (!REAL_BLOCKS.has(node.type.name)) return;
                if (node.attrs.blockUuid) return;

                // 防止 position 炸
                if (pos < 0 || pos + node.nodeSize > newState.doc.content.size) return;

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
            }
          }

          return modified ? tr : null;
        }
      })
    ];
  }
});
