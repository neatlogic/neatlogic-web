import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import utils from '@/resources/assets/js/util.js';

export const AutoUuid = Extension.create({
  name: 'autoUuid',
  // 给所有 block 节点加全局属性
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'taskList', 'taskItem', 'blockquote', 'codeBlock', 'divider', 'container', 'image', 'video', 'iframe', 'table', 'tableRow', 'tableCell', 'tableHeader', 'customBlock'], // 系统所有 block 类型
        attributes: {
          uuid: {
            default: null
          }
        }
      }
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        // appendTransaction 在节点内容变更或者插入内容的时候触发
        appendTransaction: (transactions, oldState, newState) => {
          let tr = newState.tr;
          let modified = false;
          // 遍历当前编辑器最新状态（newState）下的所有文档节点
          newState.doc.descendants((node, pos) => {
            // 只给块级节点加 uuid（比如 paragraph、heading、list_item等）
            if (node.type.isBlock && !node?.attrs?.uuid) {
              tr = tr.setNodeMarkup(pos, node?.type, {
                ...(node.attrs || {}),
                uuid: utils.setUuid()
              });
              modified = true;
            }
          });

          return modified ? tr : null;
        }
      })
    ];
  }
});
